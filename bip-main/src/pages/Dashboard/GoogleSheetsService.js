// Google Sheets API integration
const SHEET_ID = '1rHjXMxilei_FCJN49NDKmdFz8kSiX4ryCnaHPNcqeDc';
const API_KEY = 'AIzaSyD9Kl7Ws53pJIcg1vZTfcVWWBITACUjc9c';

// Cache for Google Sheets data to reduce API calls
let dataCache = {
  main: null,
  sheet1: null,
  lastFetch: {
    main: null,
    sheet1: null
  }
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Fetches data from the Main sheet
 * Contains branch information and metrics
 */
export const fetchMainSheetData = async () => {
  // Check if we have cached data that's not expired
  const now = Date.now();
  if (dataCache.main && dataCache.lastFetch.main && now - dataCache.lastFetch.main < CACHE_EXPIRATION) {
    console.log('Using cached Main sheet data');
    return dataCache.main;
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Main?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Main sheet data: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.values || data.values.length <= 1) {
      throw new Error('No data found in Main sheet');
    }
    
    // Extract headers and data rows
    const headers = data.values[0];
    const rows = data.values.slice(1);
    
    // Convert to array of objects with column headers as keys
    const formattedData = rows.map(row => {
      const item = {};
      headers.forEach((header, index) => {
        // Convert numeric values to numbers
        if (index >= 5 && row[index]) { // Starting from avg_waiting_time (index 5)
          item[header] = parseFloat(row[index]) || 0;
        } else {
          item[header] = row[index] || '';
        }
      });
      return item;
    });
    
    // Update cache
    dataCache.main = formattedData;
    dataCache.lastFetch.main = now;
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching Main sheet data:', error);
    
    // If we have cached data, return it even if expired in case of error
    if (dataCache.main) {
      console.log('Using expired cached Main sheet data due to fetch error');
      return dataCache.main;
    }
    
    // Return mock data as fallback
    return generateMockMainData();
  }
};

/**
 * Fetches data from the Sheet1 sheet
 * Contains transaction information
 */
export const fetchTransactionData = async () => {
  // Check if we have cached data that's not expired
  const now = Date.now();
  if (dataCache.sheet1 && dataCache.lastFetch.sheet1 && now - dataCache.lastFetch.sheet1 < CACHE_EXPIRATION) {
    console.log('Using cached Sheet1 data');
    return dataCache.sheet1;
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Sheet1 data: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.values || data.values.length <= 1) {
      throw new Error('No data found in Sheet1');
    }
    
    // Extract headers and data rows
    const headers = data.values[0];
    const rows = data.values.slice(1);
    
    // Convert to array of objects with column headers as keys
    const formattedData = rows.map(row => {
      const item = {};
      headers.forEach((header, index) => {
        // Convert numeric values to numbers for specific columns
        if (['waiting_time', 'processing_time', 'transaction_time', 'sentiment_score'].includes(header)) {
          item[header] = parseFloat(row[index]) || 0;
        } else {
          item[header] = row[index] || '';
        }
      });
      return item;
    });
    
    // Update cache
    dataCache.sheet1 = formattedData;
    dataCache.lastFetch.sheet1 = now;
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching Sheet1 data:', error);
    
    // If we have cached data, return it even if expired in case of error
    if (dataCache.sheet1) {
      console.log('Using expired cached Sheet1 data due to fetch error');
      return dataCache.sheet1;
    }
    
    // Return mock data as fallback
    return generateMockTransactionData();
  }
};

/**
 * Generate mock Main sheet data
 * Used as fallback when API fails
 */
const generateMockMainData = () => {
  const branches = [
    { city: 'Makati', branch_name: 'Makati Central Branch', address: '123 Ayala Ave, Makati City', latitude: 14.5547, longitude: 121.0244 },
    { city: 'Quezon City', branch_name: 'North EDSA Branch', address: '456 EDSA, Quezon City', latitude: 14.6528, longitude: 121.0247 },
    { city: 'Mandaluyong', branch_name: 'Mandaluyong SM Branch', address: '789 SM Megamall, Mandaluyong', latitude: 14.5847, longitude: 121.0557 },
    { city: 'Caloocan', branch_name: 'Caloocan Monumento', address: '101 Rizal Ave, Caloocan', latitude: 14.6573, longitude: 120.9830 },
    { city: 'Makati', branch_name: 'Makati Rockwell Branch', address: '202 Rockwell Drive, Makati', latitude: 14.5652, longitude: 121.0301 },
    { city: 'Caloocan', branch_name: 'Caloocan Camarin', address: '303 Camarin Road, Caloocan', latitude: 14.7646, longitude: 121.0495 },
    { city: 'Quezon City', branch_name: 'Quezon City Cubao', address: '404 Aurora Blvd, Cubao', latitude: 14.6199, longitude: 121.0553 },
    { city: 'Mandaluyong', branch_name: 'Mandaluyong Pioneer', address: '505 Pioneer St, Mandaluyong', latitude: 14.5741, longitude: 121.0406 }
  ];
  
  return branches.map(branch => ({
    ...branch,
    avg_waiting_time: getRandomValue(5, 20),
    avg_processing_time: getRandomValue(2, 10),
    avg_transaction_time: getRandomValue(7, 30),
    transaction_count: getRandomValue(200, 500),
    sentiment_score: getRandomValue(60, 95),
    bhs: getRandomValue(75, 95)
  }));
};

/**
 * Generate mock transaction data
 * Used as fallback when API fails
 */
const generateMockTransactionData = () => {
  const transactionTypes = [
    'withdrawal',
    'deposit',
    'encashment',
    'loan',
    'transfer',
    'account service',
    'customer service'
  ];
  
  const branches = [
    'Makati Central Branch',
    'North EDSA Branch',
    'Mandaluyong SM Branch',
    'Caloocan Monumento',
    'Makati Rockwell Branch',
    'Caloocan Camarin',
    'Quezon City Cubao',
    'Mandaluyong Pioneer'
  ];
  
  const mockData = [];
  
  // Generate transactions for the past 30 days
  for (let i = 0; i < 100; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    mockData.push({
      transaction_id: `TX-${1000 + i}`,
      customer_id: `CUST-${2000 + Math.floor(Math.random() * 1000)}`,
      branch_name: branches[Math.floor(Math.random() * branches.length)],
      transaction_type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
      waiting_time: getRandomValue(5, 20),
      processing_time: getRandomValue(2, 10),
      transaction_time: getRandomValue(7, 30),
      date: date.toISOString().split('T')[0],
      sentiment: ['Positive', 'Neutral', 'Negative'][Math.floor(Math.random() * 3)],
      sentiment_score: getRandomValue(1, 10),
      review_text: 'Sample customer review'
    });
  }
  
  return mockData;
};

/**
 * Helper function to get random value between min and max
 */
const getRandomValue = (min, max, decimals = 0) => {
  const value = Math.random() * (max - min) + min;
  return decimals > 0 ? parseFloat(value.toFixed(decimals)) : Math.floor(value);
};
