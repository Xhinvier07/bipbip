// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeReviews') {
    const reviews = scrapeReviews();
    sendResponse({ reviews: reviews });
  }
  return true; // Keep the message channel open for async response
});

// Function to scrape all reviews from the page
function scrapeReviews() {
  const reviews = [];
  const seenReviews = new Set(); // To track duplicates
  
  // Extract branch name from URL
  let branchName = '';
  try {
    const url = window.location.href;
    // Extract branch name from URL like https://www.google.com/maps/place/BPI+Corinthian+Plaza+Branch/
    const match = url.match(/\/maps\/place\/([^\/]+)\/@/);
    if (match && match[1]) {
      // Decode the URL component and replace + with spaces
      branchName = decodeURIComponent(match[1].replace(/\+/g, ' '));
      console.log('Extracted branch name:', branchName);
    }
  } catch (error) {
    console.error('Error extracting branch name:', error);
  }
  
  // Find all review containers
  const reviewElements = document.querySelectorAll('[data-review-id]');
  console.log('Found review elements:', reviewElements.length);
  
  reviewElements.forEach(reviewElement => {
    try {
      // Extract review text - even if it doesn't exist
      let text = '';
      const textElement = reviewElement.querySelector('.wiI7pd');
      if (textElement) {
        text = textElement.textContent.trim();
      }
      
      // Extract star rating - try multiple methods
      let stars = 0;
      
      // Method 1: Try to get from aria-label attribute
      const starsContainer = reviewElement.querySelector('.kvMYJc[role="img"]');
      if (starsContainer) {
        const ariaLabel = starsContainer.getAttribute('aria-label');
        if (ariaLabel) {
          // Extract number from aria-label like "1 star", "5 stars", etc.
          const match = ariaLabel.match(/(\d+)\s+stars?/i);
          if (match) {
            stars = parseInt(match[1]);
            console.log('Stars from aria-label:', stars);
          }
        }
      }
      
      // Method 2: If aria-label method didn't work, count filled star elements
      if (stars === 0) {
        const starsContainerAlt = reviewElement.querySelector('.kvMYJc');
        if (starsContainerAlt) {
          const filledStars = starsContainerAlt.querySelectorAll('.elGi1d');
          stars = filledStars.length;
          console.log('Stars from counting elGi1d:', stars);
        }
      }
      
      // Method 3: If still no stars, try looking in the broader container
      if (stars === 0) {
        const duContainer = reviewElement.querySelector('.DU9Pgb');
        if (duContainer) {
          const kvContainer = duContainer.querySelector('.kvMYJc');
          if (kvContainer) {
            // Try aria-label first
            const ariaLabel = kvContainer.getAttribute('aria-label');
            if (ariaLabel) {
              const match = ariaLabel.match(/(\d+)\s+stars?/i);
              if (match) {
                stars = parseInt(match[1]);
                console.log('Stars from DU9Pgb aria-label:', stars);
              }
            }
            // If still no luck, count filled stars
            if (stars === 0) {
              const filledStars = kvContainer.querySelectorAll('.elGi1d');
              stars = filledStars.length;
              console.log('Stars from DU9Pgb elGi1d count:', stars);
            }
          }
        }
      }
      
      // Extract date
      let date = '';
      const dateElement = reviewElement.querySelector('.rsqaWe');
      if (dateElement) {
        date = dateElement.textContent.trim();
      }
      
      // Skip empty reviews (no stars, no date, no text)
      if (stars === 0 && date === '' && text === '') {
        console.log('Skipping empty review');
        return;
      }
      
      // Create a unique identifier for this review to avoid duplicates
      const reviewId = reviewElement.getAttribute('data-review-id') || '';
      const uniqueKey = `${reviewId}_${text}_${stars}_${date}`;
      
      // Skip if we've already seen this review
      if (seenReviews.has(uniqueKey)) {
        console.log('Skipping duplicate review:', uniqueKey);
        return;
      }
      
      seenReviews.add(uniqueKey);
      
      // Add review to the array with branch name
      reviews.push({
        text: text,
        stars: stars,
        date: date,
        branchName: branchName
      });
      
      console.log('Added review:', { text, stars, date, branchName });
    } catch (error) {
      console.error('Error processing review:', error);
    }
  });
  
  console.log('Total reviews scraped:', reviews.length);
  return reviews;
}

// Helper function to check if all reviews are loaded
function areAllReviewsLoaded() {
  // This is a simple check - you might need to adjust based on the actual page structure
  const loadMoreButton = document.querySelector('[jsaction="pane.review.nextPage"]');
  return !loadMoreButton || loadMoreButton.disabled;
}

// Add a message to the page to indicate the extension is active
const messageDiv = document.createElement('div');
messageDiv.style.position = 'fixed';
messageDiv.style.top = '10px';
messageDiv.style.right = '10px';
messageDiv.style.padding = '10px';
messageDiv.style.backgroundColor = 'rgba(66, 133, 244, 0.9)';
messageDiv.style.color = 'white';
messageDiv.style.borderRadius = '4px';
messageDiv.style.zIndex = '9999';
messageDiv.style.display = 'none';
messageDiv.textContent = 'Google Reviews Scraper is active';
document.body.appendChild(messageDiv);

// Show the message briefly when the page loads
setTimeout(() => {
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}, 1000);