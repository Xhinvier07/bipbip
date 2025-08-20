// DashboardData.js
import { fetchMainSheetData, fetchTransactionData } from './GoogleSheetsService';

// Function to process Google Sheets data for KPI cards
export const getKPIData = async () => {
  try {
    const branchData = await fetchMainSheetData();
    
    // Get total branches
    const totalBranches = branchData.length;
    
    // Get total transactions (sum of transaction_count from Main sheet)
    const totalTransactions = branchData.reduce((sum, branch) => sum + parseInt(branch.transaction_count || 0), 0);
    
    // Get average wait time across all branches (from Main sheet) - rounded up using Math.ceil
    const avgWaitTime = Math.ceil(
      branchData.reduce((sum, branch) => sum + parseFloat(branch.avg_waiting_time || 0), 0) / totalBranches
    );
    
    // Get overall BHS (Branch Health Score) (from Main sheet)
    const overallBHS = Math.round(
      branchData.reduce((sum, branch) => sum + parseFloat(branch.bhs || 0), 0) / totalBranches
    );
    
    // Calculate month-over-month changes
    // For demo purposes, we're simulating these values
    const newBranchesThisMonth = Math.floor(Math.random() * 5) + 1;
    const transactionGrowth = Math.floor(Math.random() * 15) + 5;
    const waitTimeChange = Math.floor(Math.random() * 4) - 2; // Between -2 and +2
    const bhsChange = Math.floor(Math.random() * 6) - 2; // Between -2 and +4
    
    return {
      branchCount: {
        total: totalBranches,
        newThisMonth: newBranchesThisMonth,
        trend: 'positive'
      },
      transactions: {
        today: totalTransactions,
        growth: transactionGrowth,
        trend: 'positive'
      },
      waitTime: {
        average: avgWaitTime,
        change: waitTimeChange,
        trend: waitTimeChange > 0 ? 'negative' : 'positive'
      },
      bhs: {
        score: overallBHS,
        change: bhsChange,
        trend: bhsChange > 0 ? 'positive' : 'negative'
      }
    };
  } catch (error) {
    console.error('Error getting KPI data:', error);
    // Fallback to mock data with simulated fluctuations
    return {
      branchCount: {
        total: simulateFluctuations([252], 0.02)[0],
        newThisMonth: Math.floor(Math.random() * 5) + 1,
        trend: 'positive'
      },
      transactions: {
        today: simulateFluctuations([25000], 0.2)[0],
        growth: Math.floor(Math.random() * 15) + 5,
        trend: 'positive'
      },
      waitTime: {
        average: simulateFluctuations([14], 0.3)[0],
        change: Math.floor(Math.random() * 4) - 2,
        trend: Math.random() > 0.5 ? 'positive' : 'negative'
      },
      bhs: {
        score: simulateFluctuations([88], 0.05)[0],
        change: Math.floor(Math.random() * 6) - 2,
        trend: Math.random() > 0.7 ? 'positive' : 'negative'
      }
    };
  }
};

// Function to process Google Sheets data for transaction chart
export const getTransactionChartData = async () => {
  try {
    // Get transaction data from Sheet1
    const transactionData = await fetchTransactionData();
    
    // Get all unique dates
    const dates = [...new Set(transactionData.map(t => t.date))].sort();
    
    // If we have at least 2 dates
    if (dates.length >= 2) {
      // Get the latest date and previous date
      const latestDate = dates[dates.length - 1];
      const previousDate = dates[dates.length - 2];
      
      // Count transactions for these dates
      const latestTransactions = transactionData.filter(t => t.date === latestDate).length;
      const previousTransactions = transactionData.filter(t => t.date === previousDate).length;
      
      return [
        { label: `Latest (${latestDate})`, count: latestTransactions },
        { label: `Previous (${previousDate})`, count: previousTransactions }
      ];
    } else {
      // Fallback if we don't have enough dates
      return [
        { label: 'Today', count: transactionData.length },
        { label: 'Previous Day', count: Math.floor(transactionData.length * 0.9) }
      ];
    }
  } catch (error) {
    console.error('Error getting transaction chart data:', error);
    // Fallback to mock data
    return [
      { city: 'Quezon City', count: 12500 },
      { city: 'Makati City', count: 10200 },
      { city: 'Manila', count: 8700 },
      { city: 'Taguig', count: 5400 },
      { city: 'Pasig', count: 4800 },
      { city: 'Mandaluyong', count: 3200 },
      { city: 'Caloocan', count: 2900 },
      { city: 'Muntinlupa', count: 2100 }
    ].map(item => ({
      ...item,
      count: simulateFluctuations([item.count], 0.1)[0]
    }));
  }
};

