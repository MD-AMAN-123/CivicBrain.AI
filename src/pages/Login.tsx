import React, { useState } from 'react';
import { Mail, Lock, LogIn, Sparkles, UserPlus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login success
    if (email && password) {
      console.log('Authenticating...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    }
  };

  return (
    <div className="login-view flex-center animate-fade-in">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <Sparkles className="text-gradient" size={32} />
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Join CivicBrain'}</h2>
          <p>{isLogin ? 'Log in to continue your civic journey.' : 'Create an account to track your progress.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper glass-card">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  required 
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper glass-card">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper glass-card">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>Confirm Password</label>
              <div className="input-wrapper glass-card">
                <Lock size={18} className="input-icon" />
                <input type="password" placeholder="••••••••" required />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary w-full flex-center gap-2" style={{ marginTop: '1rem' }}>
            {isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" className="text-btn toggle-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .login-view {
          min-height: calc(100vh - 8rem);
        }

        .login-card {
          width: 100%;
          max-width: 480px;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: relative;
          z-index: 10;
        }

        .login-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .login-icon-wrapper {
          width: 64px;
          height: 64px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
          border: 1px solid var(--glass-border);
        }

        .login-header h2 {
          font-size: 2rem;
          font-weight: 700;
        }

        .login-header p {
          color: var(--text-dim);
          font-size: 0.95rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-dim);
          margin-left: 0.25rem;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          padding: 0 1rem;
          background: rgba(0, 0, 0, 0.2);
          transition: border-color 0.3s ease;
        }

        .input-wrapper:focus-within {
          border-color: var(--primary);
        }

        .input-icon {
          color: var(--text-dim);
          margin-right: 0.75rem;
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 1rem 0;
          outline: none;
          font-size: 1rem;
        }

        .w-full {
          width: 100%;
          padding: 1rem;
        }

        .login-footer {
          text-align: center;
          border-top: 1px solid var(--glass-border);
          padding-top: 1.5rem;
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        .text-btn {
          background: transparent;
          border: none;
          font-weight: 600;
          cursor: pointer;
          margin-left: 0.5rem;
        .toggle-btn {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: var(--primary);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .toggle-btn:hover {
          text-decoration: underline;
          -webkit-text-fill-color: var(--text-main);
          background: none;
          color: var(--text-main);
        }

        @media (max-width: 640px) {
          .login-card {
            padding: 2rem 1.5rem;
            max-width: 100%;
          }
          
          .login-header h2 {
            font-size: 1.5rem;
          }
        }
      ` }} />
    </div>
  );
};

export default Login;
