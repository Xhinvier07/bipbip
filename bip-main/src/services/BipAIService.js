// BipAI Service - Integrates Gemini API with system data to provide intelligent analysis
import { fetchMainSheetData, fetchTransactionData } from '../pages/Dashboard/GoogleSheetsService';
import { generateGeminiResponse } from '../pages/Dashboard/GeminiService';
import { formatResponseText, shouldShowVisualization } from './AIFormattingGuide';

// Cache for analytics results - using a shorter expiration to ensure fresh data
let analyticsCache = {
  branchPerformance: null,
  transactionTrends: null,
  waitTimeAnalysis: null,
  staffUtilization: null,
  lastAnalysis: null,
  cacheExpiration: 30 * 1000 // 30 seconds - ensure we get fresh data frequently
};

/**
 * Main function to generate AI responses with data access
 * @param {string} userQuery - The user's query
 * @param {Array} history - Conversation history
 * @returns {Object} - Response with text, data, and visualizations
 */
export const generateBipResponse = async (userQuery, history = []) => {
  try {
    // First, check if we need to analyze data based on the query
    const dataAnalysis = await analyzeDataForQuery(userQuery);
    
    // Create a context-enhanced prompt that includes data analysis
    const enhancedPrompt = createEnhancedPrompt(userQuery, dataAnalysis);
    
    // Pass the enhanced prompt to Gemini
    const geminiResponse = await generateGeminiResponse(enhancedPrompt, history);
    
    // Format the response text to highlight important information using HTML
    const formattedText = formatResponseText(geminiResponse.text);
    
    // Check if visualization should be shown based on user query
    const showVisualization = shouldShowVisualization(userQuery);
    
    // Parse visualization data from the response only if visualization is requested
    const visualization = showVisualization ? 
      extractVisualizationData(geminiResponse.text, geminiResponse.data, dataAnalysis) : null;
    
    return {
      text: formattedText,
      data: geminiResponse.data,
      visualization: visualization,
      rawAnalysis: dataAnalysis // For debugging, can be removed in production
    };
  } catch (error) {
    console.error('Error generating BIP response:', error);
    return {
      text: "I'm sorry, I encountered an error analyzing the data. Please try again later.",
      data: null,
      visualization: null
    };
  }
};

/**
 * Creates an enhanced prompt with data context for the AI
 */
