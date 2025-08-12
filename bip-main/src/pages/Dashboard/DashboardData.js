// Mock data for the dashboard

// Transaction data - monthly transactions for current and previous year
export const transactionData = {
  currentYear: [2800, 3200, 3100, 2700, 3500, 3800, 3200, 3600, 3900, 4100, 3800, 4200],
  previousYear: [2500, 2800, 2600, 2300, 3100, 3400, 2900, 3300, 3500, 3600, 3400, 3700],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

// Branch health data with key metrics
export const branchHealthData = [
  { name: 'C3 A Mabini', score: 91, transactions: 375, waitTime: 12, utilization: 98 },
  { name: 'Caloocan Camarin', score: 87, transactions: 310, waitTime: 15, utilization: 92 },
  { name: 'EDSA Monumento', score: 94, transactions: 425, waitTime: 8, utilization: 96 },
  { name: 'Rizal Ave', score: 82, transactions: 290, waitTime: 17, utilization: 88 },
  { name: 'Gracepark', score: 89, transactions: 340, waitTime: 14, utilization: 94 }
];

// Transaction categories for pie chart
export const categoryData = [
  { name: 'Deposits', value: 42, color: '#FEA000' },
  { name: 'Withdrawals', value: 28, color: '#CF3D58' },
  { name: 'Customer Service', value: 18, color: '#C95A94' },
  { name: 'Loans', value: 12, color: '#BC7EFF' }
];

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
  return '#CF3D58';
};

// Mock AI responses for different query types
export const generateAIResponse = (prompt) => {
  if (prompt.toLowerCase().includes('high bhs')) {
    return {
      text: "Based on current data, the top branches with high Branch Health Scores are:",
      data: [
        { name: "EDSA Monumento", score: 94, insight: "Excellent staff utilization and low wait times" },
        { name: "C3 A Mabini", score: 91, insight: "High transaction volume with efficient processing" },
        { name: "Gracepark", score: 89, insight: "Strong customer satisfaction and staff performance" }
      ]
    };
  } else if (prompt.toLowerCase().includes('wait time')) {
    return {
      text: "Branches with the lowest average wait times:",
      data: [
        { name: "EDSA Monumento", waitTime: 8, insight: "Optimal staff distribution" },
        { name: "Gracepark", waitTime: 14, insight: "Efficient queue management" },
        { name: "Caloocan Camarin", waitTime: 15, insight: "Recent improvements in process flow" }
      ]
    };
  } else if (prompt.toLowerCase().includes('best performing city')) {
    return {
      text: "Based on aggregate Branch Health Scores, transaction volumes, and customer satisfaction:",
      data: [
        { city: "Caloocan", avgScore: 89.5, branches: 4, insight: "Highest concentration of well-performing branches" },
        { city: "Makati", avgScore: 86.3, branches: 5, insight: "Strong business district performance" },
        { city: "Quezon City", avgScore: 84.1, branches: 6, insight: "Improving scores month-over-month" }
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
};