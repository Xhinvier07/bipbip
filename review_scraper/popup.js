class BPIReviewsScraper {
    constructor() {
        this.results = [];
        this.currentIndex = 0;
        this.isRunning = false;
        this.init();
    }

    init() {
        document.getElementById('startScraping').addEventListener('click', () => this.startScraping());
        document.getElementById('downloadResults').addEventListener('click', () => this.downloadResults());
        document.getElementById('clearData').addEventListener('click', () => this.clearData());
        
        // Load saved data
        this.loadSavedData();
    }

    showStatus(message, type = 'info') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        if (type !== 'error') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }
    }

    parseBranchData(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const branch = {};
            headers.forEach((header, index) => {
                branch[header] = values[index];
            });
            return branch;
        });
    }

    async startScraping() {
        const csvText = document.getElementById('branchData').value.trim();
        
        if (!csvText) {
            this.showStatus('Please enter branch data', 'error');
            return;
        }

        try {
            const branches = this.parseBranchData(csvText);
            
            if (branches.length === 0) {
                this.showStatus('No valid branch data found', 'error');
                return;
            }

            this.isRunning = true;
            this.results = [];
            this.currentIndex = 0;
            
            document.getElementById('startScraping').disabled = true;
            document.getElementById('downloadResults').disabled = true;
            
            this.showStatus(`Starting to scrape ${branches.length} branches...`, 'info');
            
            for (let i = 0; i < branches.length; i++) {
                if (!this.isRunning) break;
                
                this.currentIndex = i;
                this.showStatus(`Processing branch ${i + 1}/${branches.length}: ${branches[i].branch_name}`, 'info');
                
                try {
                    const reviews = await this.scrapeBranchReviews(branches[i]);
                    this.results.push({
                        branch: branches[i],
                        reviews: reviews,
                        scraped_at: new Date().toISOString()
                    });
                    
                    this.updateResults();
                    await this.delay(2000); // Wait 2 seconds between requests
                    
                } catch (error) {
                    console.error(`Error scraping branch ${branches[i].branch_name}:`, error);
                    this.results.push({
                        branch: branches[i],
                        reviews: [],
                        error: error.message,
                        scraped_at: new Date().toISOString()
                    });
                }
            }
            
            this.showStatus(`Completed! Scraped ${this.results.length} branches`, 'success');
            document.getElementById('downloadResults').disabled = false;
            
        } catch (error) {
            this.showStatus(`Error: ${error.message}`, 'error');
        }
        
        this.isRunning = false;
        document.getElementById('startScraping').disabled = false;
    }

    async scrapeBranchReviews(branch) {
        return new Promise((resolve, reject) => {
            // Create search query for Google Maps
            const query = `${branch.branch_name} ${branch.address} BPI bank`;
            const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
            
            // Send message to content script
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs[0]) {
                    // Navigate to Google Maps search
                    chrome.tabs.update(tabs[0].id, {url: searchUrl}, () => {
                        // Wait for page to load then scrape
                        setTimeout(() => {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                action: 'scrapeReviews',
                                branch: branch
                            }, (response) => {
                                if (chrome.runtime.lastError) {
                                    reject(new Error(chrome.runtime.lastError.message));
                                } else if (response && response.success) {
                                    resolve(response.reviews);
                                } else {
                                    reject(new Error(response?.error || 'Failed to scrape reviews'));
                                }
                            });
                        }, 3000);
                    });
                } else {
                    reject(new Error('No active tab found'));
                }
            });
        });
    }

    updateResults() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.style.display = 'block';
        
        let html = '';
        this.results.forEach((result, index) => {
            html += `
                <div class="branch-result">
                    <strong>${result.branch.branch_name}</strong> - ${result.branch.city}
                    <br><small>${result.branch.address}</small>
                    ${result.error ? `<br><span style="color: red;">Error: ${result.error}</span>` : ''}
                    <div style="margin-top: 5px;">
                        Reviews found: <strong>${result.reviews.length}</strong>
                        ${result.reviews.slice(0, 2).map(review => `
                            <div class="review-item">
                                <span class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                                <div>${review.text.substring(0, 100)}${review.text.length > 100 ? '...' : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
    }

    downloadResults() {
        if (this.results.length === 0) {
            this.showStatus('No results to download', 'error');
            return;
        }

        // Flatten results for CSV
        const csvData = [];
        this.results.forEach(result => {
            if (result.reviews.length > 0) {
                result.reviews.forEach(review => {
                    csvData.push({
                        city: result.branch.city,
                        branch_name: result.branch.branch_name,
                        address: result.branch.address,
                        longitude: result.branch.longitude,
                        latitude: result.branch.latitude,
                        rating: review.rating,
                        review_text: review.text,
                        review_date: review.date || '',
                        reviewer_name: review.author || '',
                        scraped_at: result.scraped_at
                    });
                });
            } else {
                // Include branches with no reviews
                csvData.push({
                    city: result.branch.city,
                    branch_name: result.branch.branch_name,
                    address: result.branch.address,
                    longitude: result.branch.longitude,
                    latitude: result.branch.latitude,
                    rating: '',
                    review_text: result.error || 'No reviews found',
                    review_date: '',
                    reviewer_name: '',
                    scraped_at: result.scraped_at
                });
            }
        });

        // Convert to CSV
        const headers = Object.keys(csvData[0]);
        const csv = [headers.join(','), ...csvData.map(row => 
            headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
        )].join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bpi_reviews_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        this.showStatus('Results downloaded successfully!', 'success');
    }

    clearData() {
        document.getElementById('branchData').value = '';
        document.getElementById('results').style.display = 'none';
        this.results = [];
        document.getElementById('downloadResults').disabled = true;
        this.showStatus('Data cleared', 'info');
    }

    loadSavedData() {
        chrome.storage.local.get(['branchData'], (result) => {
            if (result.branchData) {
                document.getElementById('branchData').value = result.branchData;
            }
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', () => {
    new BPIReviewsScraper();
});