// Sample data and helper functions for BIP Chat

// Generate a response based on user input
export const generateResponse = (input) => {
  const lowercaseInput = input.toLowerCase();
  
  // Branch performance query
  if (lowercaseInput.includes('branch performance') || 
      lowercaseInput.includes('best branch') ||
      lowercaseInput.includes('branch comparison')) {
    return {
      response: "Based on our analysis, Makati Ayala branch is currently the top performer with a Branch Health Score of 95%. This is 18% higher than the average BHS across all branches.\n\nKey factors contributing to this performance:\n• 40% lower average wait time (4.2 minutes vs. 7.0 minutes network average)\n• 22% higher staff utilization rate\n• 15% higher CSAT scores from customer reviews",
      visualization: {
        type: 'barChart',
        title: 'Branch Health Score Comparison',
        data: {
          labels: ['Makati Ayala', 'BGC High Street', 'Mandaluyong', 'Caloocan', 'Quezon City'],
          datasets: [{
            label: 'Branch Health Score',
            data: [95, 87, 82, 76, 74],
            backgroundColor: '#FEA000'
          }]
        },
        caption: 'Branch Health Scores across top 5 branches (last 30 days)'
      }
    };
  }
  
  // Transaction trends query
  if (lowercaseInput.includes('transaction') || 
      lowercaseInput.includes('trends') ||
      lowercaseInput.includes('volume')) {
    return {
      response: "Transaction volume has increased by 12% over the past quarter across all branches. The most significant growth is in online-assisted transactions (+28%) and loan applications (+17%).\n\nNotably, Caloocan branch has seen a 32% increase in transaction volume, likely due to the recent mall opening nearby increasing foot traffic.",
      visualization: {
        type: 'lineChart',
        title: 'Transaction Volume Trends (Last 6 Months)',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'All Transactions',
              data: [1250, 1310, 1280, 1350, 1420, 1480],
              borderColor: '#FEA000',
              pointBackgroundColor: '#FEA000'
            },
            {
              label: 'Online-Assisted',
              data: [320, 340, 360, 380, 410, 450],
              borderColor: '#CF3D58',
              pointBackgroundColor: '#CF3D58'
            }
          ]
        },
        caption: 'Transaction volume has shown consistent growth, especially in online-assisted services'
      }
    };
  }
  
  // Wait time analysis
  if (lowercaseInput.includes('wait time') || 
      lowercaseInput.includes('waiting') ||
      lowercaseInput.includes('queue')) {
    return {
      response: "Average wait times vary significantly across branches. Makati Ayala has the shortest wait time at 4.2 minutes, while Caloocan branch currently experiences the longest wait time at 12.8 minutes.\n\nOur analysis suggests that adding one additional teller during peak hours (11AM-2PM) at Caloocan could reduce wait times by approximately 40%.",
      visualization: {
        type: 'barChart',
        title: 'Average Wait Time by Branch (minutes)',
        data: {
          labels: ['Makati Ayala', 'BGC High Street', 'Mandaluyong', 'Quezon City', 'Caloocan'],
          datasets: [{
            label: 'Wait Time (minutes)',
            data: [4.2, 5.7, 7.3, 9.5, 12.8],
            backgroundColor: '#BC7EFF'
          }]
        },
        caption: 'Lower wait times correlate strongly with higher customer satisfaction scores'
      }
    };
  }
  
  // Transaction type distribution
  if (lowercaseInput.includes('transaction type') || 
      lowercaseInput.includes('transaction distribution') ||
      lowercaseInput.includes('types of transaction')) {
    return {
      response: "The distribution of transaction types shows that deposits and withdrawals remain the most common transactions (45% and 30% respectively). However, loan applications are generating the highest revenue per transaction.\n\nIn Metro Manila branches, we're seeing a 15% higher proportion of digital service assistance compared to provincial branches.",
      visualization: {
        type: 'pieChart',
        title: 'Transaction Type Distribution',
        data: [
          { label: 'Deposits', value: 45, color: '#FEA000' },
          { label: 'Withdrawals', value: 30, color: '#CF3D58' },
          { label: 'Balance Inquiry', value: 10, color: '#BC7EFF' },
          { label: 'Loan Application', value: 8, color: '#00BFA6' },
          { label: 'Digital Service Assistance', value: 7, color: '#4299e1' }
        ],
        caption: 'Percentage breakdown of transaction types across all branches'
      }
    };
  }
  
  // Branch location
  if (lowercaseInput.includes('where') || 
      lowercaseInput.includes('location') ||
      lowercaseInput.includes('find branch')) {
    return {
      response: "We currently have 37 branches across Metro Manila. The highest concentration is in Makati (8 branches) and Quezon City (7 branches). Based on customer density analysis, we've identified potential locations for new branches in Pasig and Parañaque.",
      visualization: {
        type: 'map',
        title: 'Branch Locations in Metro Manila',
        data: {
          points: [
            { x: 45, y: 45, label: 'Makati', size: 8, color: '#FEA000' },
            { x: 30, y: 35, label: 'BGC', size: 6, color: '#FEA000' },
            { x: 60, y: 25, label: 'Quezon City', size: 7, color: '#FEA000' },
            { x: 50, y: 70, label: 'Caloocan', size: 5, color: '#CF3D58' },
            { x: 25, y: 55, label: 'Mandaluyong', size: 6, color: '#00BFA6' },
            { x: 75, y: 65, label: 'Pasig', size: 4, color: '#BC7EFF', },
            { x: 40, y: 80, label: 'Parañaque', size: 4, color: '#BC7EFF' },
          ]
        },
        caption: 'Branch distribution across Metro Manila with size indicating branch capacity'
      }
    };
  }
  
  // Staff utilization
  if (lowercaseInput.includes('staff') || 
      lowercaseInput.includes('employee') ||
      lowercaseInput.includes('teller')) {
    return {
      response: "Current staff utilization averages 76% across all branches, with significant variations. Makati Ayala shows optimal utilization at 85%, while Caloocan is potentially overstaffed during morning hours with only 62% utilization.\n\nOur machine learning models suggest the following optimizations:\n• Reduce morning staff at Caloocan by 1 teller\n• Increase lunch hour staff at BGC by 1 teller\n• Cross-train 2 customer service reps at Quezon City for teller operations during peak hours",
      visualization: {
        type: 'barChart',
        title: 'Staff Utilization by Branch',
        data: {
          labels: ['Makati Ayala', 'BGC High Street', 'Mandaluyong', 'Quezon City', 'Caloocan'],
          datasets: [{
            label: 'Current Utilization (%)',
            data: [85, 80, 76, 72, 62],
            backgroundColor: '#00BFA6'
          },
          {
            label: 'Target Range',
            data: [80, 80, 80, 80, 80],
            backgroundColor: '#f0f0f0'
          }]
        },
        caption: 'Optimal staff utilization is between 78-85% to balance efficiency and service quality'
      }
    };
  }
  
  // General query about the system
  if (lowercaseInput.includes('what can you do') || 
      lowercaseInput.includes('help') ||
      lowercaseInput.includes('capabilities')) {
    return {
      response: "I'm BIP, your Branch Intelligence Platform assistant. I can help with:\n\n• Branch performance analysis and comparisons\n• Transaction volume trends and forecasts\n• Wait time analysis and optimization recommendations\n• Staff utilization insights\n• Branch location analysis\n• Customer satisfaction metrics\n\nJust ask me a question about any aspect of branch operations, and I'll provide data-driven insights with visualizations!",
      visualization: null
    };
  }
  
  // CSAT and customer satisfaction
  if (lowercaseInput.includes('csat') || 
      lowercaseInput.includes('customer satisfaction') ||
      lowercaseInput.includes('review')) {
    return {
      response: "Overall customer satisfaction (CSAT) is currently at 82%, which is 3% higher than the same period last year. The top factors influencing positive reviews are:\n\n1. Staff friendliness and knowledge (mentioned in 68% of positive reviews)\n2. Transaction speed (mentioned in 52% of positive reviews)\n3. Branch cleanliness and ambiance (mentioned in 34% of positive reviews)\n\nThe most common negative feedback relates to wait times during peak hours (11AM-2PM).",
      visualization: {
        type: 'lineChart',
        title: 'CSAT Score Trend',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'CSAT Score',
              data: [78, 79, 80, 81, 82, 82],
              borderColor: '#00BFA6',
              pointBackgroundColor: '#00BFA6'
            },
            {
              label: 'Wait Time (min)',
              data: [9.2, 8.7, 8.1, 7.6, 7.2, 7.0],
              borderColor: '#CF3D58',
              pointBackgroundColor: '#CF3D58'
            }
          ]
        },
        caption: 'CSAT scores show inverse correlation with average wait times'
      }
    };
  }
  
  // Default response for anything else
  return {
    response: "I understand you're asking about " + input + ". What specific aspect of branch performance would you like to analyze? I can provide insights on transaction volumes, wait times, staff utilization, customer satisfaction, or branch health scores.",
    visualization: null
  };
};

