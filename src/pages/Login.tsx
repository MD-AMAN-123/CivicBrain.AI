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

          <button type="submit" className="btn-primary login-submit-btn flex-center gap-2">
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
    </div>
  );
};

export default Login;
