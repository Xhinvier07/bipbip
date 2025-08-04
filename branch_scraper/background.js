// Background script for the BPI Branch Scraper extension

chrome.runtime.onInstalled.addListener(() => {
    console.log('BPI Branch Scraper extension installed');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrapeData') {
        // Handle scraping requests if needed
        sendResponse({success: true});
    }
    
    if (request.action === 'openOptionsPage') {
        chrome.runtime.openOptionsPage();
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // Check if we're on the BPI page
    if (tab.url.includes('bpi.com.ph/about-bpi/contact-us')) {
        // Inject content script if not already injected
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
    }
});