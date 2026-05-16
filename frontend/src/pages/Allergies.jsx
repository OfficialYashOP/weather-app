import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bug, Trees, Flower2, Leaf } from 'lucide-react';

function Allergies() {
  const [allergyData, setAllergyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    fetchAllergies();
  }, []);

  const fetchAllergies = async () => {
    const storedCity = localStorage.getItem('weather_city');
    
    if (!storedCity) {
      setError('Please search for a city in the Weather tab first.');
      return;
    }

    setCityName(storedCity);
    setLoading(true);
    setError('');

    try {
      // Use relative URL so it works in production
      const response = await axios.get(`/api/allergies?city=${storedCity}`);
      setAllergyData(response.data);
      
      const risk = response.data.overallRisk;
      if (risk === 'High') {
          document.body.className = 'bg-allergy-high';
      } else {
          document.body.className = 'bg-allergy-low';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch Allergy data.');
      document.body.className = 'bg-default';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => { document.body.className = 'bg-default'; };
  }, []);

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const renderFloatingElements = () => {
    if (!allergyData) return null;
    const risk = allergyData.overallRisk;
    let Icon = risk === 'High' ? Bug : Flower2;
    let color = risk === 'High' ? "#ef4444" : "#10b981";

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
      <h2 className="page-title">Allergy Tracker</h2>
      
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing pollen data...</p>
        </div>
      ) : allergyData ? (
        <div className="weather-card">
          <h3 className="city-name" style={{ fontSize: '20px', marginBottom: '8px' }}>{cityName}</h3>
          
          <div style={{ marginBottom: '24px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Bug color={getRiskColor(allergyData.overallRisk)} size={32} />
             <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Overall Risk</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: getRiskColor(allergyData.overallRisk) }}>
                  {allergyData.overallRisk}
                </div>
             </div>
          </div>
          
          <div className="details-grid" style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
            <div className="detail-item" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Trees className="detail-icon" size={24} />
                <div className="detail-info">
                  <span className="detail-label">Tree Pollen</span>
                  <span className="detail-value" style={{ color: getRiskColor(allergyData.treePollen.level) }}>
                    {allergyData.treePollen.level}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', opacity: 0.8 }}>
                 {allergyData.treePollen.index}
              </div>
            </div>
            
            <div className="detail-item" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Flower2 className="detail-icon" size={24} />
                <div className="detail-info">
                  <span className="detail-label">Grass Pollen</span>
                  <span className="detail-value" style={{ color: getRiskColor(allergyData.grassPollen.level) }}>
                    {allergyData.grassPollen.level}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', opacity: 0.8 }}>
                 {allergyData.grassPollen.index}
              </div>
            </div>

            <div className="detail-item" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Leaf className="detail-icon" size={24} />
                <div className="detail-info">
                  <span className="detail-label">Weed Pollen</span>
                  <span className="detail-value" style={{ color: getRiskColor(allergyData.weedPollen.level) }}>
                    {allergyData.weedPollen.level}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', opacity: 0.8 }}>
                 {allergyData.weedPollen.index}
              </div>
            </div>
          </div>
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

export default Allergies;
