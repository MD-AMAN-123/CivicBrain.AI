import React, { Suspense, lazy } from 'react';
import { ArrowRight, Vote, Globe, Award, Zap } from 'lucide-react';
const ThreeScene = lazy(() => import('../components/ThreeScene'));

const HomeView: React.FC = () => {
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
        <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Master the election process with CivicBrain.AI. Your intelligent guide to 
          becoming an informed, active, and powerful citizen.
        </p>
        <div className="hero-actions animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <button className="btn-primary flex-center gap-2">
            Start Your Journey <ArrowRight size={20} />
          </button>
          <button className="btn-outline">Watch Demo</button>
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

      <style dangerouslySetInnerHTML={{ __html: `
        .home-view {
          padding-top: 4rem;
          display: flex;
          flex-direction: column;
          gap: 6rem;
        }

        .hero {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .hero-title {
          font-size: 5rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -2px;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-dim);
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--glass-border);
          padding: 0.8rem 1.5rem;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: white;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .bg-blue { background: #3b82f6; }
        .bg-purple { background: #a855f7; }
        .bg-amber { background: #f59e0b; }
        .bg-green { background: #10b981; }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .feature-card p {
          color: var(--text-dim);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 3rem;
          }
          
          .hero-actions {
            flex-direction: column;
            width: 100%;
          }

          .hero-actions button {
            width: 100%;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }
          
          .home-view {
            padding-top: 2rem;
            gap: 4rem;
          }
        }
      ` }} />
    </div>
  );
};

export default HomeView;
