// Background script for the BPI Reviews Scraper extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('BPI Reviews Scraper extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openTab') {
        chrome.tabs.create({ url: request.url }, (tab) => {
            sendResponse({ success: true, tabId: tab.id });
        });
        return true;
    }
    
    if (request.action === 'updateTab') {
        chrome.tabs.update(request.tabId, { url: request.url }, (tab) => {
            sendResponse({ success: true, tab: tab });
        });
        return true;
    }
});

// Save branch data when extension closes
chrome.runtime.onSuspend.addListener(() => {
    // Cleanup if needed
    console.log('Extension suspending');
});

// Handle tab updates for navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Inject content script if needed
        if (tab.url.includes('google.com/maps') || tab.url.includes('maps.google.com')) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }).catch(err => {
                // Content script might already be injected
                console.log('Content script injection skipped:', err.message);
            });
        }
    }
});