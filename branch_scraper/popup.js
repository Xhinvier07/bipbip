document.addEventListener('DOMContentLoaded', async function() {
    const spreadsheetIdInput = document.getElementById('spreadsheetId');
    const googleMapsApiKeyInput = document.getElementById('googleMapsApiKey');
    const authButton = document.getElementById('authButton');
    const saveConfigButton = document.getElementById('saveConfig');
    const scrapeButton = document.getElementById('scrapeButton');
    const statusDiv = document.getElementById('status');
    const authStatusDiv = document.getElementById('authStatus');
    const configStatusDiv = document.getElementById('configStatus');

    // Load saved configuration
    const config = await chrome.storage.sync.get(['spreadsheetId', 'googleMapsApiKey', 'isAuthorized']);
    if (config.spreadsheetId) {
        spreadsheetIdInput.value = config.spreadsheetId;
    }
    if (config.googleMapsApiKey) {
        googleMapsApiKeyInput.value = config.googleMapsApiKey;
    }
    
    // Update status displays
    updateAuthStatus(config.isAuthorized);
    updateConfigStatus(config.spreadsheetId, config.googleMapsApiKey);
    
    // Enable scrape button if all config exists and authorized
    updateScrapeButtonState(config);

    function updateAuthStatus(isAuthorized) {
        if (isAuthorized) {
            authStatusDiv.textContent = '✅ Authorized to access Google Sheets';
            authStatusDiv.style.color = '#155724';
            authButton.textContent = '🔑 Re-authorize Google Sheets';
        } else {
            authStatusDiv.textContent = '❌ Not authorized - Click to authorize';
            authStatusDiv.style.color = '#721c24';
            authButton.textContent = '🔑 Authorize Google Sheets';
        }
    }

    function updateConfigStatus(spreadsheetId, googleMapsApiKey) {
        const hasSheetId = !!spreadsheetId;
        const hasApiKey = !!googleMapsApiKey;
        
        if (hasSheetId && hasApiKey) {
            configStatusDiv.textContent = '✅ Configuration complete';
            configStatusDiv.style.color = '#155724';
        } else if (hasSheetId || hasApiKey) {
            const missing = [];
            if (!hasSheetId) missing.push('Sheets ID');
            if (!hasApiKey) missing.push('Maps API key');
            configStatusDiv.textContent = `⚠️ Missing: ${missing.join(', ')}`;
            configStatusDiv.style.color = '#856404';
        } else {
            configStatusDiv.textContent = '❌ Configuration needed';
            configStatusDiv.style.color = '#721c24';
        }
    }

    function updateScrapeButtonState(config) {
        const isReady = config.spreadsheetId && config.googleMapsApiKey && config.isAuthorized;
        scrapeButton.disabled = !isReady;
        
        if (isReady) {
            scrapeButton.textContent = '🚀 Scrape BPI Branches';
        } else {
            scrapeButton.textContent = '🚀 Complete setup first';
        }
    }

    function showStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = '';
        }, 5000);
    }

    // Function to add coordinates to branch data using Google Maps Geocoding API
    async function addCoordinatesToBranches(branches, apiKey) {
        const branchesWithCoords = [];
        
        for (let i = 0; i < branches.length; i++) {
            const branch = branches[i];
            console.log(`Getting coordinates for branch ${i + 1}: ${branch.branch_name}`);
            
            try {
                // Create a more specific address query
                const addressQuery = `${branch.address}, ${branch.city}, Philippines`;
                
                // Call Google Maps Geocoding API
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressQuery)}&key=${apiKey}`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.status === 'OK' && data.results.length > 0) {
                    const location = data.results[0].geometry.location;
                    branchesWithCoords.push({
                        ...branch,
                        latitude: location.lat,
                        longitude: location.lng
                    });
                    console.log(`✅ Got coordinates for ${branch.branch_name}: ${location.lat}, ${location.lng}`);
                } else {
                    console.warn(`⚠️ No coordinates found for ${branch.branch_name}. Status: ${data.status}`);
                    // Add branch without coordinates
                    branchesWithCoords.push({
                        ...branch,
                        latitude: '',
                        longitude: ''
                    });
                }
                
                // Add delay to respect API rate limits (avoid hitting quota too quickly)
                if (i < branches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
                }
                
            } catch (error) {
                console.error(`❌ Error getting coordinates for ${branch.branch_name}:`, error);
                // Add branch without coordinates
                branchesWithCoords.push({
                    ...branch,
                    latitude: '',
                    longitude: ''
                });
            }
        }
        
        return branchesWithCoords;
    }

    // Function to send data to Google Sheets
    async function sendToGoogleSheets(data, spreadsheetId, accessToken) {
        try {
            // Get existing data to check for duplicates
            const existingDataResponse = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            let existingData = [];
            if (existingDataResponse.ok) {
                const existingResult = await existingDataResponse.json();
                existingData = existingResult.values || [];
            } else if (existingDataResponse.status === 401) {
                throw new Error('Authorization expired. Please re-authorize.');
            }
            
            // Create set of existing branch names
            const existingBranches = new Set();
            existingData.forEach(row => {
                if (row.length >= 2) {
                    existingBranches.add(row[1]);
                }
            });
            
            // Filter out duplicates
            const newData = data.filter(branch => !existingBranches.has(branch.branch_name));
            
            if (newData.length === 0) {
                return 0;
            }
            
            // Prepare data for sheets with headers including latitude and longitude
            const values = [];
            if (existingData.length === 0) {
                values.push(['city', 'branch_name', 'address', 'latitude', 'longitude']);
            }
            
            newData.forEach(branch => {
                values.push([
                    branch.city, 
                    branch.branch_name, 
                    branch.address, 
                    branch.latitude || '', 
                    branch.longitude || ''
                ]);
            });
            
            // Send to Google Sheets
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1:append?valueInputOption=RAW`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ values: values })
                }
            );
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authorization expired. Please re-authorize.');
                }
                const errorData = await response.json();
                throw new Error(`Google Sheets API error: ${errorData.error.message}`);
            }
            
            return newData.length;
            
        } catch (error) {
            throw new Error(`Failed to send data to Google Sheets: ${error.message}`);
        }
    }

    // Function to scrape branch data (this will be injected into the page)
    function scrapeBranchData() {
        const branches = [];
        
        console.log('Starting branch data scraping...');
        
        // Target the specific hierarchy: .scrollable-body > .inner-body > .cards-collection > .card-result
        const scrollableBody = document.querySelector('.scrollable-body');
        if (!scrollableBody) {
            console.log('No .scrollable-body found');
            return branches;
        }
        
        const innerBody = scrollableBody.querySelector('.inner-body');
        if (!innerBody) {
            console.log('No .inner-body found within .scrollable-body');
            return branches;
        }
        
        const cardsCollection = innerBody.querySelector('.cards-collection');
        if (!cardsCollection) {
            console.log('No .cards-collection found within .inner-body');
            return branches;
        }
        
        // Get all card-result elements
        const cardResults = cardsCollection.querySelectorAll('.card-result');
        console.log(`Found ${cardResults.length} .card-result elements`);
        
        if (cardResults.length === 0) {
            console.log('No .card-result elements found');
            return branches;
        }
        
        // Process each card-result
        cardResults.forEach((card, index) => {
            console.log(`Processing card ${index + 1}:`, card);
            
            const branchData = extractBranchFromCard(card);
            if (branchData) {
                console.log('Extracted branch data:', branchData);
                branches.push(branchData);
            } else {
                console.log('No valid branch data extracted from card', index + 1);
            }
        });
        
        // Remove duplicates based on branch name
        const uniqueBranches = [];
        const seenNames = new Set();
        
        branches.forEach(branch => {
            if (!seenNames.has(branch.branch_name)) {
                seenNames.add(branch.branch_name);
                uniqueBranches.push(branch);
            }
        });
        
        console.log(`Total unique branches found: ${uniqueBranches.length}`);
        return uniqueBranches;
        
        // Helper function to extract branch information from a card-result element
        function extractBranchFromCard(card) {
            const fullText = card.textContent.trim();
            console.log('Card text:', fullText);
            
            // Split text into lines and clean them
            const lines = fullText.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            if (lines.length < 2) {
                console.log('Not enough lines in card');
                return null;
            }
            
            let branchName = '';
            let address = '';
            let city = '';
            
            // Strategy 1: Look for specific patterns in the card structure
            // Try to find branch name (usually the first meaningful line)
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Skip common non-branch-name words
                if (line === 'Branch' || 
                    line === 'NCR' || 
                    line === 'Metro Manila' ||
                    line.includes('Phone') ||
                    line.includes('Email') ||
                    line.includes('Contact') ||
                    line.length < 3) {
                    continue;
                }
                
                // If this line contains "City", it's likely an address
                if (line.includes('City')) {
                    if (!address) {
                        address = line;
                        // Extract city name
                        const cityMatch = line.match(/(\w+)\s+City/i);
                        if (cityMatch) {
                            city = cityMatch[1];
                        }
                    }
                    continue;
                }
                
                // If we haven't found a branch name yet and this looks like one
                if (!branchName && line.length > 3 && line.length < 100) {
                    // Additional checks to ensure it's likely a branch name
                    if (!line.includes('@') && // Not an email
                        !line.match(/^\d+/) && // Doesn't start with numbers (likely not phone)
                        !line.includes('www.') && // Not a website
                        !line.includes('.com')) { // Not a website
                        
                        // Clean the branch name by removing "NCR" from the end
                        let cleanedName = line.trim();
                        if (cleanedName.endsWith(' NCR')) {
                            cleanedName = cleanedName.replace(/ NCR$/, '');
                        } else if (cleanedName.endsWith(', NCR')) {
                            cleanedName = cleanedName.replace(/, NCR$/, '');
                        } else if (cleanedName.endsWith('-NCR')) {
                            cleanedName = cleanedName.replace(/-NCR$/, '');
                        } else if (cleanedName.endsWith('NCR')) {
                            // Remove NCR if it's at the end without separator
                            cleanedName = cleanedName.replace(/NCR$/, '').trim();
                        }
                        
                        branchName = cleanedName;
                    }
                }
            }
            
            // Strategy 2: If we didn't find address yet, look for lines with street indicators
            if (!address) {
                for (const line of lines) {
                    if ((line.includes('EDSA') || 
                         line.includes('Ave') || 
                         line.includes('Street') || 
                         line.includes('Road') || 
                         line.includes('Blvd') ||
                         line.includes('Drive') ||
                         line.includes('Plaza') ||
                         line.includes('Center')) &&
                        line.length > 10) {
                        address = line;
                        
                        // Try to extract city from this address
                        const cityMatch = line.match(/(\w+)\s+City/i);
                        if (cityMatch) {
                            city = cityMatch[1];
                        }
                        break;
                    }
                }
            }
            
            // Strategy 3: If still no city, try to infer from address or context
            if (!city && address) {
                // Common Metro Manila cities
                const cities = ['Makati', 'Manila', 'Quezon', 'Pasig', 'Taguig', 'Mandaluyong', 
                               'San Juan', 'Pasay', 'Paranaque', 'Las Pinas', 'Muntinlupa', 
                               'Marikina', 'Valenzuela', 'Caloocan', 'Malabon', 'Navotas'];
                
                for (const cityName of cities) {
                    if (address.toLowerCase().includes(cityName.toLowerCase())) {
                        city = cityName;
                        break;
                    }
                }
            }
            
            // Validation: Ensure we have the required fields and they're different
            if (branchName && address && city && 
                branchName !== address && 
                branchName.length > 3 &&
                address.length > 10) {
                
                return {
                    city: city,
                    branch_name: branchName,
                    address: address
                };
            }
            
            console.log('Failed validation:', {
                branchName: branchName,
                address: address,
                city: city,
                branchNameLength: branchName ? branchName.length : 0,
                addressLength: address ? address.length : 0
            });
            
            return null;
        }
    }

    authButton.addEventListener('click', async function() {
        try {
            authButton.disabled = true;
            showStatus('Authorizing...', 'info');
            
            // Use Chrome identity API for OAuth2
            const token = await new Promise((resolve, reject) => {
                chrome.identity.getAuthToken({ 
                    interactive: true,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets']
                }, (token) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(token);
                    }
                });
            });

            if (token) {
                await chrome.storage.sync.set({ 
                    isAuthorized: true,
                    accessToken: token 
                });
                updateAuthStatus(true);
                showStatus('Authorization successful!', 'success');
                
                // Update scrape button state
                const currentConfig = await chrome.storage.sync.get(['spreadsheetId', 'googleMapsApiKey', 'isAuthorized']);
                updateScrapeButtonState(currentConfig);
            }
        } catch (error) {
            console.error('Auth error:', error);
            showStatus('Authorization failed: ' + error.message, 'error');
            updateAuthStatus(false);
        } finally {
            authButton.disabled = false;
        }
    });

    saveConfigButton.addEventListener('click', async function() {
        const spreadsheetId = spreadsheetIdInput.value.trim();
        const googleMapsApiKey = googleMapsApiKeyInput.value.trim();

        if (!spreadsheetId) {
            showStatus('Please enter a spreadsheet ID', 'error');
            return;
        }

        if (!googleMapsApiKey) {
            showStatus('Please enter a Google Maps API key', 'error');
            return;
        }

        // Basic validation for Google Maps API key format
        if (googleMapsApiKey.length < 20) {
            showStatus('Google Maps API key seems too short. Please check it.', 'error');
            return;
        }

        // Test the Google Maps API key
        try {
            showStatus('Testing Google Maps API key...', 'info');
            const testResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=Manila,Philippines&key=${googleMapsApiKey}`
            );
            
            if (!testResponse.ok) {
                throw new Error(`HTTP ${testResponse.status}`);
            }
            
            const testData = await testResponse.json();
            
            if (testData.status === 'REQUEST_DENIED') {
                throw new Error('API key is invalid or restricted');
            } else if (testData.status === 'OVER_QUERY_LIMIT') {
                throw new Error('API key quota exceeded');
            } else if (testData.status !== 'OK') {
                throw new Error(`API returned status: ${testData.status}`);
            }
            
            showStatus('API key test successful!', 'success');
            
        } catch (error) {
            showStatus(`Google Maps API key test failed: ${error.message}`, 'error');
            return;
        }

        // Save configuration
        await chrome.storage.sync.set({
            spreadsheetId: spreadsheetId,
            googleMapsApiKey: googleMapsApiKey
        });

        updateConfigStatus(spreadsheetId, googleMapsApiKey);
        
        // Update scrape button state
        const currentConfig = await chrome.storage.sync.get(['spreadsheetId', 'googleMapsApiKey', 'isAuthorized']);
        updateScrapeButtonState(currentConfig);
        
        showStatus('Configuration saved successfully!', 'success');
    });

    scrapeButton.addEventListener('click', async function() {
        try {
            scrapeButton.disabled = true;
            showStatus('Scraping data...', 'info');

            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('bpi.com.ph/about-bpi/contact-us')) {
                showStatus('Please navigate to the BPI contact page first', 'error');
                scrapeButton.disabled = false;
                return;
            }

            // Execute the scraping script
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: scrapeBranchData
            });

            const branchData = results[0].result;
            
            if (!branchData || branchData.length === 0) {
                showStatus('No branch data found', 'error');
                scrapeButton.disabled = false;
                return;
            }

            showStatus(`Found ${branchData.length} branches. Getting coordinates...`, 'info');

            // Get configuration
            const config = await chrome.storage.sync.get(['spreadsheetId', 'accessToken', 'googleMapsApiKey']);
            
            // Add coordinates to branch data
            const branchDataWithCoords = await addCoordinatesToBranches(branchData, config.googleMapsApiKey);
            
            showStatus('Sending to Google Sheets...', 'info');
            
            // Send data to Google Sheets
            const newBranchesCount = await sendToGoogleSheets(branchDataWithCoords, config.spreadsheetId, config.accessToken);
            
            if (newBranchesCount === 0) {
                showStatus('All branches already exist in your spreadsheet.', 'info');
            } else {
                showStatus(`Successfully added ${newBranchesCount} new branches with coordinates!`, 'success');
            }

        } catch (error) {
            console.error('Scraping error:', error);
            showStatus('Error: ' + error.message, 'error');
        } finally {
            scrapeButton.disabled = false;
        }
    });
});