const createEnhancedPrompt = (userQuery, dataAnalysis) => {
  // Start with the original query
  let prompt = userQuery;
  
  // If we have relevant data analysis, add it to the prompt
  if (dataAnalysis) {
    prompt += `\n\nHere is some relevant data from our system:\n`;
    
    if (dataAnalysis.relevantBranches && dataAnalysis.relevantBranches.length > 0) {
      prompt += `\nRelevant branch data:\n${JSON.stringify(dataAnalysis.relevantBranches, null, 2)}\n`;
    }
    
    if (dataAnalysis.transactionInsights) {
      // If we have a specific question about highest transaction count
      if (userQuery.toLowerCase().includes("highest transaction") || 
          userQuery.toLowerCase().includes("most transactions")) {
        
        // Directly provide the highest transaction branch if available
        if (dataAnalysis.transactionInsights.highestTransactionBranch) {
          const branch = dataAnalysis.transactionInsights.highestTransactionBranch;
          prompt += `\nThe branch with the highest transaction count is "${branch.branch_name}" with ${branch.count} transactions. `;
          prompt += `This branch is located in ${branch.city || 'N/A'}, has a BHS (Branch Health Score) of ${branch.bhs || 'N/A'}, `;
          prompt += `and an average waiting time of ${branch.avg_waiting_time || 'N/A'} minutes.\n`;
        }
        
        // Also provide the top 5 branches by transaction count
        if (dataAnalysis.transactionInsights.branchVolumeRanking && 
            dataAnalysis.transactionInsights.branchVolumeRanking.length > 0) {
          prompt += `\nTop 5 branches by transaction count:\n`;
          dataAnalysis.transactionInsights.branchVolumeRanking.slice(0, 5).forEach((branch, index) => {
            prompt += `${index + 1}. ${branch.branch_name} (${branch.city || 'N/A'}): ${branch.count} transactions, BHS: ${branch.bhs || 'N/A'}, Avg Wait: ${branch.avg_waiting_time || 'N/A'} min\n`;
          });
        }
      } else {
        // For other transaction-related queries, provide the full insights
        prompt += `\nTransaction insights:\n${JSON.stringify(dataAnalysis.transactionInsights, null, 2)}\n`;
      }
    }
    
    if (dataAnalysis.waitTimeStats) {
      prompt += `\nWait time statistics:\n${JSON.stringify(dataAnalysis.waitTimeStats, null, 2)}\n`;
    }
    
    if (dataAnalysis.staffMetrics) {
      prompt += `\nStaff utilization metrics:\n${JSON.stringify(dataAnalysis.staffMetrics, null, 2)}\n`;
    }
    
    // Add visualization and formatting guidance
    prompt += `\nPlease analyze this real-time data from our system and provide specific, data-driven insights. Your response should be:
    
1. Concise and factual, directly answering the user's query based on the actual data provided
2. Well-structured with clear sections and bullet points for readability
3. Free of markdown formatting (do NOT use asterisks for bold/italic)
4. Focused on the most important insights without overwhelming detail
5. Organized with the most important information first

DO NOT use markdown formatting like ** or * for emphasis. The response will be displayed in a web interface that does not support markdown.`;
    
    // For transaction count questions, be very specific
    if (userQuery.toLowerCase().includes("highest transaction") || 
        userQuery.toLowerCase().includes("most transactions")) {
      prompt += `\n\nThe user specifically wants to know which branch has the highest transaction count. Provide a direct answer using the actual data, not hypothetical information.`;
    }
    
    // For wait time analysis, provide specific formatting guidance
    if (userQuery.toLowerCase().includes("wait time") || 
        userQuery.toLowerCase().includes("waiting time")) {
      prompt += `\n\nThe user is asking about wait times. Structure your response with:
      - An overview sentence stating the overall average wait time
      - A clear list of branches with the longest wait times (top 3-5)
      - A clear list of branches with the shortest wait times (top 3-5)
      - Any correlation between wait times and other metrics
      - 1-2 actionable recommendations
      
      Keep your response concise and focused on the most important insights.`;
    }
  }
  
  return prompt;
};

/**
 * Analyzes system data based on the query to provide context
 */
const analyzeDataForQuery = async (query) => {
  const lowerQuery = query.toLowerCase();
  const analysis = {
    timestamp: Date.now()
  };
  
  try {
    // Check if we need branch data
    if (queryContains(lowerQuery, ['branch', 'performance', 'bhs', 'health score', 'ranking', 'best', 'worst'])) {
      analysis.relevantBranches = await analyzeBranchPerformance();
    }
    
    // Check if we need transaction data
    if (queryContains(lowerQuery, ['transaction', 'volume', 'trends', 'peak', 'traffic', 'busy'])) {
      analysis.transactionInsights = await analyzeTransactionTrends();
    }
    
    // Check if we need wait time data
    if (queryContains(lowerQuery, ['wait', 'waiting', 'time', 'queue', 'delay', 'customer experience'])) {
      analysis.waitTimeStats = await analyzeWaitTimes();
    }
    
    // Check if we need staff utilization data
    if (queryContains(lowerQuery, ['staff', 'employee', 'utilization', 'teller', 'efficiency', 'performance'])) {
      analysis.staffMetrics = await analyzeStaffUtilization();
    }
    
    return analysis;
  } catch (error) {
    console.error('Error during data analysis:', error);
    return null;
  }
};

/**
 * Helper to check if query contains any of the keywords
 */
const queryContains = (query, keywords) => {
  return keywords.some(keyword => query.includes(keyword));
};

/**
 * Extract visualization data from the AI response
 */
const extractVisualizationData = (responseText, structuredData, dataAnalysis) => {
  // If we have structured data in the response, try to use it for visualization
  if (structuredData) {
    if (structuredData.visualization) {
      return structuredData.visualization;
    }
    
    if (structuredData.chart) {
      return structuredData.chart;
    }
  }
  
  // If no structured data, try to determine visualization based on the query context and data analysis
  if (dataAnalysis) {
    // Branch performance visualization
    if (dataAnalysis.relevantBranches) {
      return createBranchPerformanceVisualization(dataAnalysis.relevantBranches);
    }
    
    // Transaction trends visualization
    if (dataAnalysis.transactionInsights) {
      return createTransactionTrendsVisualization(dataAnalysis.transactionInsights);
    }
    
    // Wait time visualization
    if (dataAnalysis.waitTimeStats) {
      return createWaitTimeVisualization(dataAnalysis.waitTimeStats);
    }
    
    // Staff utilization visualization
    if (dataAnalysis.staffMetrics) {
      return createStaffUtilizationVisualization(dataAnalysis.staffMetrics);
    }
  }
  
  return null;
};

