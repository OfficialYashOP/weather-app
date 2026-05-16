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

// OpenWeatherMap API Key (Usually put in .env, using a placeholder/default for demo or expect user to add)
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'bd5e378503939ddaee76f12ad7a97608'; // Sample API key for demo, ideally user should replace

app.get('/api/weather', async (req, res) => {
    const { city } = req.query;

    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching weather:", error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to fetch weather data. Please check the city name.'
        });
    }
});

app.get('/api/aqi', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    try {
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching AQI:", error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to fetch AQI data.'
        });
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
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
