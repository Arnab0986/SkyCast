// /api/ai-forecast.js - Simplified working version
module.exports = async (req, res) => {
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
            humidity = 50, 
            wind = 10, 
            uv = 5, 
            pm25 = 15 
        } = req.query;
        
        // Validate required parameters
        if (!city || !temperature || !condition) {
            return res.status(400).json({ 
                error: 'Missing required parameters',
                required: ['city', 'temperature', 'condition'],
                example: '/api/ai-forecast?city=London&temperature=22&condition=Sunny'
            });
        }
        
        // Parse parameters
        const temp = parseFloat(temperature);
        const humidityValue = parseFloat(humidity);
        const windSpeed = parseFloat(wind);
        const uvIndex = parseFloat(uv);
        const pm25Value = parseFloat(pm25);
        
        // Validate numeric parameters
        if (isNaN(temp)) {
            return res.status(400).json({ 
                error: 'Invalid temperature value',
                value: temperature
            });
        }
        
        // Generate AI forecast
        let forecast = '';
        let advice = '';
        
        // Temperature analysis
        if (temp > 35) {
            forecast = `Extreme heat in ${city} with ${condition}. `;
            advice = 'Stay indoors during peak hours (12PM-4PM). Drink plenty of water. ';
        } else if (temp > 30) {
            forecast = `Very warm in ${city} with ${condition}. `;
            advice = 'Stay hydrated and limit sun exposure. Wear light-colored clothing. ';
        } else if (temp > 25) {
            forecast = `Warm in ${city} with ${condition}. `;
            advice = 'Pleasant weather for outdoor activities. Stay hydrated. ';
        } else if (temp > 20) {
            forecast = `Mild in ${city} with ${condition}. `;
            advice = 'Perfect weather conditions. Enjoy outdoor activities. ';
        } else if (temp > 15) {
            forecast = `Cool in ${city} with ${condition}. `;
            advice = 'A light jacket may be needed. ';
        } else if (temp > 10) {
            forecast = `Chilly in ${city} with ${condition}. `;
            advice = 'Wear layers and consider a jacket. ';
        } else if (temp > 5) {
            forecast = `Cold in ${city} with ${condition}. `;
            advice = 'Dress warmly with multiple layers. ';
        } else if (temp > 0) {
            forecast = `Very cold in ${city} with ${condition}. `;
            advice = 'Bundle up with heavy coat, gloves, and hat. ';
        } else {
            forecast = `Freezing in ${city} with ${condition}. `;
            advice = 'Extreme cold - minimize time outdoors. Watch for frostbite. ';
        }
        
        // Additional advice based on conditions
        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
            advice += 'Rain expected - carry an umbrella or raincoat. ';
        }
        if (conditionLower.includes('snow') || conditionLower.includes('ice')) {
            advice += 'Snow/ice expected - wear waterproof boots, drive carefully. ';
        }
        if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
            advice += 'Storm expected - seek shelter if outdoors. ';
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
                }
            },
            generatedAt: new Date().toISOString(),
            location: city,
            model: 'skycast-ai-v1'
        };
        
        // Cache control headers
        res.setHeader('Cache-Control', 'public, max-age=1800');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        
        return res.status(200).json(aiResponse);
        
    } catch (error) {
        console.error('AI Forecast API error:', error);
        
        // Fallback response
        const fallbackResponse = {
            forecast: `Weather conditions in ${req.query.city || 'your location'} are ${req.query.condition || 'normal'} for this time of year.`,
            advice: 'Check local weather updates for accurate information.',
            generatedAt: new Date().toISOString(),
            model: 'fallback'
        };
        
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(200).json(fallbackResponse);
    }
};

// Helper functions
function getTemperatureFeeling(temp) {
    if (temp > 30) return 'hot';
    if (temp > 20) return 'warm';
    if (temp > 10) return 'mild';
    if (temp > 0) return 'cool';
    return 'cold';
}

function getAQILevel(pm25) {
    if (pm25 <= 12) return 'good';
    if (pm25 <= 35.4) return 'moderate';
    if (pm25 <= 55.4) return 'unhealthy-sensitive';
    if (pm25 <= 150.4) return 'unhealthy';
    return 'hazardous';
}

function getUVRisk(uvIndex) {
    if (uvIndex <= 2) return 'low';
    if (uvIndex <= 5) return 'moderate';
    if (uvIndex <= 7) return 'high';
    if (uvIndex <= 10) return 'very-high';
    return 'extreme';
}