/**
 * Analyze branch performance data
 */
const analyzeBranchPerformance = async () => {
  // Check if we have cached data that's not expired
  if (analyticsCache.branchPerformance && analyticsCache.lastAnalysis && 
      (Date.now() - analyticsCache.lastAnalysis < analyticsCache.cacheExpiration)) {
    return analyticsCache.branchPerformance;
  }
  
  // Fetch branch data
  const branchData = await fetchMainSheetData();
  
  if (!branchData || branchData.length === 0) {
    return null;
  }
  
  // Calculate average BHS
  const avgBHS = branchData.reduce((sum, branch) => sum + (branch.bhs || 0), 0) / branchData.length;
  
  // Sort branches by BHS
  const sortedBranches = [...branchData].sort((a, b) => (b.bhs || 0) - (a.bhs || 0));
  
  // Get top and bottom performers
  const topBranches = sortedBranches.slice(0, 5);
  const bottomBranches = sortedBranches.slice(-5).reverse();
  
  // Format the data
  const analysis = {
    averageBHS: avgBHS,
    topPerformers: topBranches.map(branch => ({
      branch_name: branch.branch_name,
      city: branch.city,
      bhs: branch.bhs,
      avg_waiting_time: branch.avg_waiting_time,
      percentAboveAverage: ((branch.bhs - avgBHS) / avgBHS * 100).toFixed(1)
    })),
    improvementNeeded: bottomBranches.map(branch => ({
      branch_name: branch.branch_name,
      city: branch.city,
      bhs: branch.bhs,
      avg_waiting_time: branch.avg_waiting_time,
      percentBelowAverage: ((avgBHS - branch.bhs) / avgBHS * 100).toFixed(1)
    }))
  };
  
  // Cache the results
  analyticsCache.branchPerformance = analysis;
  analyticsCache.lastAnalysis = Date.now();
  
  return analysis;
};

/**
 * Analyze transaction trends
 */
