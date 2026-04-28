import React, { useState, useEffect } from 'react';
import { MapPin, Info, Calendar, User } from 'lucide-react';

const VotingLocation: React.FC = () => {
  const [constituency, setConstituency] = useState<string>("Detecting...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
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
    <div className="location-card glass-card">
      <div className="location-header">
        <MapPin className="text-gradient" />
        <h3>Your Voting Info</h3>
      </div>
      
      {loading ? (
        <div className="aura-typing-indicator">
          <div className="aura-typing-dot"></div>
          <div className="aura-typing-dot"></div>
          <div className="aura-typing-dot"></div>
        </div>
      ) : (
        <div className="location-details">
          <div className="detail-item">
            <User size={18} />
            <div>
              <span className="detail-label">Constituency</span>
              <span className="detail-value">{constituency}</span>
            </div>
          </div>
          <div className="detail-item">
            <Calendar size={18} />
            <div>
              <span className="detail-label">Next Election</span>
              <span className="detail-value">Nov 15, 2026</span>
            </div>
          </div>
          <div className="detail-item">
            <Info size={18} />
            <div>
              <span className="detail-label">Status</span>
              <span className="detail-value text-green">Registration Open</span>
            </div>
          </div>
          
          <div className="map-placeholder glass-card">
            <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '0.5rem' }}>
              <MapPin size={24} color="var(--primary)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Google Maps API Placeholder</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingLocation;
