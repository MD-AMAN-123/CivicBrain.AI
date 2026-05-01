import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import './App.css';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Home, LayoutDashboard, History, MessageSquare, Settings, User, ShieldCheck, LogOut, Search, Play, Sun, Moon } from 'lucide-react';
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
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Theme State
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light';
  });

  const navigationItems = [
    { name: 'Home', path: '/', keywords: ['home', 'start', 'index'], icon: Home },
    { name: 'Dashboard', path: '/dashboard', keywords: ['dashboard', 'stats', 'profile'], icon: LayoutDashboard },
    { name: 'Process Guide', path: '/timeline', keywords: ['process', 'guide', 'timeline', 'steps'], icon: History },
    { name: 'AI Assistant', path: '/assistant', keywords: ['assistant', 'ai', 'chat', 'help', 'aura'], icon: MessageSquare },
    { name: 'Watch Demo', path: '/', keywords: ['demo', 'video', 'watch'], icon: Play },
  ];

  const filteredItems = searchTerm.trim() ? navigationItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.keywords.some(kw => kw.includes(searchTerm.toLowerCase()))
  ) : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Theme effect
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => setIsLightMode(!isLightMode);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (filteredItems.length > 0) {
        navigate(filteredItems[0].path);
        setSearchTerm('');
        setShowResults(false);
      } else if (searchTerm.trim()) {
        navigate('/assistant', { state: { prompt: searchTerm } });
        setSearchTerm('');
        setShowResults(false);
      }
    }
  };

  const handleItemClick = (path: string) => {
    navigate(path);
    setSearchTerm('');
    setShowResults(false);
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
          <div className="search-container" ref={searchRef}>
            <div className={`search-bar glass-card ${showResults ? 'active' : ''}`}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Explore election topics..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onKeyDown={handleSearch}
              />
            </div>
            {showResults && filteredItems.length > 0 && (
              <div className="search-dropdown glass-card animate-fade-in">
                <div className="search-section-label">Quick Navigation</div>
                {filteredItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="search-result-item"
                    onClick={() => handleItemClick(item.path)}
                  >
                    <item.icon size={18} className="item-icon" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button 
              className="btn-icon theme-toggle glass-card flex-center" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', cursor: 'pointer', padding: 0 }}
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
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