const analyzeTransactionTrends = async () => {
  // Always fetch fresh data for transaction trends
  analyticsCache.transactionTrends = null;
  
  try {
    // Fetch transaction data from Sheet1
    const transactionData = await fetchTransactionData();
    
    if (!transactionData || transactionData.length === 0) {
      console.warn("No transaction data found in Sheet1");
      return null;
    }
    
    // Fetch branch data from Main sheet to get additional metrics
    const branchData = await fetchMainSheetData();
    
    // Group by date
    const byDate = transactionData.reduce((acc, tx) => {
      const date = tx.date || 'unknown';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(tx);
      return acc;
    }, {});
    
    // Get dates in order
    const dates = Object.keys(byDate).sort();
    
    // Count transactions by type
    const transactionTypes = [...new Set(transactionData.map(tx => tx.transaction_type))].filter(Boolean);
    const typeDistribution = transactionTypes.map(type => {
      const count = transactionData.filter(tx => tx.transaction_type === type).length;
      return {
        type,
        count,
        percentage: (count / transactionData.length * 100).toFixed(1)
      };
    }).sort((a, b) => b.count - a.count);
    
    // Calculate daily volumes
    const dailyVolumes = dates.map(date => ({
      date,
      count: byDate[date].length,
      types: transactionTypes.map(type => ({
        type,
        count: byDate[date].filter(tx => tx.transaction_type === type).length
      }))
    }));
    
    // Calculate branch transaction volumes - using both Sheet1 and Main sheet data
    const branchVolumes = {};
    
    // First, count transactions from Sheet1
    transactionData.forEach(tx => {
      if (tx.branch_name) {
        if (!branchVolumes[tx.branch_name]) {
          branchVolumes[tx.branch_name] = {
            count: 0,
            avgWaitTime: 0,
            bhs: 0,
            city: ''
          };
        }
        branchVolumes[tx.branch_name].count++;
      }
    });
    
    // Then, add data from Main sheet for each branch
    if (branchData && branchData.length > 0) {
      branchData.forEach(branch => {
        if (branch.branch_name) {
          if (!branchVolumes[branch.branch_name]) {
            branchVolumes[branch.branch_name] = {
              count: branch.transaction_count || 0,
              avgWaitTime: branch.avg_waiting_time || 0,
              bhs: branch.bhs || 0,
              city: branch.city || ''
            };
          } else {
            // If we already have transaction count from Sheet1, keep it but add other metrics
            branchVolumes[branch.branch_name].avgWaitTime = branch.avg_waiting_time || 0;
            branchVolumes[branch.branch_name].bhs = branch.bhs || 0;
            branchVolumes[branch.branch_name].city = branch.city || '';
            
            // If no transactions were counted from Sheet1, use the count from Main
            if (branchVolumes[branch.branch_name].count === 0) {
              branchVolumes[branch.branch_name].count = branch.transaction_count || 0;
            }
          }
        }
      });
    }
    
    const branchVolumeRanking = Object.entries(branchVolumes)
      .map(([branch, data]) => ({ 
        branch_name: branch, 
        count: data.count,
        avg_waiting_time: data.avgWaitTime,
        bhs: data.bhs,
        city: data.city
      }))
      .sort((a, b) => b.count - a.count);
    
    // Find the branch with highest transaction count
    const highestTransactionBranch = branchVolumeRanking.length > 0 ? branchVolumeRanking[0] : null;
    
    // Format the data
    const analysis = {
      totalTransactions: transactionData.length,
      typeDistribution: typeDistribution,
      volumeTrend: dailyVolumes,
      branchVolumeRanking: branchVolumeRanking.slice(0, 10), // Get top 10 branches
      highestTransactionBranch: highestTransactionBranch,
      dateRange: {
        start: dates[0],
        end: dates[dates.length - 1]
      }
    };
    
    // Cache the results
    analyticsCache.transactionTrends = analysis;
    analyticsCache.lastAnalysis = Date.now();
    
    return analysis;
  } catch (error) {
    console.error("Error analyzing transaction trends:", error);
    return null;
  }
};

/**
 * Analyze wait times
 */
const analyzeWaitTimes = async () => {
  // Check cache
  if (analyticsCache.waitTimeAnalysis && analyticsCache.lastAnalysis && 
      (Date.now() - analyticsCache.lastAnalysis < analyticsCache.cacheExpiration)) {
    return analyticsCache.waitTimeAnalysis;
  }
  
  // Fetch branch data
  const branchData = await fetchMainSheetData();
  
  if (!branchData || branchData.length === 0) {
    return null;
  }
  
  // Calculate average wait time
  const avgWaitTime = branchData.reduce((sum, branch) => sum + (branch.avg_waiting_time || 0), 0) / branchData.length;
  
  // Sort branches by wait time
  const sortedByWaitTime = [...branchData].sort((a, b) => (a.avg_waiting_time || 0) - (b.avg_waiting_time || 0));
  
  // Get branches with shortest and longest wait times
  const shortestWait = sortedByWaitTime.slice(0, 5);
  const longestWait = sortedByWaitTime.slice(-5).reverse();
  
  // Calculate wait time impact on BHS
  const waitTimeImpact = branchData.map(branch => ({
    branch_name: branch.branch_name,
    avg_waiting_time: branch.avg_waiting_time,
    bhs: branch.bhs
  }));
  
  // Calculate correlation between wait time and BHS
  const waitTimes = branchData.map(b => b.avg_waiting_time || 0);
  const bhsScores = branchData.map(b => b.bhs || 0);
  const correlation = calculateCorrelation(waitTimes, bhsScores);
  
  // Format the data
  const analysis = {
    averageWaitTime: avgWaitTime,
    shortestWait: shortestWait.map(branch => ({
      branch_name: branch.branch_name,
      city: branch.city,
      avg_waiting_time: branch.avg_waiting_time,
      bhs: branch.bhs
    })),
    longestWait: longestWait.map(branch => ({
      branch_name: branch.branch_name,
      city: branch.city,
      avg_waiting_time: branch.avg_waiting_time,
      bhs: branch.bhs
    })),
    waitTimeToBHSCorrelation: correlation,
    insights: correlation < -0.5 ? 
      "There is a strong negative correlation between wait times and branch health scores." : 
      "The correlation between wait times and branch health scores is not very strong."
  };
  
  // Cache the results
  analyticsCache.waitTimeAnalysis = analysis;
  analyticsCache.lastAnalysis = Date.now();
  
  return analysis;
};

