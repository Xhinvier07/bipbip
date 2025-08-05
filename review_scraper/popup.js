document.addEventListener('DOMContentLoaded', function() {
  const scrapeBtn = document.getElementById('scrapeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const sheetsBtn = document.getElementById('sheetsBtn');
  const confirmSheetsBtn = document.getElementById('confirmSheetsBtn');
  const spreadsheetIdContainer = document.getElementById('spreadsheetIdContainer');
  const spreadsheetIdInput = document.getElementById('spreadsheetId');
  const downloadContainer = document.getElementById('downloadContainer');
  const statusDiv = document.getElementById('status');
  let reviewsData = [];

  // Default spreadsheet ID
  const DEFAULT_SPREADSHEET_ID = '1_OBma2uuzISl-5-5OTw3zsx5uWt_K3JfxxgehRfvquA';

  scrapeBtn.addEventListener('click', async () => {
    statusDiv.textContent = 'Scraping reviews...';
    
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Execute the scraping function in the content script
    chrome.tabs.sendMessage(tab.id, { action: 'scrapeReviews' }, (response) => {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
        return;
      }
      
      if (response && response.reviews) {
        reviewsData = response.reviews;
        statusDiv.textContent = `Successfully scraped ${reviewsData.length} reviews!`;
        downloadContainer.style.display = 'block';
      } else {
        statusDiv.textContent = 'No reviews found or error occurred.';
      }
    });
  });

  downloadBtn.addEventListener('click', () => {
    if (reviewsData.length === 0) {
      statusDiv.textContent = 'No data to download.';
      return;
    }
    
    // Convert reviews data to CSV
    const csvContent = convertToCSV(reviewsData);
    
    // Create a blob and download it
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'google_reviews.csv';
    a.click();
    
    statusDiv.textContent = 'Download complete!';
  });

  sheetsBtn.addEventListener('click', () => {
    if (reviewsData.length === 0) {
      statusDiv.textContent = 'No data to download.';
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

  function convertToCSV(data) {
    // CSV header with reordered columns
    let csv = 'Branch Name,Review Text,Stars,Date\n';
    
    // Add each review as a row
    data.forEach(review => {
      // Escape quotes in the review text
      const escapedText = review.text.replace(/"/g, '""');
      const branchName = review.branchName || '';
      csv += `"${branchName}","${escapedText}",${review.stars},"${review.date}"\n`;
    });
    
    return csv;
  }

  async function sendToGoogleSheets(data, spreadsheetId) {
    statusDiv.textContent = 'Authenticating with Google...';
    
    try {
      // Get OAuth token
      const token = await getAuthToken();
      
      if (!token) {
        statusDiv.textContent = 'Authentication failed. Please try again.';
        return;
      }
      
      statusDiv.textContent = 'Preparing data for Google Sheets...';
      
      // If no spreadsheet ID is provided, use the default
      if (!spreadsheetId) {
        spreadsheetId = DEFAULT_SPREADSHEET_ID;
      }
      
      // Prepare data for Google Sheets - only include the data rows, not the header
      const values = [];
      
      // Add data rows with reordered columns
      data.forEach(review => {
        values.push([review.branchName || '', review.text, review.stars, review.date]);
      });
      
      // Send data to Google Sheets
      const result = await appendToSheet(token, spreadsheetId, values);
      
      if (result) {
        statusDiv.textContent = `Successfully sent ${data.length} reviews to Google Sheets!`;
        // Create a link to the spreadsheet
        const link = document.createElement('a');
        link.href = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
        link.target = '_blank';
        link.textContent = 'Open Spreadsheet';
        link.style.display = 'block';
        link.style.marginTop = '10px';
        statusDiv.appendChild(link);
      } else {
        statusDiv.textContent = 'Failed to send data to Google Sheets. Please try again.';
      }
    } catch (error) {
      console.error('Error sending to Google Sheets:', error);
      statusDiv.textContent = `Error: ${error.message}`;
    }
  }

  async function getAuthToken() {
    try {
      const authResult = await chrome.identity.getAuthToken({ interactive: true });
      return authResult.token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async function createSpreadsheet(token) {
    try {
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: 'Google Reviews Data'
          }
        })
      });
      
      const data = await response.json();
      return data.spreadsheetId;
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      return null;
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
      
      return response.ok;
    } catch (error) {
      console.error('Error appending to sheet:', error);
      return false;
    }
  }
});