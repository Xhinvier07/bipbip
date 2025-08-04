// Content script that adds a scraping button to the BPI page
(function() {
    // Check if we're on the correct page
    if (!window.location.href.includes('bpi.com.ph/about-bpi/contact-us')) {
        return;
    }

    // Create and inject the scraping button
    function createScrapeButton() {
        // Check if button already exists
        if (document.getElementById('bpi-scraper-button')) {
            return;
        }

        const button = document.createElement('button');
        button.id = 'bpi-scraper-button';
        button.textContent = '📊 Scrape to Google Sheets';
        button.className = 'bpi-scraper-btn';
        
        // Style the button
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            font-family: Arial, sans-serif;
        `;

        // Add hover effects
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        });

        // Add click handler
        button.addEventListener('click', async function() {
            try {
                this.disabled = true;
                this.textContent = '⏳ Scraping...';
                
                // Get configuration from storage
                const config = await new Promise((resolve) => {
                    chrome.storage.sync.get(['spreadsheetId', 'accessToken', 'isAuthorized', 'googleMapsApiKey'], resolve);
                });

                if (!config.spreadsheetId || !config.isAuthorized || !config.accessToken) {
                    alert('Please configure and authorize your Google Sheets access first by clicking the extension icon.');
                    return;
                }

                if (!config.googleMapsApiKey) {
                    alert('Please add your Google Maps API key in the extension settings.');
                    return;
                }

                // Scrape the data
                const branchData = scrapeBranchData();
                
                if (!branchData || branchData.length === 0) {
                    alert('No branch data found on this page. Make sure the page is fully loaded and contains branch information.');
                    return;
                }

                // Add geocoding step
                this.textContent = '🌍 Getting coordinates...';
                const branchDataWithCoords = await addCoordinatesToBranches(branchData, config.googleMapsApiKey);

                // Send to Google Sheets
                this.textContent = '📤 Sending to sheets...';
                const newBranchesCount = await sendToGoogleSheets(branchDataWithCoords, config.spreadsheetId, config.accessToken);
                
                if (newBranchesCount === 0) {
                    alert('All branches already exist in your spreadsheet.');
                } else {
                    alert(`Successfully added ${newBranchesCount} new branches with coordinates to your Google Sheet!`);
                }

            } catch (error) {
                console.error('Scraping error:', error);
                alert('Error: ' + error.message);
            } finally {
                this.disabled = false;
                this.textContent = '📊 Scrape to Google Sheets';
            }
        });

        // Add the button to the page
        document.body.appendChild(button);
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

    // Function to scrape branch data from the current page
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
    }
    
    // Extract branch information from a card-result element
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
                throw new Error('Authorization expired. Please re-authorize by clicking the extension icon.');
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
            
            // Prepare data for sheets with new header including latitude and longitude
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
                    throw new Error('Authorization expired. Please re-authorize by clicking the extension icon.');
                }
                const errorData = await response.json();
                throw new Error(`Google Sheets API error: ${errorData.error.message}`);
            }
            
            return newData.length;
            
        } catch (error) {
            throw new Error(`Failed to send data to Google Sheets: ${error.message}`);
        }
    }

    // Create the button when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createScrapeButton);
    } else {
        createScrapeButton();
    }

    // Also create button when page content changes (for dynamic content)
    const observer = new MutationObserver(() => {
        setTimeout(createScrapeButton, 1000);
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();