// Content script for scraping Google Reviews
class GoogleReviewsScraper {
    constructor() {
        this.setupMessageListener();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'scrapeReviews') {
                this.scrapeReviews(request.branch)
                    .then(reviews => {
                        sendResponse({ success: true, reviews: reviews });
                    })
                    .catch(error => {
                        sendResponse({ success: false, error: error.message });
                    });
                return true; // Keep message channel open for async response
            }
        });
    }

    async scrapeReviews(branch) {
        try {
            // Wait for page to load completely
            await this.waitForElement('[data-value="Sort"]', 10000);
            
            // Click on reviews tab if it exists
            await this.clickReviewsTab();
            
            // Wait a bit for reviews to load
            await this.delay(2000);
            
            // Try to load more reviews by scrolling
            await this.loadMoreReviews();
            
            // Extract reviews
            const reviews = this.extractReviews();
            
            console.log(`Found ${reviews.length} reviews for ${branch.branch_name}`);
            return reviews;
            
        } catch (error) {
            console.error('Error scraping reviews:', error);
            throw error;
        }
    }

    async clickReviewsTab() {
        // Look for reviews tab/button
        const reviewSelectors = [
            '[data-value="Reviews"]',
            'button[aria-label*="reviews"]',
            'button[aria-label*="Reviews"]',
            '[role="tab"][aria-label*="review" i]',
            'button:contains("Reviews")',
            '[data-tab-index="1"]' // Sometimes reviews is the second tab
        ];

        for (const selector of reviewSelectors) {
            try {
                const element = document.querySelector(selector);
                if (element) {
                    element.click();
                    await this.delay(1500);
                    return true;
                }
            } catch (e) {
                continue;
            }
        }

        // Try clicking on anything that looks like reviews
        const allButtons = document.querySelectorAll('button, [role="button"], [role="tab"]');
        for (const button of allButtons) {
            const text = button.textContent?.toLowerCase() || '';
            const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
            
            if (text.includes('review') || ariaLabel.includes('review')) {
                try {
                    button.click();
                    await this.delay(1500);
                    return true;
                } catch (e) {
                    continue;
                }
            }
        }

        return false;
    }

    async loadMoreReviews() {
        // Scroll down to load more reviews
        const scrollContainer = document.querySelector('[data-reviewid]')?.closest('[role="main"]') || 
                              document.querySelector('.m6QErb') ||
                              document.body;
        
        let previousReviewCount = 0;
        let stableCount = 0;
        
        for (let i = 0; i < 5; i++) { // Try 5 times max
            // Scroll to bottom
            scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
            await this.delay(1500);
            
            // Check if new reviews loaded
            const currentReviewCount = document.querySelectorAll('[data-reviewid], .jJc9Ad, .MyEned').length;
            
            if (currentReviewCount === previousReviewCount) {
                stableCount++;
                if (stableCount >= 2) break; // Stop if count stable for 2 iterations
            } else {
                stableCount = 0;
            }
            
            previousReviewCount = currentReviewCount;
            
            // Try clicking "More reviews" or similar buttons
            const moreButtons = document.querySelectorAll('button[aria-label*="more" i], button:contains("more"), .w8nwRe button');
            for (const btn of moreButtons) {
                try {
                    if (btn.offsetParent !== null) { // Check if visible
                        btn.click();
                        await this.delay(1000);
                    }
                } catch (e) {
                    continue;
                }
            }
        }
    }

    extractReviews() {
        const reviews = [];
        
        // Multiple selectors for different Google Maps layouts
        const reviewSelectors = [
            '[data-reviewid]',
            '.jJc9Ad',
            '.MyEned',
            '.fontBodyMedium[data-reviewid]',
            '[jsaction*="review"]'
        ];
        
        let reviewElements = [];
        
        for (const selector of reviewSelectors) {
            reviewElements = document.querySelectorAll(selector);
            if (reviewElements.length > 0) break;
        }
        
        console.log(`Found ${reviewElements.length} review elements`);
        
        reviewElements.forEach((element, index) => {
            try {
                const review = this.extractSingleReview(element);
                if (review && review.text && review.text.trim().length > 0) {
                    reviews.push(review);
                }
            } catch (error) {
                console.error(`Error extracting review ${index}:`, error);
            }
        });
        
        return reviews;
    }

    extractSingleReview(element) {
        const review = {
            text: '',
            rating: 0,
            author: '',
            date: ''
        };
        
        // Extract rating (stars)
        const ratingElements = element.querySelectorAll('[aria-label*="star" i], [aria-label*="Star" i]');
        if (ratingElements.length > 0) {
            const ratingText = ratingElements[0].getAttribute('aria-label') || '';
            const ratingMatch = ratingText.match(/(\d+)/);
            if (ratingMatch) {
                review.rating = parseInt(ratingMatch[1]);
            }
        }
        
        // Alternative rating extraction
        if (review.rating === 0) {
            const starElements = element.querySelectorAll('[style*="color: rgb(251, 188, 4)"], .kvMYJc');
            review.rating = starElements.length;
        }
        
        // Extract review text
        const textSelectors = [
            '.MyEned',
            '.wiI7pd',
            '[data-expandable-section]',
            '.fontBodyMedium > span',
            '.rsqaWe'
        ];
        
        for (const selector of textSelectors) {
            const textElement = element.querySelector(selector);
            if (textElement && textElement.textContent.trim()) {
                review.text = textElement.textContent.trim();
                break;
            }
        }
        
        // Extract author name
        const authorSelectors = [
            '.d4r55',
            '.WNxzHc',
            '.fontBodyMedium:first-child',
            '[data-value] .fontBodyMedium'
        ];
        
        for (const selector of authorSelectors) {
            const authorElement = element.querySelector(selector);
            if (authorElement && authorElement.textContent.trim()) {
                review.author = authorElement.textContent.trim();
                break;
            }
        }
        
        // Extract date
        const dateSelectors = [
            '.rsqaWe',
            '.fontCaption',
            'span[aria-label*="ago" i]'
        ];
        
        for (const selector of dateSelectors) {
            const dateElement = element.querySelector(selector);
            if (dateElement && dateElement.textContent.includes('ago')) {
                review.date = dateElement.textContent.trim();
                break;
            }
        }
        
        return review;
    }

    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the scraper
const scraper = new GoogleReviewsScraper();