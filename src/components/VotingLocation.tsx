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
          
          <div className="map-placeholder glass-card mt-4 flex items-center justify-center bg-gray-900/50" style={{ height: '200px', width: '100%' }}>
            <div className="text-center p-4 text-gray-400">
              <MapPin className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm italic">Voting center map currently unavailable</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingLocation;