// Function to process Google Sheets data for category counts
export const getCategoryData = async () => {
  try {
    const transactionData = await fetchTransactionData();
    
    // Group by transaction type
    const categoryCounts = {};
    transactionData.forEach(transaction => {
      const type = transaction.transaction_type?.toLowerCase() || 'other';
      if (!categoryCounts[type]) {
        categoryCounts[type] = 0;
      }
      categoryCounts[type]++;
    });
    
    // Define category colors
    const categoryColors = {
      withdrawal: '#FEA000',
      deposit: '#CF3D58',
      encashment: '#C95A94',
      loan: '#BC7EFF',
      transfer: '#3B82F6',
      'account service': '#06B6D4',
      'customer service': '#10B981',
      other: '#6B7280'
    };
    
    // Calculate total
    const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
    
    // Convert to array format needed for chart
    const chartData = Object.keys(categoryCounts).map(name => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((categoryCounts[name] / total) * 100),
      count: categoryCounts[name],
      color: categoryColors[name] || '#6B7280'
    }));
    
    // Sort by count (descending)
    return chartData.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error getting category data:', error);
    // Fallback to mock data
    return [
      { name: 'Withdrawal', value: simulateFluctuations([28], 0.15)[0], count: 2800, color: '#FEA000' },
      { name: 'Deposit', value: simulateFluctuations([42], 0.15)[0], count: 4200, color: '#CF3D58' },
      { name: 'Customer Service', value: simulateFluctuations([12], 0.15)[0], count: 1200, color: '#10B981' },
      { name: 'Loan', value: simulateFluctuations([8], 0.15)[0], count: 800, color: '#BC7EFF' },
      { name: 'Transfer', value: simulateFluctuations([6], 0.15)[0], count: 600, color: '#3B82F6' },
      { name: 'Account Service', value: simulateFluctuations([3], 0.15)[0], count: 300, color: '#06B6D4' },
      { name: 'Encashment', value: simulateFluctuations([1], 0.15)[0], count: 100, color: '#C95A94' }
    ];
  }
};

// Function to process Google Sheets data for branch performance
export const getBranchPerformanceData = async () => {
  try {
    const branchData = await fetchMainSheetData();
    
    // Sort by transaction count (descending)
    const sortedBranches = [...branchData].sort((a, b) => 
      parseInt(b.transaction_count || 0) - parseInt(a.transaction_count || 0)
    );
    
    // Take top 8 branches
    return sortedBranches.slice(0, 8).map(branch => ({
      name: branch.branch_name,
      score: Math.round(parseFloat(branch.bhs || 0)),
      transactions: parseInt(branch.transaction_count || 0),
      waitTime: Math.round(parseFloat(branch.avg_waiting_time || 0))
    }));
  } catch (error) {
    console.error('Error getting branch performance data:', error);
    // Fallback to mock data
    return [
      { name: 'Marikina', score: simulateFluctuations([91], 0.05)[0], transactions: 428, waitTime: 5 },
      { name: 'Pasig Ortigas Sapphire', score: simulateFluctuations([87], 0.05)[0], transactions: 412, waitTime: 6 },
      { name: 'Meralco', score: simulateFluctuations([94], 0.05)[0], transactions: 411, waitTime: 6 },
      { name: 'Navotas', score: simulateFluctuations([82], 0.05)[0], transactions: 407, waitTime: 6 },
      { name: 'Paso De Blas', score: simulateFluctuations([89], 0.05)[0], transactions: 407, waitTime: 6 }
    ];
  }
};

// Function to process Google Sheets data for customer churn prediction
export const getChurnPredictionData = async () => {
  try {
    const branchData = await fetchMainSheetData();
    
    // This would typically come from a ML model
    // For demo, we'll create a simple heuristic based on available data
    const churnRiskBranches = branchData
      .filter(branch => 
        parseFloat(branch.bhs || 0) < 60 && 
        parseFloat(branch.avg_waiting_time || 0) > 5.8 &&
        parseFloat(branch.sentiment_score || 0) < 3.7
      )
      .sort((a, b) => parseFloat(a.bhs || 0) - parseFloat(b.bhs || 0))
      .slice(0, 5)
      .map(branch => ({
        name: branch.branch_name,
        city: branch.city,
        riskScore: Math.round(100 - parseFloat(branch.bhs || 0)),
        factors: {
          waitTime: parseFloat(branch.avg_waiting_time || 0) > 5.8,
          sentiment: parseFloat(branch.sentiment_score || 0) < 3.7,
          transactions: parseInt(branch.transaction_count || 0) < 320
        }
      }));
      
    return {
      overallChurnRisk: Math.round(
        churnRiskBranches.reduce((sum, branch) => sum + branch.riskScore, 0) / 
        (churnRiskBranches.length || 1)
      ),
      atRiskBranches: churnRiskBranches,
      totalAtRisk: churnRiskBranches.length
    };
  } catch (error) {
    console.error('Error getting churn prediction data:', error);
    // Fallback to mock data
    return {
      overallChurnRisk: simulateFluctuations([24], 0.2)[0],
      atRiskBranches: [
        { name: 'Legaspi Salcedo', city: 'Makati City', riskScore: 46, factors: { waitTime: true, sentiment: true, transactions: false } },
        { name: 'Alabang South', city: 'Muntinlupa', riskScore: 45, factors: { waitTime: true, sentiment: true, transactions: true } },
        { name: 'Diliman Isidora', city: 'Quezon City', riskScore: 43, factors: { waitTime: true, sentiment: true, transactions: false } },
        { name: 'Magallanes South', city: 'Makati City', riskScore: 43, factors: { waitTime: true, sentiment: true, transactions: false } },
        { name: 'Makati Main', city: 'Makati City', riskScore: 43, factors: { waitTime: true, sentiment: true, transactions: false } }
      ],
      totalAtRisk: 5
    };
  }
};

