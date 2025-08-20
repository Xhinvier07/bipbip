// Gemini API Service for BipChat
const API_KEY = 'AIzaSyD7qQhUGKa54viEjTIVyTt6z2zcBPwbc40';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * System prompt that explains what BIP is and what data is available
 */
const SYSTEM_PROMPT = `
You are BIP (Branch Intelligence Platform) Assistant, an AI designed to help bank branch managers and executives analyze branch performance data.
You have access to data about:
- Branch performance metrics (BHS - Branch Health Score)
- Transaction volumes and types
- Wait times and customer flow
- Staff utilization and efficiency
- Customer satisfaction scores
- Branch locations and demographics

Your goal is to provide helpful, data-driven insights to improve branch operations and customer experience.
Always be professional, concise, and focus on actionable insights.

When analyzing data, consider:
1. Comparing branches against each other and against benchmarks
2. Identifying trends over time
3. Correlating different metrics (e.g., wait times vs. customer satisfaction)
4. Providing specific recommendations based on the data

Format your responses in a clear, structured way with bullet points for key insights.
`;

/**
 * Generate a response from Gemini API
 * @param {string} userInput - The user's message
 * @param {Array} history - Previous conversation history
 * @returns {Promise<Object>} - The AI response
 */
export const generateGeminiResponse = async (userInput, history = []) => {
  try {
    // Format conversation history for Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    // Add system prompt at the beginning
    const conversation = [
      { role: 'model', parts: [{ text: SYSTEM_PROMPT }] },
      ...formattedHistory,
      { role: 'user', parts: [{ text: userInput }] }
    ];
    
    // Make API request
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: conversation,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract the response text
    const responseText = data.candidates[0]?.content?.parts?.[0]?.text || 
      "I'm sorry, I couldn't generate a response. Please try again.";
    
    // Try to extract structured data if present
    let structuredData = null;
    try {
      // Look for JSON-like data in the response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        structuredData = JSON.parse(jsonMatch[1]);
      }
    } catch (error) {
      console.warn('Failed to parse structured data from response', error);
    }
    
    return {
      text: responseText.replace(/```json\n[\s\S]*?\n```/g, '').trim(), // Remove JSON blocks
      data: structuredData
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      text: "I'm sorry, I encountered an error while processing your request. Please try again later.",
      data: null
    };
  }
};

/**
 * Get suggested queries based on the conversation context
 * @returns {Array} - Array of suggested queries
 */
export const getSuggestedQueries = () => {
  const queries = [
    "Which branch has the best performance?",
    "Show me transaction volume trends",
    "Analyze wait times across branches",
    "What are the most common transaction types?",
    "How is staff being utilized?",
    "Show me customer satisfaction metrics",
    "Where are our branches located?",
    "What factors affect Branch Health Score?",
    "Forecast transaction volume next quarter"
  ];
  
  // Return a randomized subset of queries
  return queries.sort(() => 0.5 - Math.random()).slice(0, 3);
};
