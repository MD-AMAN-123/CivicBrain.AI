import React, { Suspense, lazy } from 'react';
import './App.css';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, History, MessageSquare, Settings, User, ShieldCheck } from 'lucide-react';
const HomeView = lazy(() => import('./pages/HomeView.tsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const Timeline = lazy(() => import('./pages/Timeline.tsx'));
const Assistant = lazy(() => import('./pages/Assistant.tsx'));
const Admin = lazy(() => import('./pages/Admin.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));

const App: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/assistant', { state: { prompt: searchTerm } });
      setSearchTerm('');
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Nav */}
      <nav className="sidebar glass-card">
        <div className="sidebar-brand">
          <ShieldCheck className="brand-icon" size={32} />
          <span className="brand-text text-gradient">CivicBrain.AI</span>
        </div>

        <div className="sidebar-links">
          <Link to="/" className="nav-link">
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/dashboard" className="nav-link">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/timeline" className="nav-link">
            <History size={20} />
            <span>Process Guide</span>
          </Link>
          <Link to="/assistant" className="nav-link">
            <MessageSquare size={20} />
            <span>AI Assistant</span>
          </Link>
        </div>

        <div className="sidebar-footer">
          <Link to="/admin" className="nav-link">
            <Settings size={20} />
            <span>Admin Panel</span>
          </Link>
          <div className="user-profile">
            <div className="avatar glass-card">
              <User size={24} />
            </div>
            <div className="user-info">
              <span className="user-name">Guest User</span>
              <span className="user-level">Beginner</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-bar glass-card">
            <input
              type="text"
              placeholder="Explore election topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          <div className="header-actions">
            <Link to="/login">
              <button className="btn-primary">Become a Smart Voter</button>
            </Link>
          </div>
        </header>

        <div className="content-viewport animate-fade-in">
          <Suspense fallback={<div className="flex-center loading-screen">Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="mobile-nav">
        <Link to="/" className="nav-link">
          <Home size={24} />
        </Link>
        <Link to="/dashboard" className="nav-link">
          <LayoutDashboard size={24} />
        </Link>
        <Link to="/timeline" className="nav-link">
          <History size={24} />
        </Link>
        <Link to="/assistant" className="nav-link">
          <MessageSquare size={24} />
        </Link>
        <Link to="/login" className="nav-link">
          <User size={24} />
        </Link>
      </div>

      {/* Background Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>

  );
};

export default App;