// Function to get staff utilization data
export const getStaffUtilizationData = async () => {
  try {
    const branchData = await fetchMainSheetData();
    
    // Calculate staff utilization metrics
    // In a real system this would come from actual staffing data
    // For demo purposes, we'll create derived metrics
    
    // Calculate average metrics
    const avgTransactionTime = branchData.reduce((sum, branch) => sum + parseFloat(branch.avg_transaction_time || 0), 0) / branchData.length;
    const avgProcessingTime = branchData.reduce((sum, branch) => sum + parseFloat(branch.avg_processing_time || 0), 0) / branchData.length;
    const avgWaitTime = branchData.reduce((sum, branch) => sum + parseFloat(branch.avg_waiting_time || 0), 0) / branchData.length;
    
    // Calculate staff efficiency (processing time / total transaction time)
    const staffEfficiency = Math.round((avgProcessingTime / avgTransactionTime) * 100);
    
    // Calculate idle time (estimate based on wait times)
    const idleTime = Math.max(0, 100 - staffEfficiency - Math.round((avgWaitTime / avgTransactionTime) * 30));
    
    // Calculate overtime
    const overtime = Math.max(0, 100 - staffEfficiency - idleTime);
    
    // Calculate branch utilization distribution
    const branchUtilization = branchData
      .map(branch => {
        const processingTime = parseFloat(branch.avg_processing_time || 0);
        const transactionTime = parseFloat(branch.avg_transaction_time || 0);
        const utilization = transactionTime > 0 ? Math.round((processingTime / transactionTime) * 100) : 0;
        
        return {
          name: branch.branch_name,
          utilization
        };
      })
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 10);
    
    return {
      overall: staffEfficiency,
      active: staffEfficiency,
      idle: idleTime,
      overtime: overtime,
      branchDistribution: branchUtilization,
      trend: staffEfficiency > 75 ? 'positive' : 'negative',
      change: Math.floor(Math.random() * 5) - 2
    };
  } catch (error) {
    console.error('Error getting staff utilization data:', error);
    // Fallback to mock data
    return {
      overall: simulateFluctuations([82], 0.1)[0],
      active: 82,
      idle: 12,
      overtime: 6,
      branchDistribution: [
        { name: "Marikina Sto Nino", utilization: 92 },
        { name: "Market Market", utilization: 90 },
        { name: "Ermita", utilization: 88 },
        { name: "SM North EDSA", utilization: 87 },
        { name: "Pateros", utilization: 85 },
        { name: "Intramuros", utilization: 83 },
        { name: "E. Rodriguez", utilization: 82 },
        { name: "Ayala Triangle", utilization: 80 },
        { name: "Taft Avenue", utilization: 78 },
        { name: "Timog EDSA", utilization: 76 }
      ],
      trend: 'positive',
      change: 3
    };
  }
};

