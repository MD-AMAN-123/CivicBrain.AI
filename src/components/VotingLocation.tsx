import React, { useState, useEffect } from 'react';
import { MapPin, Info, Calendar, User } from 'lucide-react';

const VotingLocation: React.FC = () => {
  const [constituency, setConstituency] = useState<string>("Detecting...");
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          // In a real app, we would use reverse geocoding to get the constituency
          setConstituency("New Delhi Central");
          setLoading(false);
        },
        () => {
          setConstituency("Location Access Denied");
          setLoading(false);
        }
      );
    }
  }, []);

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_MAPS_API_KEY}&q=${coords.lat},${coords.lng}&zoom=14`;


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
              <span className="detail-value">Nov 15, 2026</span>
            </div>
          </div>
          <div className="detail-item">
            <Info size={18} aria-hidden="true" />
            <div>
              <span className="detail-label">Status</span>
              <span className="detail-value text-green">Registration Open</span>
            </div>
          </div>
          
          <div className="map-container glass-card overflow-hidden mt-4" style={{ height: '200px', width: '100%' }}>
            <iframe
              title="Google Maps Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={mapUrl}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingLocation;

