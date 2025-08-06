document.addEventListener('DOMContentLoaded', function() {
  const scrapeBtn = document.getElementById('scrapeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const sheetsBtn = document.getElementById('sheetsBtn');
  const authBtn = document.getElementById('authBtn');
  const confirmSheetsBtn = document.getElementById('confirmSheetsBtn');
  const spreadsheetIdContainer = document.getElementById('spreadsheetIdContainer');
  const spreadsheetIdInput = document.getElementById('spreadsheetId');
  const downloadContainer = document.getElementById('downloadContainer');
  const statusDiv = document.getElementById('status');
  const userInfo = document.getElementById('userInfo');
  let reviewsData = [];
  let authToken = null;
  let isAuthenticated = false;

  // Default spreadsheet ID
  const DEFAULT_SPREADSHEET_ID = '1_OBma2uuzISl-5-5OTw3zsx5uWt_K3JfxxgehRfvquA';

  // Check authentication status on startup
  checkAuthStatus();

  authBtn.addEventListener('click', async () => {
    if (isAuthenticated) {
      // If already authenticated, offer to sign out
      if (confirm('You are already authenticated. Do you want to sign out?')) {
        await signOut();
      }
    } else {
      await authenticate();
    }
  });

  scrapeBtn.addEventListener('click', async () => {
    statusDiv.textContent = 'Scraping reviews...';
    
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we're on a Google Maps page
      if (!tab.url.includes('google.com/maps')) {
        statusDiv.textContent = 'Please navigate to a Google Maps business page first.';
        return;
      }
      
      // Execute the scraping function in the content script
      chrome.tabs.sendMessage(tab.id, { action: 'scrapeReviews' }, (response) => {
        if (chrome.runtime.lastError) {
          statusDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.reviews) {
          reviewsData = response.reviews;
          statusDiv.textContent = `Successfully scraped ${reviewsData.length} reviews!`;
          downloadContainer.style.display = 'block';
          
          // Enable sheets button if authenticated
          if (isAuthenticated) {
            sheetsBtn.disabled = false;
          }
        } else {
          statusDiv.textContent = 'No reviews found. Make sure you\'re on a business page with reviews.';
        }
      });
    } catch (error) {
      console.error('Error during scraping:', error);
      statusDiv.textContent = 'Error occurred during scraping.';
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (reviewsData.length === 0) {
      statusDiv.textContent = 'No data to download.';
      return;
    }
    
    try {
      // Convert reviews data to CSV
      const csvContent = convertToCSV(reviewsData);
      
      // Create a blob and download it
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `google_reviews_${timestamp}.csv`;
      a.click();
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      statusDiv.textContent = 'Download complete!';
    } catch (error) {
      console.error('Error downloading CSV:', error);
      statusDiv.textContent = 'Error occurred during download.';
    }
  });

  sheetsBtn.addEventListener('click', () => {
    if (reviewsData.length === 0) {
      statusDiv.textContent = 'No data to send.';
      return;
    }
    
    if (!isAuthenticated) {
      statusDiv.textContent = 'Please authenticate first.';
      return;
    }
    
    // Show spreadsheet ID input with default value
    spreadsheetIdInput.value = DEFAULT_SPREADSHEET_ID;
    spreadsheetIdContainer.style.display = 'block';
  });

  confirmSheetsBtn.addEventListener('click', () => {
    const spreadsheetId = spreadsheetIdInput.value.trim() || DEFAULT_SPREADSHEET_ID;
    sendToGoogleSheets(reviewsData, spreadsheetId);
  });

  async function checkAuthStatus() {
    try {
      // Try to get cached auth token
      const result = await chrome.identity.getAuthToken({ interactive: false });
      if (result && result.token) {
        authToken = result.token;
        isAuthenticated = true;
        updateAuthUI(true);
        
        // Optionally verify the token by making a test API call
        await verifyToken(authToken);
      } else {
        updateAuthUI(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      updateAuthUI(false);
    }
  }

  async function authenticate() {
    statusDiv.textContent = 'Opening Google authentication...';
    
    try {
      const result = await chrome.identity.getAuthToken({ interactive: true });
      
      if (result && result.token) {
        authToken = result.token;
        isAuthenticated = true;
        updateAuthUI(true);
        statusDiv.textContent = 'Successfully authenticated!';
        
        // Verify the token
        await verifyToken(authToken);
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      statusDiv.textContent = 'Authentication failed. Please try again.';
      updateAuthUI(false);
    }
  }

  async function signOut() {
    try {
      if (authToken) {
        await chrome.identity.removeCachedAuthToken({ token: authToken });
      }
      
      authToken = null;
      isAuthenticated = false;
      updateAuthUI(false);
      statusDiv.textContent = 'Signed out successfully.';
      
      // Disable sheets functionality
      sheetsBtn.disabled = true;
      spreadsheetIdContainer.style.display = 'none';
      
    } catch (error) {
      console.error('Sign out error:', error);
      statusDiv.textContent = 'Error during sign out.';
    }
  }

  async function verifyToken(token) {
    try {
      // Make a simple API call to verify the token works
      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userInfoData = await response.json();
        userInfo.textContent = `Signed in as: ${userInfoData.email}`;
        return true;
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      // Token is invalid, sign out
      await signOut();
      return false;
    }
  }

  function updateAuthUI(authenticated) {
    if (authenticated) {
      authBtn.textContent = 'Sign Out';
      authBtn.className = 'authenticated';
      statusDiv.textContent = 'Ready to scrape reviews.';
    } else {
      authBtn.textContent = 'Authenticate with Google';
      authBtn.className = '';
      userInfo.textContent = '';
      statusDiv.textContent = 'Please authenticate to use Google Sheets integration.';
    }
  }

  function convertToCSV(data) {
    // CSV header with reordered columns
    let csv = 'Branch Name,Review Text,Stars,Date\n';
    
    // Add each review as a row
    data.forEach(review => {
      // Escape quotes in the review text and handle undefined values
      const escapedText = (review.text || '').replace(/"/g, '""');
      const branchName = (review.branchName || '').replace(/"/g, '""');
      const date = (review.date || '').replace(/"/g, '""');
      const stars = review.stars || 0;
      
      csv += `"${branchName}","${escapedText}","${stars}","${date}"\n`;
    });
    
    return csv;
  }

  async function sendToGoogleSheets(data, spreadsheetId) {
    if (!isAuthenticated || !authToken) {
      statusDiv.textContent = 'Please authenticate first.';
      return;
    }

    statusDiv.textContent = 'Sending data to Google Sheets...';
    
    try {
      // If no spreadsheet ID is provided, use the default
      if (!spreadsheetId) {
        spreadsheetId = DEFAULT_SPREADSHEET_ID;
      }
      
      // Prepare data for Google Sheets - only include the data rows
      const values = [];
      
      // Add data rows with reordered columns
      data.forEach(review => {
        values.push([
          review.branchName || '', 
          review.text || '', 
          review.stars || 0, 
          review.date || ''
        ]);
      });
      
      // Send data to Google Sheets
      const result = await appendToSheet(authToken, spreadsheetId, values);
      
      if (result) {
        statusDiv.innerHTML = `Successfully sent ${data.length} reviews to Google Sheets!`;
        // Create a link to the spreadsheet
        const link = document.createElement('a');
        link.href = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
        link.target = '_blank';
        link.textContent = 'Open Spreadsheet';
        link.style.display = 'block';
        link.style.marginTop = '10px';
        link.style.color = '#1a73e8';
        statusDiv.appendChild(link);
        
        // Hide the spreadsheet ID input
        spreadsheetIdContainer.style.display = 'none';
      } else {
        statusDiv.textContent = 'Failed to send data to Google Sheets. Please check the spreadsheet ID and try again.';
      }
    } catch (error) {
      console.error('Error sending to Google Sheets:', error);
      
      if (error.message.includes('401')) {
        statusDiv.textContent = 'Authentication expired. Please authenticate again.';
        await signOut();
      } else {
        statusDiv.textContent = `Error: ${error.message}`;
      }
    }
  }

  async function appendToSheet(token, spreadsheetId, values) {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: values
          })
        });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error appending to sheet:', error);
      throw error;
    }
  }
});