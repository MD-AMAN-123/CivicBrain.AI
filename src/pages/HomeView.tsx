import React, { Suspense, lazy, useState } from 'react';
import { ArrowRight, Vote, Globe, Award, Zap, Play, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const ThreeScene = lazy(() => import('../components/ThreeScene'));

const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  return (
    <div className="home-view">
      <Suspense fallback={null}>
        <ThreeScene />
      </Suspense>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title animate-fade-in">
          Democracy, <span className="text-gradient">Demystified.</span>
        </h1>
        <p className="hero-subtitle animate-fade-in delay-200">
          Master the election process with CivicBrain.AI. Your intelligent guide to 
          becoming an informed, active, and powerful citizen.
        </p>
        <div className="hero-actions animate-fade-in delay-400">
          <button className="btn-primary flex-center gap-2" onClick={() => navigate('/timeline')}>
            Start Your Journey <ArrowRight size={20} />
          </button>
          
          <div className="demo-actions-wrapper">
            {!showDemoOptions ? (
              <button 
                className="btn-outline"
                onClick={() => setShowDemoOptions(true)}
              >
                Watch Demo
              </button>
            ) : (
              <div className="demo-sub-buttons animate-fade-in">
                <a 
                  href="https://drive.google.com/file/d/1KKkAnWOfQCzxJUnGG6OVSPoZJ7T52Sua/view?usp=drivesdk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="sub-btn glass-card"
                >
                  <Play size={16} /> Demo by AI
                </a>
                <a 
                  href="https://drive.google.com/file/d/1aRSOxzjgZrUKrQANU-OqirLxsMgIQl9p/view?usp=drivesdk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="sub-btn glass-card"
                >
                  <BookOpen size={16} /> Step by step guide
                </a>
                <button 
                  className="close-demo-btn"
                  onClick={() => setShowDemoOptions(false)}
                  title="Close options"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="feature-grid">
        <div className="feature-card glass-card">
          <div className="icon-wrapper bg-blue">
            <Vote size={24} />
          </div>
          <h3>Process Guide</h3>
          <p>From registration to results, understand every step of the democratic machine.</p>
        </div>
        
        <div className="feature-card glass-card">
          <div className="icon-wrapper bg-purple">
            <Zap size={24} />
          </div>
          <h3>AI Explainer</h3>
          <p>Complex topics like EVMs and Electoral Bonds explained simply by Gemini AI.</p>
        </div>

        <div className="feature-card glass-card">
          <div className="icon-wrapper bg-amber">
            <Globe size={24} />
          </div>
          <h3>Local Info</h3>
          <p>Constituency-based details and local voting guidelines powered by Google Maps.</p>
        </div>

        <div className="feature-card glass-card">
          <div className="icon-wrapper bg-green">
            <Award size={24} />
          </div>
          <h3>Gamified Learning</h3>
          <p>Earn badges and climb the leaderboard as you master civic knowledge.</p>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
