/**
 * AIFormattingGuide.js
 * 
 * This file contains formatting instructions and utilities for AI responses
 * to ensure consistent, well-formatted output in the BIP chat interfaces.
 */

/**
 * Configuration for AI response formatting
 * Edit these settings to customize how AI responses are formatted
 */
export const formattingConfig = {
  // Color scheme for highlighted elements
  colors: {
    branchName: '#FEA000',      // Orange for branch names
    numbers: '#CF3D58',         // Red for numeric values
    waitTime: '#BC7EFF',        // Purple for wait times
    transactions: '#00BFA6',    // Teal for transaction counts
    bhs: '#CF3D58',             // Red for BHS scores
    headings: '#333333',        // Dark gray for section headings
    subheadings: '#555555'      // Medium gray for sub-headings
  },
  
  // Whether to automatically format responses
  autoFormat: true,
  
  // Whether to show visualizations only when explicitly requested
  visualizationsOnlyWhenRequested: true,
  
  // Maximum length for paragraphs before adding a break
  maxParagraphLength: 150,
  
  // Whether to use bullet points for lists
  useBulletPoints: true,
  
  // Format for bullet points
  bulletPointFormat: '• ',
  
  // Whether to add spacing between sections
  addSectionSpacing: true
};

/**
 * Format response text to highlight important information using HTML tags
 * @param {string} text - The response text from the AI
 * @returns {string} - HTML-formatted text with important data highlighted
 */
export const formatResponseText = (text) => {
  if (!text || !formattingConfig.autoFormat) return text;
  
  let formattedText = text;
  
  // Replace markdown bold with HTML bold
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  formattedText = formattedText.replace(/__(.*?)__/g, '<b>$1</b>');
  
  // Replace markdown italic with HTML italic
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<i>$1</i>');
  formattedText = formattedText.replace(/_(.*?)_/g, '<i>$1</i>');
  
  // Format branch names (assumes branch names are followed by "branch" or are proper nouns)
  formattedText = formattedText.replace(
    /([A-Z][a-z]+ (?:[A-Z][a-z]+ )?(?:Branch|Avenue|Plaza|Center|Mall|BGC|Fort))/g, 
    `<b style="color: ${formattingConfig.colors.branchName}">$1</b>`
  );
  
  // Format specific branch names that don't follow the pattern above
  const branchNames = [
    'Roces', 'PSE The Fort', 'W5Th Avenue BGC', 'Malabon Rizal', 'Divisoria',
    'Market Market', 'One Global Place', 'Infinity', 'Rockwell the Grove',
    'Medical Plaza - Makati', 'Ayala Nex Tower', 'Araneta - E. Rodriguez', 'Ayala Avenue SGV'
  ];
  
  branchNames.forEach(branch => {
    const regex = new RegExp(`\\b${branch}\\b`, 'g');
    formattedText = formattedText.replace(
      regex, 
      `<b style="color: ${formattingConfig.colors.branchName}">${branch}</b>`
    );
  });
  
  // Format numeric values with units
  formattedText = formattedText.replace(
    /(\d+(?:\.\d+)?%)/g, 
    `<b style="color: ${formattingConfig.colors.numbers}">$1</b>`
  );
  
  formattedText = formattedText.replace(
    /(\d+(?:\.\d+)? minutes?)/g, 
    `<b style="color: ${formattingConfig.colors.waitTime}">$1</b>`
  );
  
  formattedText = formattedText.replace(
    /(\d+(?:\.\d+)? transactions?)/g, 
    `<b style="color: ${formattingConfig.colors.transactions}">$1</b>`
  );
  
  // Format BHS scores
  formattedText = formattedText.replace(
    /(BHS(?:\s+of)?\s+)(\d+(?:\.\d+)?)/g, 
    `$1<b style="color: ${formattingConfig.colors.bhs}">$2</b>`
  );
  
  // Format section headings (lines ending with a colon)
  formattedText = formattedText.replace(
    /(^|\n)([^:\n]+):\s*(\n|$)/g,
    `$1<b style="color: ${formattingConfig.colors.headings}; font-size: 1.1em;">$2:</b>$3`
  );
  
  // Improve bullet point formatting
  if (formattingConfig.useBulletPoints) {
    // Replace markdown bullet points with HTML
    formattedText = formattedText.replace(
      /(^|\n)\s*[-*•]\s+/g,
      `$1<span style="margin-right: 6px;">${formattingConfig.bulletPointFormat}</span>`
    );
  }
  
  // Add spacing between paragraphs for better readability
  if (formattingConfig.addSectionSpacing) {
    formattedText = formattedText.replace(/\n\n/g, '<br><br>');
  }
  
  return formattedText;
};

/**
 * Determines if a visualization should be shown based on the user query
 * @param {string} userQuery - The user's query
 * @returns {boolean} - Whether to show a visualization
 */
export const shouldShowVisualization = (userQuery) => {
  if (!formattingConfig.visualizationsOnlyWhenRequested) {
    return true;
  }
  
  const visualizationKeywords = [
    'chart', 'graph', 'visual', 'show me', 'compare', 
    'visualization', 'display', 'plot', 'trend'
  ];
  
  return visualizationKeywords.some(keyword => 
    userQuery.toLowerCase().includes(keyword)
  );
};

/**
 * Creates a structured response format for specific query types
 * @param {string} queryType - The type of query (e.g., 'wait_time', 'branch_performance')
 * @param {Object} data - The data to include in the response
 * @returns {string} - A formatted response template
 */
export const createStructuredResponse = (queryType, data) => {
  switch (queryType) {
    case 'wait_time':
      return `
        <b style="color: ${formattingConfig.colors.headings}; font-size: 1.1em;">Wait Time Analysis:</b><br>
        <span style="margin-right: 6px;">${formattingConfig.bulletPointFormat}</span>Overall Average: <b style="color: ${formattingConfig.colors.waitTime}">${data.average} minutes</b><br>
        <span style="margin-right: 6px;">${formattingConfig.bulletPointFormat}</span>Longest Wait: <b style="color: ${formattingConfig.colors.branchName}">${data.longest.branch}</b> at <b style="color: ${formattingConfig.colors.waitTime}">${data.longest.time} minutes</b><br>
        <span style="margin-right: 6px;">${formattingConfig.bulletPointFormat}</span>Shortest Wait: <b style="color: ${formattingConfig.colors.branchName}">${data.shortest.branch}</b> at <b style="color: ${formattingConfig.colors.waitTime}">${data.shortest.time} minutes</b>
      `;
    
    case 'branch_performance':
      return `
        <b style="color: ${formattingConfig.colors.headings}; font-size: 1.1em;">Branch Performance:</b><br>
        <span style="margin-right: 6px;">${formattingConfig.bulletPointFormat}</span>Top Branch: <b style="color: ${formattingConfig.colors.branchName}">${data.top.branch}</b> with BHS <b style="color: ${formattingConfig.colors.bhs}">${data.top.bhs}</b><br>
        <span style="margin-right: 6px;">${formattingConfig.bulletPointFormat}</span>Average BHS: <b style="color: ${formattingConfig.colors.bhs}">${data.average}</b>
      `;
    
    default:
      return '';
  }
};
