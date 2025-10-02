import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, Award, Building, Phone, Mail, MapPin, TrendingUp, Target, Lightbulb, ChevronRight, Bell, Star } from 'lucide-react';
import './Home.css';
import Footer from './Footer.js';

function HomePage({ onShowLogin }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [quickStats, setQuickStats] = useState({ totalStudents: 0, totalLecturers: 0, activeReports: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    loadSampleData();
    fetchQuickStats();

    return () => clearInterval(timer);
  }, []);

  const loadSampleData = () => {
    const sampleEvents = [
      {
        id: 1,
        title: "Tech Innovation Week",
        date: "2024-10-15",
        time: "09:00",
        venue: "Main Campus Hall",
        type: "event"
      },
      {
        id: 2,
        title: "Web Development Workshop",
        date: "2024-10-18",
        time: "14:00",
        venue: "Computer Lab B",
        type: "workshop"
      },
      {
        id: 3,
        title: "Mid-Term Examinations",
        date: "2024-10-25",
        time: "08:00",
        venue: "All Classrooms",
        type: "academic"
      },
      {
        id: 4,
        title: "Career Fair 2024",
        date: "2024-11-05",
        time: "10:00",
        venue: "Sports Complex",
        type: "career"
      }
    ];

    const sampleNews = [
      {
        id: 1,
        title: "LUCT Ranked Top ICT Institution",
        excerpt: "Limkokwing University recognized as leading ICT education provider in the region...",
        date: "2024-09-20",
        category: "achievement"
      },
      {
        id: 2,
        title: "New Computer Labs Opening",
        excerpt: "State-of-the-art computer laboratories equipped with latest technology now available...",
        date: "2024-09-18",
        category: "facilities"
      },
      {
        id: 3,
        title: "Student Hackathon Winners",
        excerpt: "Our students win first place in national coding competition...",
        date: "2024-09-15",
        category: "achievement"
      },
      {
        id: 4,
        title: "Industry Partnership Program",
        excerpt: "New partnerships with leading tech companies for student internships...",
        date: "2024-09-12",
        category: "partnership"
      }
    ];

    setEvents(sampleEvents);
    setNews(sampleNews);
  };

  const fetchQuickStats = async () => {
    try {
      setQuickStats({
        totalStudents: 1250,
        totalLecturers: 85,
        activeReports: 47
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getEventBadgeClass = (type) => {
    const classes = {
      event: 'badge badge-sm badge-purple',
      workshop: 'badge badge-sm badge-green',
      academic: 'badge badge-sm badge-yellow',
      career: 'badge badge-sm badge-blue'
    };
    return classes[type] || 'badge badge-sm';
  };

  const getNewsBadgeClass = (category) => {
    const classes = {
      achievement: 'badge badge-green',
      facilities: 'badge badge-blue',
      partnership: 'badge badge-purple'
    };
    return classes[category] || 'badge';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="homepage-container">
      {/* Animated Background Orbs */}
      <div className="bg-orb-1" />
      <div className="bg-orb-2" />

      {/* Navigation Bar */}
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-inner">
            <div className="nav-brand">
             
              <div>
                <div className="nav-title">Limkokwing University</div>
                <div className="nav-subtitle">of Creative Technology</div>
              </div>
            </div>
            <div className="nav-links">
              <a href="#about" className="nav-link">About</a>
              <a href="#academics" className="nav-link">Academics</a>
              <a href="#contact" className="nav-link">Contact</a>
              <button onClick={onShowLogin} className="btn-primary">
                Staff/Student Portal
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            <div>
              <h1 className="hero-title">
                Welcome to LUCT<br />
                <span className="hero-title-highlight">Digital Campus</span>
              </h1>
              <p className="hero-description">
                Empowering future innovators through creative technology education. 
                Access your academic resources, stay updated with campus life, and 
                connect with the LUCT community.
              </p>
              <div className="hero-buttons">
                <button onClick={onShowLogin} className="btn-hero">
                  <BookOpen size={20} />
                  Enter Learning Portal
                </button>
                <button className="btn-secondary">
                  <Award size={20} />
                  Explore Programs
                </button>
              </div>
            </div>
            <div>
              <div className="card card-centered">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <Clock size={32} style={{ color: '#8b5cf6' }} />
                </div>
                <h5 className="card-title-sm" style={{ marginBottom: '16px' }}>Campus Time</h5>
                <div className="time-display">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="date-display">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <span className="status-badge">Campus Open</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <Users size={48} style={{ color: '#8b5cf6', marginBottom: '16px' }} />
            <h3 className="stat-number" style={{ color: '#8b5cf6' }}>
              {quickStats.totalStudents.toLocaleString()}+
            </h3>
            <p className="stat-label">Active Students</p>
          </div>
          <div className="stat-card">
            <Award size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
            <h3 className="stat-number" style={{ color: '#10b981' }}>
              {quickStats.totalLecturers}
            </h3>
            <p className="stat-label">Expert Lecturers</p>
          </div>
          <div className="stat-card">
            <TrendingUp size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
            <h3 className="stat-number" style={{ color: '#f59e0b' }}>
              {quickStats.activeReports}
            </h3>
            <p className="stat-label">Active Reports</p>
          </div>
        </div>
      </div>

      {/* Campus News & Events */}
      <div className="content-section">
        <div className="content-grid">
          {/* Campus News */}
          <div className="content-wide">
            <div className="card">
              <div className="card-header">
                <Bell size={24} style={{ color: '#8b5cf6' }} />
                <h4 className="card-title">Campus News & Announcements</h4>
              </div>
              <div className="card-body">
                {news.map((item, idx) => (
                  <div key={item.id} className="news-item">
                    <div className="news-header">
                      <h6 className="news-title">{item.title}</h6>
                      <span className={getNewsBadgeClass(item.category)}>
                        {item.category}
                      </span>
                    </div>
                    <p className="news-excerpt">{item.excerpt}</p>
                    <div className="news-footer">
                      <small className="news-date">
                        <Calendar size={14} />
                        {formatDate(item.date)}
                      </small>
                      <button className="btn-read-more">
                        Read More <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events & Quick Links */}
          <div className="flex-column gap-24">
            <div className="card">
              <div className="card-header-sm">
                <Calendar size={20} style={{ color: '#8b5cf6' }} />
                <h5 className="card-title-sm">Upcoming Events</h5>
              </div>
              <div className="card-body-sm">
                {events.map((event, idx) => (
                  <div key={event.id} className="event-item">
                    <div className="event-header">
                      <h6 className="event-title">{event.title}</h6>
                      <span className={getEventBadgeClass(event.type)}>
                        {event.type}
                      </span>
                    </div>
                    <div className="event-details">
                      <div className="event-detail">
                        <Calendar size={12} /> {formatDate(event.date)}
                      </div>
                      <div className="event-detail">
                        <Clock size={12} /> {event.time}
                      </div>
                      <div className="event-detail">
                        <MapPin size={12} /> {event.venue}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center mb-16">
                  <button className="btn-read-more w-full">
                    View Full Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card">
              <div className="card-header-sm">
                <Star size={20} style={{ color: '#8b5cf6' }} />
                <h5 className="card-title-sm">Quick Links</h5>
              </div>
              <div className="card-body-sm">
                <div className="quick-links">
                  {[
                    { icon: BookOpen, label: 'Academic Calendar' },
                    { icon: Building, label: 'Campus Facilities' },
                    { icon: Phone, label: 'Student Support' },
                    { icon: Target, label: 'Career Services' },
                    { icon: BookOpen, label: 'Online Library' }
                  ].map((link, idx) => (
                    <button key={idx} className="quick-link-btn">
                      <link.icon size={18} style={{ color: '#8b5cf6' }} />
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Calendar Section */}
      <div className="content-section">
        <div className="hero-container">
          <div className="card">
            <div className="card-header">
              <Calendar size={24} style={{ color: '#8b5cf6' }} />
              <h4 className="card-title">Academic Calendar - Semester 1, 2024</h4>
            </div>
            <div style={{ padding: '32px' }}>
              <div className="calendar-grid">
                <div>
                  <h6 className="calendar-section-title">Key Dates:</h6>
                  <ul className="calendar-list">
                    {[
                      { date: 'Aug 26', event: 'Semester Begins' },
                      { date: 'Sep 30 - Oct 4', event: 'Mid-Term Break' },
                      { date: 'Oct 14-18', event: 'Mid-Term Examinations' },
                      { date: 'Nov 25-29', event: 'Final Examinations' },
                      { date: 'Dec 6', event: 'Semester Ends' }
                    ].map((item, idx) => (
                      <li key={idx} className="calendar-item">
                        <strong className="calendar-date">{item.date}:</strong> {item.event}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="calendar-section-title">Important Deadlines:</h6>
                  <ul className="calendar-list">
                    {[
                      { date: 'Sep 15', event: 'Course Add/Drop Deadline' },
                      { date: 'Oct 1', event: 'Assignment 1 Due' },
                      { date: 'Nov 1', event: 'Assignment 2 Due' },
                      { date: 'Nov 15', event: 'Project Submissions' }
                    ].map((item, idx) => (
                      <li key={idx} className="calendar-item">
                        <strong className="calendar-date">{item.date}:</strong> {item.event}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Spotlight */}
      <div className="content-section">
        <div className="spotlight-grid">
          {[
            { 
              icon: Award, 
              title: 'Student Achievements', 
              desc: 'Celebrating outstanding student projects and competition wins in technology and innovation.', 
              color: '#3b82f6' 
            },
            { 
              icon: Target, 
              title: 'Industry Partners', 
              desc: 'Collaborating with leading tech companies for internships, research, and career opportunities.', 
              color: '#10b981' 
            },
            { 
              icon: Lightbulb, 
              title: 'Research & Innovation', 
              desc: 'Cutting-edge research projects and innovation labs driving technological advancement.', 
              color: '#f59e0b' 
            }
          ].map((item, idx) => (
            <div key={idx} className="spotlight-card">
              <item.icon size={48} style={{ color: item.color, marginBottom: '16px' }} />
              <h5 className="spotlight-title">{item.title}</h5>
              <p className="spotlight-description">{item.desc}</p>
              <button 
                className="btn-secondary" 
                style={{ 
                  border: `1px solid ${item.color}`, 
                  color: item.color,
                  padding: '10px 20px',
                  fontSize: '14px'
                }}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-container">
          <div className="cta-card">
            <h3 className="cta-title">Ready to Access Your Academic Portal?</h3>
            <p className="cta-description">
              Students and staff can login to access the reporting system, course materials, and academic resources.
            </p>
            <button onClick={onShowLogin} className="btn-cta">
              <ChevronRight size={24} />
              Enter LUCT Reporting System
            </button>
          </div>
        </div>
      </div>
      
      <Footer/>
    </div>
  );
}

export default HomePage;