// Get suggested queries based on context
export const getSuggestedQueries = () => {
  const queries = [
    "Which branch has the best performance?",
    "Show me transaction volume trends",
    "Analyze wait times across branches",
    "What are the most common transaction types?",
    "How is staff being utilized?",
    "Show me customer satisfaction metrics",
    "Where are our branches located?",
    "What factors affect Branch Health Score?",
    "Forecast transaction volume next quarter"
  ];
  
  // Return a randomized subset of queries
  return queries.sort(() => 0.5 - Math.random()).slice(0, 4);
};

// Example visualization data
export const exampleVisualizationData = {
  branchComparison: {
    labels: ['Makati Ayala', 'BGC', 'Mandaluyong', 'Caloocan', 'Quezon City'],
    datasets: [{
      label: 'Branch Health Score',
      data: [95, 87, 82, 76, 74],
      backgroundColor: '#FEA000'
    }]
  },
  
  weeklyTrends: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'This Week',
        data: [120, 150, 180, 165, 190, 110],
        borderColor: '#FEA000',
        pointBackgroundColor: '#FEA000'
      },
      {
        label: 'Last Week',
        data: [110, 140, 170, 160, 180, 100],
        borderColor: '#999',
        pointBackgroundColor: '#999'
      }
    ]
  },
  
  transactionTypes: [
    { label: 'Deposits', value: 45, color: '#FEA000' },
    { label: 'Withdrawals', value: 30, color: '#CF3D58' },
    { label: 'Balance Inquiry', value: 10, color: '#BC7EFF' },
    { label: 'Loan Application', value: 8, color: '#00BFA6' },
    { label: 'Digital Service', value: 7, color: '#4299e1' }
  ],
  
  branchLocations: {
    points: [
      { x: 45, y: 45, label: 'Makati', size: 8, color: '#FEA000' },
      { x: 30, y: 35, label: 'BGC', size: 6, color: '#FEA000' },
      { x: 60, y: 25, label: 'Quezon City', size: 7, color: '#FEA000' },
      { x: 50, y: 70, label: 'Caloocan', size: 5, color: '#CF3D58' },
      { x: 25, y: 55, label: 'Mandaluyong', size: 6, color: '#00BFA6' },
      { x: 75, y: 65, label: 'Pasig', size: 4, color: '#BC7EFF', },
      { x: 40, y: 80, label: 'Parañaque', size: 4, color: '#BC7EFF' },
    ]
  }
};