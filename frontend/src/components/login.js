import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import './Login.css';

function Login({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Create user profile
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              { 
                email, 
                name, 
                role
              }
            ]);

          if (profileError) throw profileError;
        }

        alert('Registration successful! You can now login.');
        setIsSignUp(false);
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (profileError) throw profileError;

        onLogin(userProfile);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
  {onBack && (
    <button
      type="button"
      className="back-button"
      onClick={onBack}
    >
      ← Back
    </button>
    )}
          <h1 className="logo">LUCT</h1>
          <h2>{isSignUp ? 'Create your account' : 'Sign in to your account'}</h2>
          <p className="subtitle">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              type="button"
              className="link-button" 
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {error && <div className="error-alert">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Role</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="prl">Principal Lecturer</option>
                    <option value="pl">Program Leader</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email address</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isSignUp && (
            <div className="form-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="link-button">
                Forgot your password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {!isSignUp && (
          <div className="demo-section">
            <div className="divider">
              <span>Demo Accounts</span>
            </div>
            <div className="demo-accounts">
              <div className="demo-item">
                <strong>Lecturer:</strong> lecturer@luct.com
              </div>
              <div className="demo-item">
                <strong>Student:</strong> student@luct.com
              </div>
              <div className="demo-item">
                <strong>Admin:</strong> admin@luct.com
              </div>
              <p className="demo-note">Use any password for demo accounts</p>
            </div>
          </div>
        )}

        {isSignUp && (
          <p className="terms">
            By signing up, you agree to our{' '}
            <button type="button" className="link-button">Terms of Service</button>
            {' '}and{' '}
            <button type="button" className="link-button">Privacy Policy</button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;