/**
 * Analyze staff utilization
 */
const analyzeStaffUtilization = async () => {
  // Check cache
  if (analyticsCache.staffUtilization && analyticsCache.lastAnalysis && 
      (Date.now() - analyticsCache.lastAnalysis < analyticsCache.cacheExpiration)) {
    return analyticsCache.staffUtilization;
  }
  
  // Fetch branch data
  const branchData = await fetchMainSheetData();
  
  if (!branchData || branchData.length === 0) {
    return null;
  }
  
  // Calculate average staff utilization
  const branchesWithUtil = branchData.filter(branch => branch.staff_utilization);
  const avgUtilization = branchesWithUtil.reduce((sum, branch) => sum + (branch.staff_utilization || 0), 0) / branchesWithUtil.length;
  
  // Sort branches by utilization
  const sortedByUtilization = [...branchesWithUtil].sort((a, b) => (b.staff_utilization || 0) - (a.staff_utilization || 0));
  
  // Get branches with highest and lowest utilization
  const highestUtil = sortedByUtilization.slice(0, 5);
  const lowestUtil = sortedByUtilization.slice(-5).reverse();
  
  // Format the data
  const analysis = {
    averageUtilization: avgUtilization,
    highestUtilization: highestUtil.map(branch => ({
      branch_name: branch.branch_name,
      city: branch.city,
      staff_utilization: branch.staff_utilization,
      bhs: branch.bhs
    })),
    lowestUtilization: lowestUtil.map(branch => ({
      branch_name: branch.branch_name,
      city: branch.city,
      staff_utilization: branch.staff_utilization,
      bhs: branch.bhs
    })),
    utilizationCategories: {
      optimal: branchesWithUtil.filter(b => b.staff_utilization >= 75 && b.staff_utilization <= 85).length,
      overworked: branchesWithUtil.filter(b => b.staff_utilization > 85).length,
      underutilized: branchesWithUtil.filter(b => b.staff_utilization < 75).length
    }
  };
  
  // Cache the results
  analyticsCache.staffUtilization = analysis;
  analyticsCache.lastAnalysis = Date.now();
  
  return analysis;
};

/**
 * Helper function to calculate correlation between two arrays
 */
const calculateCorrelation = (x, y) => {
  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }
  
  return (n * sumXY - sumX * sumY) / 
    (Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)));
};

/**
 * Create a branch performance visualization based on analyzed data
 */
const createBranchPerformanceVisualization = (branchAnalysis) => {
  if (!branchAnalysis || !branchAnalysis.topPerformers) return null;
  
  return {
    type: 'barChart',
    title: 'Branch Health Score Comparison',
    data: {
      labels: branchAnalysis.topPerformers.map(branch => branch.branch_name),
      datasets: [{
        label: 'Branch Health Score',
        data: branchAnalysis.topPerformers.map(branch => branch.bhs),
        backgroundColor: '#FEA000'
      }]
    },
    caption: 'Top performing branches by health score'
  };
};

/**
 * Create a transaction trends visualization based on analyzed data
 */
const createTransactionTrendsVisualization = (transactionAnalysis) => {
  if (!transactionAnalysis) return null;
  
  // If we're specifically looking for highest transaction branch
  if (transactionAnalysis.highestTransactionBranch && transactionAnalysis.branchVolumeRanking) {
    // Get top 5 branches for bar chart
    const top5Branches = transactionAnalysis.branchVolumeRanking.slice(0, 5);
    
    return {
      type: 'barChart',
      title: 'Top Branches by Transaction Count',
      data: {
        labels: top5Branches.map(branch => branch.branch_name),
        datasets: [
          {
            label: 'Transaction Count',
            data: top5Branches.map(branch => branch.count),
            backgroundColor: '#FEA000'
          }
        ]
      },
      caption: `${transactionAnalysis.highestTransactionBranch.branch_name} has the highest transaction count with ${transactionAnalysis.highestTransactionBranch.count} transactions`
    };
  }
  
  // For general transaction trends, show the volume trend if available
  if (transactionAnalysis.volumeTrend && transactionAnalysis.volumeTrend.length > 0) {
    // For line chart, we need consistent dates
    const recentTrend = transactionAnalysis.volumeTrend.slice(-6);
    
    return {
      type: 'lineChart',
      title: 'Transaction Volume Trend',
      data: {
        labels: recentTrend.map(day => day.date),
        datasets: [
          {
            label: 'Daily Transactions',
            data: recentTrend.map(day => day.count),
            borderColor: '#FEA000',
            pointBackgroundColor: '#FEA000'
          }
        ]
      },
      caption: 'Transaction volume over recent days'
    };
  }
  
  return null;
};

