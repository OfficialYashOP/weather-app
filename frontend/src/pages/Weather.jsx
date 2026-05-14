import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Cloud, CloudRain, Sun, Wind, Droplets, CloudLightning, Snowflake } from 'lucide-react';

function Weather() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeather('London');
  }, []);

  const fetchWeather = async (searchCity) => {
    if (!searchCity) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/weather?city=${searchCity}`);
      setWeatherData(response.data);
      if(response.data.coord) {
          localStorage.setItem('weather_coord', JSON.stringify(response.data.coord));
          localStorage.setItem('weather_city', response.data.name);
      }
      
      // Dynamic background based on weather
      const mainWeather = response.data.weather[0].main.toLowerCase();
      if (mainWeather.includes('rain') || mainWeather.includes('drizzle')) {
          document.body.className = 'bg-weather-rain';
      } else if (mainWeather.includes('cloud')) {
          document.body.className = 'bg-weather-clouds';
      } else {
          document.body.className = 'bg-weather-clear';
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch weather.');
      setWeatherData(null);
      document.body.className = 'bg-default';
    } finally {
      setLoading(false);
    }
  };

  // Reset background when unmounting
  useEffect(() => {
    return () => { document.body.className = 'bg-default'; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const getWeatherIcon = (main) => {
    switch (main.toLowerCase()) {
      case 'clouds': return <Cloud size={80} color="#cbd5e1" />;
      case 'rain': return <CloudRain size={80} color="#93c5fd" />;
      case 'clear': return <Sun size={80} color="#fde047" />;
      case 'snow': return <Snowflake size={80} color="#e0f2fe" />;
      case 'thunderstorm': return <CloudLightning size={80} color="#d8b4fe" />;
      case 'drizzle': return <CloudRain size={80} color="#bfdbfe" />;
      default: return <Sun size={80} color="#fde047" />;
    }
  };

  const renderFloatingElements = () => {
    if (!weatherData) return null;
    const main = weatherData.weather[0].main.toLowerCase();
    let Icon = Sun;
    let color = "#fde047";
    if (main.includes('rain')) { Icon = CloudRain; color = "#93c5fd"; }
    else if (main.includes('cloud')) { Icon = Cloud; color = "#cbd5e1"; }
    else if (main.includes('snow')) { Icon = Snowflake; color = "#e0f2fe"; }

    return (
      <div className="floating-elements">
        <Icon className="float-item" color={color} />
        <Icon className="float-item" color={color} />
        <Icon className="float-item" color={color} />
        <Icon className="float-item" color={color} />
        <Icon className="float-item" color={color} />
      </div>
    );
  };

  return (
    <>
    {renderFloatingElements()}
    <div className="app-container">
      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" className="search-button" disabled={loading || !city.trim()}>
          <Search size={20} />
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching weather data...</p>
        </div>
      ) : weatherData ? (
        <div className="weather-card">
          <div className="weather-icon-container">
            {getWeatherIcon(weatherData.weather[0].main)}
          </div>
          
          <h1 className="temp">
            {Math.round(weatherData.main.temp)}°
          </h1>
          <h2 className="city-name">{weatherData.name}, {weatherData.sys.country}</h2>
          <p className="weather-desc">{weatherData.weather[0].description}</p>
          
          <div className="details-grid">
            <div className="detail-item">
              <Droplets className="detail-icon" size={24} />
              <div className="detail-info">
                <span className="detail-value">{weatherData.main.humidity}%</span>
                <span className="detail-label">Humidity</span>
              </div>
            </div>
            
            <div className="detail-item">
              <Wind className="detail-icon" size={24} />
              <div className="detail-info">
                <span className="detail-value">{weatherData.wind.speed} m/s</span>
                <span className="detail-label">Wind Speed</span>
              </div>
            </div>
          </div>
        </div>
      ) : !error && (
         <div className="loading-state">
           <p>Search for a city to see weather.</p>
         </div>
      )}
    </div>
    </>
  );
}

export default Weather;