// Function to get customer satisfaction data
export const getCustomerSatisfactionData = async () => {
  try {
    const branchData = await fetchMainSheetData();
    
    // Calculate CSAT score from sentiment data
    const avgSentiment = branchData.reduce((sum, branch) => sum + parseFloat(branch.sentiment_score || 0), 0) / branchData.length;
    
    // Convert to percentage (assuming sentiment_score is on a scale of 1-5)
    const csatScore = Math.round((avgSentiment / 5) * 100);
    
    // Create distribution data (simulated based on avg sentiment)
    const distribution = [
      { rating: 5, percentage: Math.round(avgSentiment * 10) },
      { rating: 4, percentage: Math.round(avgSentiment * 8) },
      { rating: 3, percentage: Math.round((5 - avgSentiment) * 5) },
      { rating: 2, percentage: Math.round((5 - avgSentiment) * 3) },
      { rating: 1, percentage: Math.round((5 - avgSentiment) * 2) },
    ];
    
    // Normalize to ensure sum is 100%
    const total = distribution.reduce((sum, item) => sum + item.percentage, 0);
    distribution.forEach(item => {
      item.percentage = Math.round((item.percentage / total) * 100);
    });
    
    // Top performing branches by sentiment
    const topBranches = [...branchData]
      .sort((a, b) => parseFloat(b.sentiment_score || 0) - parseFloat(a.sentiment_score || 0))
      .slice(0, 5)
      .map(branch => ({
        name: branch.branch_name,
        score: Math.round((parseFloat(branch.sentiment_score || 0) / 5) * 100)
      }));
    
    return {
      overall: csatScore,
      distribution,
      topBranches,
      trend: csatScore > 70 ? 'positive' : 'negative',
      change: Math.floor(Math.random() * 4) - 1
    };
  } catch (error) {
    console.error('Error getting customer satisfaction data:', error);
    // Fallback to mock data
    return {
      overall: simulateFluctuations([87], 0.08)[0],
      distribution: [
        { rating: 5, percentage: 42 },
        { rating: 4, percentage: 38 },
        { rating: 3, percentage: 12 },
        { rating: 2, percentage: 5 },
        { rating: 1, percentage: 3 },
      ],
      topBranches: [
        { name: 'Market Market', score: 92 },
        { name: 'Ermita', score: 91 },
        { name: 'Marikina Sto Nino', score: 90 },
        { name: 'SM North EDSA', score: 89 },
        { name: 'Pateros', score: 88 }
      ],
      trend: 'positive',
      change: 2
    };
  }
};

// AI prompt suggestions for the insight section
export const aiPromptSuggestions = [
  "What are the branches with high BHS?",
  "Which branch has the lowest wait times?",
  "Show me the best performing city",
  "Compare top 3 branches by transaction volume",
  "Identify branches with declining performance"
];

// Helper function to get color based on health score
export const getHealthScoreColor = (score) => {
  if (score >= 90) return '#00BFA6';
  if (score >= 85) return '#FEA000';
  if (score >= 75) return '#FEA000';
  if (score >= 65) return '#FEA000';
  return '#CF3D58';
};

// Helper function to simulate data fluctuations for real-time effect
export const simulateFluctuations = (baseValues, fluctuationFactor = 0.05) => {
  return baseValues.map(value => {
    const fluctuation = (Math.random() * 2 - 1) * fluctuationFactor * value;
    return Math.round(value + fluctuation);
  });
};

// Generate AI response using Gemini API
export const generateAIResponse = async (prompt) => {
  try {
    // For now we'll use mock responses, later can integrate with actual Gemini API
    if (prompt.toLowerCase().includes('high bhs')) {
      return {
        text: "Based on current data, the top branches with high Branch Health Scores are:",
        data: [
          { name: "Market Market", score: simulateFluctuations([94], 0.03)[0], insight: "Excellent staff utilization and low wait times" },
          { name: "Intramuros", score: simulateFluctuations([91], 0.03)[0], insight: "High transaction volume with efficient processing" },
          { name: "Marikina Sto Nino", score: simulateFluctuations([89], 0.03)[0], insight: "Strong customer satisfaction and staff performance" }
        ]
      };
    } else if (prompt.toLowerCase().includes('wait time')) {
      return {
        text: "Branches with the lowest average wait times:",
        data: [
          { name: "Ermita", waitTime: simulateFluctuations([5], 0.2)[0], insight: "Optimal staff distribution" },
          { name: "E. Rodriguez B.G. Belmonte", waitTime: simulateFluctuations([5], 0.2)[0], insight: "Efficient queue management" },
          { name: "Balut Tondo", waitTime: simulateFluctuations([5], 0.2)[0], insight: "Recent improvements in process flow" }
        ]
      };
    } else if (prompt.toLowerCase().includes('best performing city')) {
      return {
        text: "Based on aggregate Branch Health Scores, transaction volumes, and customer satisfaction:",
        data: [
          { city: "Makati City", avgScore: simulateFluctuations([89.5], 0.05)[0], branches: 25, insight: "Highest concentration of well-performing branches" },
          { city: "Taguig", avgScore: simulateFluctuations([86.3], 0.05)[0], branches: 10, insight: "Strong business district performance" },
          { city: "Quezon City", avgScore: simulateFluctuations([84.1], 0.05)[0], branches: 30, insight: "Improving scores month-over-month" }
        ]
      };
    } else {
      return {
        text: "I've analyzed your query. Here are some insights that might help:",
        data: [
          { insight: "Try specifying a metric like BHS, transaction volume, or wait time" },
          { insight: "You can compare branches, cities, or time periods" },
          { insight: "For more specific analysis, include time ranges in your query" }
        ]
      };
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      text: "I encountered an issue analyzing your request. Please try again or rephrase your question.",
      data: [
        { insight: "Try specifying a metric like BHS, transaction volume, or wait time" }
      ]
    };
  }
};