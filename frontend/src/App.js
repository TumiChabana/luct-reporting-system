import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { supabase } from './config/supabase';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './components/HomePage';
import Login from './components/login';
import Dashboard from './components/dashboard';
import Footer from './components/Footer';
import './App.css';

function App() {
  // ===== STATE MANAGEMENT =====
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'dashboard'

  // ===== AUTHENTICATION EFFECT =====
  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
      setCurrentView('dashboard');
      setLoading(false);
      return;
    }

    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ===== USER PROFILE FETCHING =====
  const fetchUserProfile = async (email) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;

      setUser(userProfile);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== AUTHENTICATION HANDLERS =====
  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
    setShowLogin(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('demo_user');
    setUser(null);
    setCurrentView('home');
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setCurrentView('login');
  };

  const handleBackToHome = () => {
    setShowLogin(false);
    setCurrentView('home');
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="luct-loading-container">
        <div className="text-center">
          <div className="luct-spinner"></div>
          <h4 className="luct-heading-md luct-mt-md text-primary">
            LUCT Digital Campus
          </h4>
          <p className="luct-text-muted luct-mt-sm">
            Loading your experience...
          </p>
        </div>
      </div>
    );
  }

  // ===== VIEW RENDERING LOGIC =====
  if (currentView === 'home') {
    return <HomePage onShowLogin={handleShowLogin} />;
  }

  if (currentView === 'login') {
    return <Login onLogin={handleLogin} onBack={handleBackToHome} />;
  }

  // ===== DASHBOARD VIEW (USER IS LOGGED IN) =====
  return (
    <div className="App">
      <Navbar className="navbar">
        <Container className="navbar-Brand">
          {/* Brand Logo + Title */}
          <Navbar.Brand className="luct-navbar-brand">
            <div>
              <div className="luct-navbar-title">LUCT Reporting System</div>
              <div className="luct-navbar-subtitle">Staff & Student Portal</div>
            </div>
          </Navbar.Brand>

          {/* Welcome text */}
          <Nav className="luct-navbar-menu me-auto">
            <span className="luct-navbar-welcome">
              Welcome, <strong>{user?.name || 'User'}</strong>
            </span>
          </Nav>

          {/* Buttons */}
          <Nav className="luct-navbar-menu">
            <button
              className="luct-navbar-btn"
              onClick={() => setCurrentView('home')}
            >
              Campus Home
            </button>
            <button
              className="luct-navbar-btn luct-navbar-btn-primary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </Nav>
        </Container>
      </Navbar>

      <Dashboard user={user} />
      <Footer />
    </div>
  );
}

export default App;
