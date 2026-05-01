import React, { useState, useEffect } from 'react';
import { MapPin, Info, Calendar, User } from 'lucide-react';

const VotingLocation: React.FC = () => {
  const [constituency, setConstituency] = useState<string>("Detecting...");
  const [electionDate, setElectionDate] = useState<string>("Fetching...");
  const [status, setStatus] = useState<string>("Fetching...");
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: 17.3850, lng: 78.4867 }); // Hyderabad, India

  useEffect(() => {
    // Simulate fetching real-time location and election data
    setTimeout(() => {
      setCoords({ lat: 17.3850, lng: 78.4867 }); // Hyderabad coordinates
      setConstituency("Hyderabad");
      setElectionDate("Feb 2026 (GHMC)");
      setStatus("Registration Open");
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="location-card glass-card" role="region" aria-label="Voting Location Information">
      <div className="location-header">
        <MapPin className="text-gradient" aria-hidden="true" />
        <h3>Your Voting Info</h3>
      </div>

      {loading ? (
        <div className="aura-typing-indicator" aria-label="Loading location data">
          <div className="aura-typing-dot"></div>
          <div className="aura-typing-dot"></div>
          <div className="aura-typing-dot"></div>
        </div>
      ) : (
        <div className="location-details">
          <div className="detail-item">
            <User size={18} aria-hidden="true" />
            <div>
              <span className="detail-label">Constituency</span>
              <span className="detail-value">{constituency}</span>
            </div>
          </div>
          <div className="detail-item">
            <Calendar size={18} aria-hidden="true" />
            <div>
              <span className="detail-label">Next Election</span>
              <span className="detail-value">{electionDate}</span>
            </div>
          </div>
          <div className="detail-item">
            <Info size={18} aria-hidden="true" />
            <div>
              <span className="detail-label">Status</span>
              <span className="detail-value text-green">
                <a 
                  href="https://voters.eci.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {status}
                </a>
              </span>
            </div>
          </div>

          <div className="map-container-fixed glass-card overflow-hidden mt-4">
            <iframe
              title="Google Maps Location"
              width="100%"
              height="100%"
              className="map-iframe"
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/place?key=${(import.meta as any).env.VITE_MAPS_API_KEY}&q=${coords.lat},${coords.lng}&zoom=14`}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingLocation;
