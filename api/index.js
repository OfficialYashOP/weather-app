const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// We no longer need an API key since we are migrating to Open-Meteo (100% Free, No API Key needed)
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'dummy'; 

// Helper to convert WMO weather codes to OpenWeatherMap main conditions
const getWmoWeather = (code) => {
    if (code === 0) return { main: 'Clear', desc: 'clear sky' };
    if ([1, 2, 3].includes(code)) return { main: 'Clouds', desc: 'partly cloudy' };
    if ([45, 48].includes(code)) return { main: 'Clouds', desc: 'foggy' };
    if ([51, 53, 55, 56, 57].includes(code)) return { main: 'Drizzle', desc: 'drizzle' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { main: 'Rain', desc: 'rainy' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { main: 'Snow', desc: 'snowy' };
    if ([95, 96, 99].includes(code)) return { main: 'Thunderstorm', desc: 'thunderstorm' };
    return { main: 'Clear', desc: 'clear sky' };
};

app.get('/api/weather', async (req, res) => {
    const { city } = req.query;

    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    try {
        // 1. Geocoding: Get lat/lon for the city
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        
        if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
            return res.status(404).json({ error: 'City not found' });
        }
        
        const location = geoResponse.data.results[0];
        
        // 2. Fetch Weather Data from Open-Meteo
        const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        const current = weatherResponse.data.current;
        const wmo = getWmoWeather(current.weather_code);

        // 3. Map to OpenWeatherMap structure so frontend doesn't break
        const mappedData = {
            coord: { lat: location.latitude, lon: location.longitude },
            name: location.name,
            sys: { country: location.country_code || '' },
            weather: [{ main: wmo.main, description: wmo.desc }],
            main: { temp: current.temperature_2m, humidity: current.relative_humidity_2m },
            wind: { speed: current.wind_speed_10m }
        };

        res.json(mappedData);
    } catch (error) {
        console.error("Error fetching weather from Open-Meteo:", error.message);
        res.status(500).json({ error: 'Failed to fetch weather data. Please check the city name.' });
    }
});

app.get('/api/aqi', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    try {
        const response = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi`);
        
        const current = response.data.current;
        
        // Map European AQI (0-100) to 1-5 scale to match OpenWeatherMap format for the frontend
        let aqiLevel = 1;
        if (current.european_aqi > 20) aqiLevel = 2;
        if (current.european_aqi > 40) aqiLevel = 3;
        if (current.european_aqi > 60) aqiLevel = 4;
        if (current.european_aqi > 80) aqiLevel = 5;

        const mappedAqiData = {
            list: [{
                main: { aqi: aqiLevel },
                components: {
                    co: current.carbon_monoxide,
                    no2: current.nitrogen_dioxide,
                    o3: current.ozone,
                    so2: current.sulphur_dioxide,
                    pm2_5: current.pm2_5,
                    pm10: current.pm10
                }
            }]
        };

        res.json(mappedAqiData);
    } catch (error) {
        console.error("Error fetching AQI from Open-Meteo:", error.message);
        res.status(500).json({ error: 'Failed to fetch AQI data.' });
    }
});

app.get('/api/allergies', (req, res) => {
    // Simulated Allergy/Pollen data since free real-time APIs are restricted
    const { city } = req.query;
    
    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }
    
    // Generate random-ish data based on city name length to keep it somewhat consistent
    const seed = city.length;
    const data = {
        city,
        treePollen: { level: seed % 3 === 0 ? 'High' : (seed % 2 === 0 ? 'Medium' : 'Low'), index: (seed * 15) % 100 },
        grassPollen: { level: seed % 4 === 0 ? 'High' : (seed % 3 === 0 ? 'Medium' : 'Low'), index: (seed * 12) % 100 },
        weedPollen: { level: seed % 5 === 0 ? 'High' : (seed % 4 === 0 ? 'Medium' : 'Low'), index: (seed * 18) % 100 },
        overallRisk: seed % 3 === 0 ? 'High' : 'Moderate'
    };
    
    res.json(data);
});

// Catch-all route to serve the React app for any unhandled paths (for React Router)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// For Vercel Serverless Functions: Export the app instead of listening directly
if (process.env.NODE_ENV !== 'production' || process.env.RAILWAY_ENVIRONMENT) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
