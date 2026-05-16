import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wind, AlertTriangle, CheckCircle, Info } from 'lucide-react';

function AirQuality() {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    fetchAQI();
  }, []);

  const fetchAQI = async () => {
    const coordsStr = localStorage.getItem('weather_coord');
    const storedCity = localStorage.getItem('weather_city');
    
    if (!coordsStr) {
      setError('Please search for a city in the Weather tab first.');
      return;
    }

    setCityName(storedCity || 'Selected City');
    setLoading(true);
    setError('');

    try {
      const { lat, lon } = JSON.parse(coordsStr);
      // Use relative URL so it works in production
      const response = await axios.get(`/api/aqi?lat=${lat}&lon=${lon}`);
      setAqiData(response.data);
      
      const aqiValue = response.data.list[0].main.aqi;
      if (aqiValue <= 2) {
          document.body.className = 'bg-aqi-good';
      } else {
          document.body.className = 'bg-aqi-poor';
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch Air Quality data.');
      document.body.className = 'bg-default';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => { document.body.className = 'bg-default'; };
  }, []);

  const getAQIStatus = (aqi) => {
    switch (aqi) {
      case 1: return { text: 'Good', color: '#4ade80', icon: <CheckCircle color="#4ade80" size={48} /> };
      case 2: return { text: 'Fair', color: '#facc15', icon: <Info color="#facc15" size={48} /> };
      case 3: return { text: 'Moderate', color: '#fb923c', icon: <AlertTriangle color="#fb923c" size={48} /> };
      case 4: return { text: 'Poor', color: '#f87171', icon: <AlertTriangle color="#f87171" size={48} /> };
      case 5: return { text: 'Very Poor', color: '#dc2626', icon: <AlertTriangle color="#dc2626" size={48} /> };
      default: return { text: 'Unknown', color: '#94a3b8', icon: <Info color="#94a3b8" size={48} /> };
    }
  };

  const renderFloatingElements = () => {
    if (!aqiData || !aqiData.list || aqiData.list.length === 0) return null;
    const aqiValue = aqiData.list[0].main.aqi;
    let Icon = aqiValue <= 2 ? CheckCircle : AlertTriangle;
    let color = aqiValue <= 2 ? "#4ade80" : "#f87171";

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
      <h2 className="page-title">Air Quality Index</h2>
      
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching AQI data...</p>
        </div>
      ) : aqiData && aqiData.list && aqiData.list.length > 0 ? (
        <div className="weather-card">
          <h3 className="city-name" style={{ fontSize: '20px', marginBottom: '24px' }}>{cityName}</h3>
          
          {(() => {
            const data = aqiData.list[0];
            const status = getAQIStatus(data.main.aqi);
            return (
              <>
                <div className="weather-icon-container" style={{ filter: 'none', marginBottom: '8px' }}>
                  {status.icon}
                </div>
                
                <h1 className="temp" style={{ fontSize: '48px', color: status.color, WebkitTextFillColor: status.color }}>
                  {status.text}
                </h1>
                <p className="weather-desc">Index Level: {data.main.aqi} / 5</p>

                <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="detail-item" style={{ padding: '12px', flexDirection: 'column', gap: '4px' }}>
                    <span className="detail-label">CO</span>
                    <span className="detail-value">{data.components.co}</span>
                  </div>
                  <div className="detail-item" style={{ padding: '12px', flexDirection: 'column', gap: '4px' }}>
                    <span className="detail-label">NO2</span>
                    <span className="detail-value">{data.components.no2}</span>
                  </div>
                  <div className="detail-item" style={{ padding: '12px', flexDirection: 'column', gap: '4px' }}>
                    <span className="detail-label">O3</span>
                    <span className="detail-value">{data.components.o3}</span>
                  </div>
                  <div className="detail-item" style={{ padding: '12px', flexDirection: 'column', gap: '4px' }}>
                    <span className="detail-label">SO2</span>
                    <span className="detail-value">{data.components.so2}</span>
                  </div>
                  <div className="detail-item" style={{ padding: '12px', flexDirection: 'column', gap: '4px' }}>
                    <span className="detail-label">PM2.5</span>
                    <span className="detail-value">{data.components.pm2_5}</span>
                  </div>
                  <div className="detail-item" style={{ padding: '12px', flexDirection: 'column', gap: '4px' }}>
                    <span className="detail-label">PM10</span>
                    <span className="detail-value">{data.components.pm10}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      ) : !error && (
         <div className="loading-state">
           <p>No data available.</p>
         </div>
      )}
    </div>
    </>
  );
}

export default AirQuality;
