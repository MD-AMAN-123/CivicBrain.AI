import React from 'react';
import { Users, FileUp, BarChart, ShieldAlert } from 'lucide-react';

const Admin: React.FC = () => {
  return (
    <div className="admin-view">
      <div className="admin-header">
        <h2 className="view-title">Admin <span className="text-gradient">Control Panel</span></h2>
        <div className="auth-badge">
          <ShieldAlert size={16} />
          <span>Security Level: Administrator</span>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card glass-card">
          <header>
            <Users />
            <h3>User Analytics</h3>
          </header>
          <div className="card-body">
            <div className="admin-stat">
              <span className="label">Total Active Users</span>
              <span className="value">1,284</span>
            </div>
            <div className="admin-stat">
              <span className="label">New Registrations Today</span>
              <span className="value">+42</span>
            </div>
          </div>
          <button className="admin-btn">View Detailed Reports</button>
        </div>

        <div className="admin-card glass-card">
          <header>
            <FileUp />
            <h3>Content Management</h3>
          </header>
          <div className="card-body">
            <p>Upload new election datasets, update timelines, or modify quiz banks.</p>
          </div>
          <div className="upload-dropzone glass-card">
            <span>Drop CSV or JSON here</span>
          </div>
          <button className="admin-btn">Publish Updates</button>
        </div>

        <div className="admin-card glass-card">
          <header>
            <BarChart />
            <h3>System Health</h3>
          </header>
          <div className="card-body">
            <div className="health-item">
              <div className="indicator online"></div>
              <span>Gemini Pro API</span>
            </div>
            <div className="health-item">
              <div className="indicator online"></div>
              <span>Firebase Auth</span>
            </div>
            <div className="health-item">
              <div className="indicator warning"></div>
              <span>Maps API Usage (85%)</span>
            </div>
          </div>
          <button className="admin-btn">API Settings</button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-view {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .auth-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .admin-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .admin-card header {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--primary);
        }

        .admin-card h3 {
          color: white;
          font-size: 1.25rem;
        }

        .admin-stat {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .admin-stat .label { color: var(--text-dim); }
        .admin-stat .value { font-weight: 700; font-size: 1.25rem; }

        .upload-dropzone {
          padding: 3rem;
          border-style: dashed;
          text-align: center;
          color: var(--text-dim);
          background: rgba(255,255,255,0.01);
        }

        .health-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .online { background: #10b981; box-shadow: 0 0 8px #10b981; }
        .warning { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }

        .admin-btn {
          margin-top: auto;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.75rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .admin-btn:hover {
          background: var(--primary);
          border-color: var(--primary);
        }
      ` }} />
    </div>
  );
};

export default Admin;