/**
 * Create a wait time visualization based on analyzed data
 */
const createWaitTimeVisualization = (waitTimeAnalysis) => {
  if (!waitTimeAnalysis || !waitTimeAnalysis.shortestWait) return null;
  
  // Combine shortest and longest wait branches
  const branches = [
    ...waitTimeAnalysis.shortestWait.slice(0, 3),
    ...waitTimeAnalysis.longestWait.slice(0, 3)
  ];
  
  return {
    type: 'barChart',
    title: 'Average Wait Time by Branch (minutes)',
    data: {
      labels: branches.map(branch => branch.branch_name),
      datasets: [{
        label: 'Wait Time (minutes)',
        data: branches.map(branch => branch.avg_waiting_time),
        backgroundColor: '#BC7EFF'
      }]
    },
    caption: 'Branches with shortest and longest average wait times'
  };
};

/**
 * Create a staff utilization visualization based on analyzed data
 */
const createStaffUtilizationVisualization = (staffAnalysis) => {
  if (!staffAnalysis || !staffAnalysis.highestUtilization) return null;
  
  // Combine high and low utilization branches
  const branches = [
    ...staffAnalysis.highestUtilization.slice(0, 3),
    ...staffAnalysis.lowestUtilization.slice(0, 2)
  ];
  
  return {
    type: 'barChart',
    title: 'Staff Utilization by Branch',
    data: {
      labels: branches.map(branch => branch.branch_name),
      datasets: [{
        label: 'Utilization (%)',
        data: branches.map(branch => branch.staff_utilization),
        backgroundColor: '#00BFA6'
      },
      {
        label: 'Optimal Range',
        data: branches.map(() => 80),
        backgroundColor: '#f0f0f0'
      }]
    },
    caption: 'Staff utilization across branches (optimal range: 75-85%)'
  };
};

/**
 * Get suggested queries based on current system data
 */
export const getDataDrivenQueries = async () => {
  try {
    // Base queries that are always useful
    const baseQueries = [
      "Show me branch performance rankings",
      "Analyze wait times across branches",
      "What are the current transaction trends?",
      "Which branches need staffing optimization?",
      "Is there a correlation between wait times and BHS?",
      "Identify branches with the best customer satisfaction",
      "Where are our top performing branches located?",
      "Which transaction types are most common?"
    ];
    
    // Try to get branch data for more specific queries
    try {
      const branchData = await fetchMainSheetData();
      
      if (branchData && branchData.length > 0) {
        // Find branch with lowest BHS
        const lowestBHS = branchData.reduce((min, branch) => 
          (branch.bhs < min.bhs) ? branch : min, branchData[0]);
          
        if (lowestBHS) {
          baseQueries.push(`Why is ${lowestBHS.branch_name}'s BHS only ${Math.round(lowestBHS.bhs)}?`);
        }
        
        // Find branch with highest wait time
        const highestWait = branchData.reduce((max, branch) => 
          (branch.avg_waiting_time > max.avg_waiting_time) ? branch : max, branchData[0]);
          
        if (highestWait) {
          baseQueries.push(`How can we reduce wait times at ${highestWait.branch_name}?`);
        }
      }
    } catch (error) {
      console.warn('Error generating specific queries:', error);
    }
    
    // Return a random selection of queries
    return baseQueries.sort(() => 0.5 - Math.random()).slice(0, 4);
  } catch (error) {
    console.error('Error generating data-driven queries:', error);
    
    // Fall back to generic queries if we fail
    return [
      "Show me branch performance rankings",
      "Analyze wait times across branches",
      "What are the current transaction trends?",
      "Which branches need staffing optimization?"
    ];
  }
};
