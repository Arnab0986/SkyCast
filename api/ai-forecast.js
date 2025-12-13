// /api/ai-forecast.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { city, temperature, condition } = req.query;
    
    // Validate required parameters
    if (!city || !temperature || !condition) {
      return res.status(400).json({ 
        error: 'Missing required parameters: city, temperature, condition' 
      });
    }
    
    // In production, you would call OpenAI API here
    // For this demo, we'll generate a simple AI response
    
    const temp = parseFloat(temperature);
    let forecast = '';
    let advice = '';
    
    // Generate forecast based on temperature
    if (temp > 30) {
      forecast = `It's quite warm in ${city} with ${condition}. `;
      advice = 'Stay hydrated and avoid direct sun during peak hours. ';
    } else if (temp > 20) {
      forecast = `Enjoy pleasant weather in ${city} with ${condition}. `;
      advice = 'Perfect conditions for outdoor activities. ';
    } else if (temp > 10) {
      forecast = `It's cool in ${city} with ${condition}. `;
      advice = 'A light jacket would be comfortable. ';
    } else {
      forecast = `It's cold in ${city} with ${condition}. `;
      advice = 'Dress warmly and limit time outdoors. ';
    }
    
    // Add condition-specific advice
    if (condition.includes('rain')) {
      advice += 'Carry an umbrella or raincoat. ';
    } else if (condition.includes('snow')) {
      advice += 'Drive carefully if traveling. ';
    } else if (condition.includes('storm')) {
      advice += 'Seek shelter if outdoors. ';
    }
    
    // Combine into AI response
    const aiResponse = {
      forecast: forecast.trim(),
      advice: advice.trim(),
      generatedAt: new Date().toISOString(),
      model: 'gpt-4-mini-simulated'
    };
    
    // Cache control headers
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    return res.status(200).json(aiResponse);
    
  } catch (error) {
    console.error('AI Forecast API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      fallback: 'Weather conditions are normal for this time of year.'
    });
  }
}