import React, { Suspense, lazy, useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Home, LayoutDashboard, History, MessageSquare, Settings, User, ShieldCheck, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';

const HomeView = lazy(() => import('./pages/HomeView.tsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const Timeline = lazy(() => import('./pages/Timeline.tsx'));
const Assistant = lazy(() => import('./pages/Assistant.tsx'));
const Admin = lazy(() => import('./pages/Admin.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-center error-screen">
          <h2>Oops! Something went wrong.</h2>
          <button className="btn-primary mt-4" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; user: any }> = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/assistant', { state: { prompt: searchTerm } });
      setSearchTerm('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
          <Link to="/" className="nav-link" aria-label="Go to Home">
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/dashboard" className="nav-link" aria-label="Go to Dashboard">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/timeline" className="nav-link" aria-label="Go to Process Guide">
            <History size={20} />
            <span>Process Guide</span>
          </Link>
          <Link to="/assistant" className="nav-link" aria-label="Go to AI Assistant">
            <MessageSquare size={20} />
            <span>AI Assistant</span>
          </Link>
        </div>

        <div className="sidebar-footer">
          <Link to="/admin" className="nav-link" aria-label="Go to Admin Panel">
            <Settings size={20} />
            <span>Admin Panel</span>
          </Link>
          <div className="user-profile" role="complementary" aria-label="User profile summary">
            <div className="avatar glass-card">
              <User size={24} />
            </div>
            <div className="user-info">
              <span className="user-name">{user ? (user.user_metadata?.full_name || user.email) : 'Guest User'}</span>
              <span className="user-level">{user ? 'Verified Voter' : 'Beginner'}</span>
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
            {user ? (
              <button className="btn-outline flex-center gap-2" onClick={handleLogout}>
                <LogOut size={18} /> Sign Out
              </button>
            ) : (
              <Link to="/login">
                <button className="btn-primary">Become a Smart Voter</button>
              </Link>
            )}
          </div>
        </header>

        <div className="content-viewport animate-fade-in">
          <ErrorBoundary>
            <Suspense fallback={<div className="flex-center loading-screen">Loading...</div>}>
              <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
                <Route path="/timeline" element={<ProtectedRoute user={user}><Timeline /></ProtectedRoute>} />
                <Route path="/assistant" element={<ProtectedRoute user={user}><Assistant /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute user={user}><Admin /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
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
        <Link to={user ? "/dashboard" : "/login"} className="nav-link">
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

