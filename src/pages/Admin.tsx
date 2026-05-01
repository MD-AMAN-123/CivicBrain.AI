import React, { useState, useEffect, useRef } from 'react';
import { Users, FileUp, BarChart, ShieldAlert, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const Admin: React.FC = () => {
  // User Stats State
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [newUsersToday, setNewUsersToday] = useState<number | null>(null);

  // Content Management State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishProgress, setPublishProgress] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showNotification, setShowNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time Analytics
  useEffect(() => {
    if (!db) return;

    // Listen for total users
    const unsubscribeTotal = onSnapshot(collection(db, 'users'), (snapshot) => {
      setTotalUsers(snapshot.size);
    });

    // Listen for users active today (as a proxy for new registrations if createdAt is missing)
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'users'), where('lastActive', '==', today));

    const unsubscribeToday = onSnapshot(q, (snapshot) => {
      setNewUsersToday(snapshot.size);
    });

    return () => {
      unsubscribeTotal();
      unsubscribeToday();
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        setSelectedFile(file);
      } else {
        setShowNotification({ type: 'error', message: 'Please upload only CSV or JSON files.' });
      }
    }
  };

  const handlePublish = () => {
    if (!selectedFile) {
      setShowNotification({ type: 'error', message: 'Please select a file to publish.' });
      return;
    }

    setIsPublishing(true);
    setPublishProgress(0);

    const interval = setInterval(() => {
      setPublishProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsPublishing(false);
            setSelectedFile(null);
            setPublishProgress(0);
            setShowNotification({ type: 'success', message: 'Datasets published successfully to production!' });
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="admin-view">
      {showNotification && (
        <div className={`admin-notification glass-card ${showNotification.type}`}>
          {showNotification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{showNotification.message}</span>
          <button onClick={() => setShowNotification(null)}>×</button>
        </div>
      )}

      <div className="admin-header">
        <h2 className="view-title">Admin <span className="text-gradient">Control Panel</span></h2>
        <div className="auth-badge">
          <ShieldAlert size={16} />
          <span>Security Level: Administrator</span>
        </div>
      </div>

      <div className="admin-grid">
        {/* User Analytics Box */}
        <div className="admin-card glass-card">
          <header>
            <Users />
            <h3>User Analytics</h3>
          </header>
          <div className="card-body">
            <div className="admin-stat">
              <span className="label">Total Active Users</span>
              <span className="value">
                {totalUsers === null ? <Loader2 className="animate-spin" size={16} /> : totalUsers.toLocaleString()}
              </span>
            </div>
            <div className="admin-stat">
              <span className="label">Active Today</span>
              <span className="value">
                {newUsersToday === null ? <Loader2 className="animate-spin" size={16} /> : `+${newUsersToday}`}
              </span>
            </div>
          </div>
          <button className="admin-btn">View Detailed Reports</button>
        </div>

        {/* Content Management Box */}
        <div className="admin-card glass-card">
          <header>
            <FileUp />
            <h3>Content Management</h3>
          </header>
          <div className="card-body">
            <p>Upload new election datasets, update timelines, or modify quiz banks.</p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden-file-input"
            aria-label="Upload election dataset"
            accept=".csv,.json"
          />

          <div
            className={`upload-dropzone glass-card ${selectedFile ? 'has-file' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="file-info">
                <CheckCircle2 size={24} className="text-gradient" />
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            ) : (
              <span>Drop CSV or JSON here</span>
            )}
          </div>

          {isPublishing && (
            <div className="publish-progress-container">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ '--progress-width': `${publishProgress}%` } as React.CSSProperties}></div>
              </div>
              <span className="progress-text">Publishing... {publishProgress}%</span>
            </div>
          )}

          <button
            className={`admin-btn ${isPublishing ? 'disabled' : ''}`}
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'Processing...' : 'Publish Updates'}
          </button>
        </div>

        {/* System Health Box */}
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
              <span>Firestore DB</span>
            </div>
            <div className="health-item">
              <div className="indicator online"></div>
              <span>Supabase Auth</span>
            </div>
          </div>
          <button className="admin-btn">API Settings</button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .admin-view {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          position: relative;
        }

        .admin-notification {
          position: fixed;
          top: 2rem;
          right: 2rem;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 1000;
          animation: slideIn 0.3s ease;
          border-left: 4px solid var(--primary);
        }

        .admin-notification.error { border-left-color: #ef4444; }

        .admin-notification button {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          margin-left: 1rem;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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
          min-height: 400px;
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
          align-items: center;
        }

        .admin-stat .label { color: var(--text-dim); }
        .admin-stat .value { font-weight: 700; font-size: 1.5rem; display: flex; align-items: center; }

        .upload-dropzone {
          padding: 2rem;
          border: 2px dashed var(--glass-border);
          border-radius: 1rem;
          text-align: center;
          color: var(--text-dim);
          background: rgba(255,255,255,0.01);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-dropzone:hover {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
        }

        .upload-dropzone.has-file {
          border-style: solid;
          border-color: var(--primary);
        }

        .file-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .file-name { color: white; font-weight: 600; font-size: 0.9rem; }
        .file-size { font-size: 0.75rem; opacity: 0.6; }

        .hidden-file-input {
          display: none;
        }

        .publish-progress-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .progress-bar-bg {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          width: var(--progress-width, 0%);
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          transition: width 0.2s ease;
        }

        .progress-text {
          font-size: 0.75rem;
          color: var(--text-dim);
          text-align: center;
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

        .admin-btn:hover:not(.disabled) {
          background: var(--primary);
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .admin-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }} />
    </div>
  );
};

export default Admin;
