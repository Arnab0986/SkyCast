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
}// /api/ai-forecast.js - Enhanced AI Weather Forecast API
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['GET']
    });
  }
  
  try {
    const { 
      city, 
      temperature, 
      condition, 
      humidity, 
      wind, 
      uv, 
      pm25 
    } = req.query;
    
    // Validate required parameters
    if (!city || !temperature || !condition) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['city', 'temperature', 'condition'],
        received: { city, temperature, condition, humidity, wind, uv, pm25 }
      });
    }
    
    // Parse parameters
    const temp = parseFloat(temperature);
    const humidityValue = humidity ? parseFloat(humidity) : 50;
    const windSpeed = wind ? parseFloat(wind) : 10;
    const uvIndex = uv ? parseFloat(uv) : 5;
    const pm25Value = pm25 ? parseFloat(pm25) : 15;
    
    // Validate numeric parameters
    if (isNaN(temp)) {
      return res.status(400).json({ 
        error: 'Invalid temperature value',
        value: temperature
      });
    }
    
    // Generate detailed AI forecast based on all parameters
    let forecast = '';
    let advice = '';
    
    // Temperature analysis
    if (temp > 35) {
      forecast = `Extreme heat in ${city} with ${condition}. `;
      advice = 'Stay indoors during peak hours (12PM-4PM). Drink plenty of water and avoid strenuous activities. ';
    } else if (temp > 30) {
      forecast = `Very warm in ${city} with ${condition}. `;
      advice = 'Stay hydrated and limit sun exposure. Wear light-colored, loose-fitting clothing. ';
    } else if (temp > 25) {
      forecast = `Warm in ${city} with ${condition}. `;
      advice = 'Pleasant weather for outdoor activities. Stay hydrated. ';
    } else if (temp > 20) {
      forecast = `Mild in ${city} with ${condition}. `;
      advice = 'Perfect weather conditions. Enjoy outdoor activities. ';
    } else if (temp > 15) {
      forecast = `Cool in ${city} with ${condition}. `;
      advice = 'A light jacket may be needed, especially in the evening. ';
    } else if (temp > 10) {
      forecast = `Chilly in ${city} with ${condition}. `;
      advice = 'Wear layers and consider a jacket. ';
    } else if (temp > 5) {
      forecast = `Cold in ${city} with ${condition}. `;
      advice = 'Dress warmly with multiple layers. Limit time outdoors. ';
    } else if (temp > 0) {
      forecast = `Very cold in ${city} with ${condition}. `;
      advice = 'Bundle up with heavy coat, gloves, and hat. Avoid prolonged exposure. ';
    } else {
      forecast = `Freezing in ${city} with ${condition}. `;
      advice = 'Extreme cold - minimize time outdoors. Watch for frostbite warning signs. ';
    }
    
    // Humidity consideration
    if (humidityValue > 80) {
      advice += 'High humidity may make it feel warmer. ';
    } else if (humidityValue < 30) {
      advice += 'Low humidity - stay hydrated as moisture evaporates quickly. ';
    }
    
    // Wind consideration
    if (windSpeed > 30) {
      advice += 'Strong winds - secure loose objects and be cautious outdoors. ';
    } else if (windSpeed > 20) {
      advice += 'Breezy conditions - may feel cooler than actual temperature. ';
    }
    
    // UV Index analysis
    if (uvIndex > 10) {
      advice += 'Extreme UV radiation - avoid sun between 10AM-4PM, use SPF 50+ sunscreen. ';
    } else if (uvIndex > 7) {
      advice += 'Very high UV - use SPF 30+ sunscreen, wear hat and sunglasses. ';
    } else if (uvIndex > 5) {
      advice += 'High UV - use SPF 15+ sunscreen, seek shade during midday. ';
    } else if (uvIndex > 2) {
      advice += 'Moderate UV - some protection recommended. ';
    }
    
    // Air quality analysis
    if (pm25Value > 150) {
      advice += 'Hazardous air quality - avoid all outdoor activities, use air purifiers indoors. ';
    } else if (pm25Value > 55) {
      advice += 'Unhealthy air quality - limit outdoor exertion, sensitive groups stay indoors. ';
    } else if (pm25Value > 35) {
      advice += 'Moderate air quality - unusually sensitive individuals should reduce outdoor activity. ';
    } else if (pm25Value > 12) {
      advice += 'Good air quality - generally safe for everyone. ';
    } else {
      advice += 'Excellent air quality - ideal for outdoor activities. ';
    }
    
    // Condition-specific advice
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      advice += 'Rain expected - carry an umbrella or raincoat, drive carefully on wet roads. ';
    }
    if (conditionLower.includes('snow') || conditionLower.includes('ice')) {
      advice += 'Snow/ice expected - wear waterproof boots, allow extra travel time, drive with caution. ';
    }
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
      advice += 'Storm expected - seek shelter if outdoors, avoid open areas and tall trees. ';
    }
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      advice += 'Reduced visibility - drive with headlights on low beam, allow extra following distance. ';
    }
    
    // Time of day consideration (based on temperature pattern)
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      advice += 'Nighttime - temperatures may drop further, dress accordingly. ';
    }
    
    // Generate AI response
    const aiResponse = {
      forecast: forecast.trim(),
      advice: advice.trim(),
      analysis: {
        temperature: {
          value: temp,
          unit: 'celsius',
          feeling: getTemperatureFeeling(temp)
        },
        airQuality: {
          pm25: pm25Value,
          level: getAQILevel(pm25Value)
        },
        uvIndex: {
          value: uvIndex,
          risk: getUVRisk(uvIndex)
        },
        generatedAt: new Date().toISOString(),
        location: city,
        model: 'skycast-ai-v2'
      }
    };
    
    // Cache control headers
    res.setHeader('Cache-Control', 'public, max-age=1800'); // Cache for 30 minutes
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    return res.status(200).json(aiResponse);
    
  } catch (error) {
    console.error('AI Forecast API error:', error);
    
    // Fallback response
    const fallbackResponse = {
      forecast: `Weather conditions in ${req.query.city || 'your location'} are ${req.query.condition || 'normal'} for this time of year.`,
      advice: 'Check local weather updates for the most accurate information.',
      generatedAt: new Date().toISOString(),
      model: 'fallback'
    };
    
    return res.status(200).json(fallbackResponse);
  }
}

// Helper function to get temperature feeling
function getTemperatureFeeling(temp) {
  if (temp > 30) return 'hot';
  if (temp > 20) return 'warm';
  if (temp > 10) return 'mild';
  if (temp > 0) return 'cool';
  return 'cold';
}

// Helper function to get AQI level
function getAQILevel(pm25) {
  if (pm25 <= 12) return 'good';
  if (pm25 <= 35.4) return 'moderate';
  if (pm25 <= 55.4) return 'unhealthy-sensitive';
  if (pm25 <= 150.4) return 'unhealthy';
  return 'hazardous';
}

// Helper function to get UV risk
function getUVRisk(uvIndex) {
  if (uvIndex <= 2) return 'low';
  if (uvIndex <= 5) return 'moderate';
  if (uvIndex <= 7) return 'high';
  if (uvIndex <= 10) return 'very-high';
  return 'extreme';
}