import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { supabase } from './config/supabase';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './components/HomePage';
import Login from './components/login';
import Dashboard from './components/dashboard';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'dashboard'

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

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-3 text-primary">LUCT Digital Campus</h4>
          <p className="text-muted">Loading your experience...</p>
        </div>
      </Container>
    );
  }

  // Render based on current view
  if (currentView === 'home') {
    return <HomePage onShowLogin={handleShowLogin} />;
  }

  if (currentView === 'login') {
    return <Login onLogin={handleLogin} onBack={handleBackToHome} />;
  }

  // Dashboard view (user is logged in)
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
        Welcome, <strong>{user.name}</strong>
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