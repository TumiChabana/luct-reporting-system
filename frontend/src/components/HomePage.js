import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, Award, Building, Phone, Mail, MapPin, TrendingUp, Target, Lightbulb, ChevronRight, Bell, Star } from 'lucide-react';
import './Home.css';
import Footer from './Footer.js';

// ===== MAIN HOMEPAGE COMPONENT =====
function HomePage({ onShowLogin }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [campusEvents, setCampusEvents] = useState([]);
  const [campusNews, setCampusNews] = useState([]);
  const [campusStats, setCampusStats] = useState({ 
    totalStudents: 0, 
    totalLecturers: 0, 
    activeReports: 0 
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    loadSampleData();
    fetchQuickStats();

    return () => clearInterval(timer);
  }, []);

  // ===== DATA LOADING FUNCTIONS =====
  const loadSampleData = () => {
    const sampleEvents = [
      {
         id: 1,
        title: "Open Day 2025",
        date: "2025-11-15",
        time: "09:00",
        venue: "Main Campus, Maseru",
        type: "event",
        description: "Prospective students and parents invited to explore our creative technology programs and campus facilities."
      },
      {
        id: 2,
        title: "ICT Career Fair",
        date: "2025-11-22",
        time: "10:00",
        venue: "Student Center",
        type: "career",
        description: "Meet leading tech companies and explore internship opportunities in the ICT sector."
      },
      {
        id: 3,
        title: "Mid-Term Examinations",
        date: "2025-10-25",
        time: "08:00",
        venue: "All Classrooms",
        type: "academic"
      },
      {
        id: 4,
        title: "Career Fair 2025",
        date: "2025-11-05",
        time: "10:00",
        venue: "Sports Complex",
        type: "career"
      },
      {
        id: 5,
        title: "Creative Arts Exhibition",
        date: "2025-12-05",
        time: "14:00",
        venue: "Campus Gallery",
        type: "academic",
        description: "Showcasing student projects in graphic design, multimedia, and digital arts."
      },
      {
        id: 6,
        title: "Entrepreneurship Workshop",
        date: "2025-12-12",
        time: "13:00",
        venue: "Business Innovation Hub",
        type: "workshop",
        description: "Learn how to turn creative ideas into successful business ventures."
      }
    ];

    const sampleNews = [
      {
        id: 1,
        title: "LUCT Ranked Top ICT Institution",
        excerpt: "Limkokwing University recognized as leading ICT education provider in the region...",
        date: "2025-09-20",
        category: "achievement"
      },
      {
        id: 2,
        title: "New Computer Labs Opening",
        excerpt: "State-of-the-art computer laboratories equipped with latest technology now available...",
        date: "2025-09-18",
        category: "facilities"
      },
      {
        id: 3,
        title: "Student Hackathon Winners",
        excerpt: "Our students win first place in national coding competition...",
        date: "2025-09-15",
        category: "achievement"
      },
      {
        id: 4,
        title: "Industry Partnership Program",
        excerpt: "New partnerships with leading tech companies for student internships...",
        date: "2025-09-12",
        category: "partnership"
      },
      {
        id: 5,
        title: "New Digital Media Lab Opening",
        excerpt: "Limkokwing Lesotho launches state-of-the-art digital media laboratory equipped with latest technology for multimedia students...",
        date: "2025-10-20",
        category: "facilities",
        fullContent: "The new digital media lab features high-end computers, professional editing software, and virtual reality equipment to enhance student learning experience."
      },
      {
        id: 6,
        title: "Student Wins Regional Coding Competition",
        excerpt: "LUCT student awarded first place in the Southern Africa ICT Innovation Challenge for developing innovative mobile application...",
        date: "2025-10-15",
        category: "achievement",
        fullContent: "The winning mobile app helps local farmers track market prices and connect with potential buyers across the region."
      },
      {
        id: 7,
        title: "Partnership with Local Tech Companies",
        excerpt: "New industry partnerships established to provide students with internship opportunities and real-world project experience...",
        date: "2025-10-08",
        category: "partnership",
        fullContent: "Collaboration with leading Lesotho tech firms to bridge the gap between academia and industry requirements."
      },
       {
        id: 8,
        title: "Cultural Diversity Week Celebration",
        excerpt: "Annual cultural week featuring traditional performances, food festivals, and international student presentations...",
        date: "2025-10-01",
        category: "campus",
        fullContent: "A week-long celebration of the diverse cultures represented in our student community, promoting unity and cultural exchange."
      }
    ];

    setCampusEvents(sampleEvents);
    setCampusNews(sampleNews);
  };

  const fetchQuickStats = async () => {
    try {
      setCampusStats({
        totalStudents: 1250,
        totalLecturers: 85,
        activeReports: 47
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="homepage-container">
      {/* Animated Background Orbs */}
      <div className="bg-orb-1" />
      <div className="bg-orb-2" />

      {/* Navigation Bar */}
      <NavigationBar onShowLogin={onShowLogin} />
      
      {/* Hero Section */}
      <HeroSection currentTime={currentTime} onShowLogin={onShowLogin} />
      
      {/* Quick Stats */}
      <StatsSection campusStats={campusStats} />
      
      {/* Campus News & Events */}
      <NewsAndEventsSection 
        campusNews={campusNews} 
        campusEvents={campusEvents} 
      />
      
      {/* Academic Calendar */}
      <AcademicCalendarSection />
      
      {/* Campus Spotlight */}
      <CampusSpotlightSection />
      
      {/* Call to Action */}
      <CallToActionSection onShowLogin={onShowLogin} />
      
      <Footer />
    </div>
  );
}

// ===== NAVIGATION BAR COMPONENT =====
const NavigationBar = ({ onShowLogin }) => (
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
);

// ===== HERO SECTION COMPONENT =====
const HeroSection = ({ currentTime, onShowLogin }) => (
  <div className="hero-section">
    <div className="hero-container">
      <div className="hero-grid">
        <HeroContent onShowLogin={onShowLogin} />
        <TimeDisplayCard currentTime={currentTime} />
      </div>
    </div>
  </div>
);

// ===== HERO CONTENT COMPONENT =====
const HeroContent = ({ onShowLogin }) => (
  <div>
    <h1 className="hero-title">
      Welcome to LUCT<br />
      <span className="hero-title-highlight">Digital Campus</span>
    </h1>
    <p className="hero-description">
      Empowering future innovators through creative technology education. 
      Access your academic resources, stay updated with campus life, and 
      connect with the LUCT Lesotho community.
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
);

// ===== TIME DISPLAY CARD COMPONENT =====
const TimeDisplayCard = ({ currentTime }) => (
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
);

// ===== STATS SECTION COMPONENT =====
const StatsSection = ({ campusStats }) => (
  <div className="stats-section">
    <div className="stats-grid">
      <StatCard 
        icon={Users} 
        number={`${campusStats.totalStudents.toLocaleString()}+`} 
        label="Active Students" 
        color="#8b5cf6" 
      />
      <StatCard 
        icon={Award} 
        number={campusStats.totalLecturers} 
        label="Expert Lecturers" 
        color="#10b981" 
      />
      <StatCard 
        icon={TrendingUp} 
        number={campusStats.activeReports} 
        label="Active Reports" 
        color="#f59e0b" 
      />
    </div>
  </div>
);

// ===== INDIVIDUAL STAT CARD COMPONENT =====
const StatCard = ({ icon: Icon, number, label, color }) => (
  <div className="stat-card">
    <Icon size={48} style={{ color, marginBottom: '16px' }} />
    <h3 className="stat-number" style={{ color }}>
      {number}
    </h3>
    <p className="stat-label">{label}</p>
  </div>
);

// ===== NEWS AND EVENTS SECTION COMPONENT =====
const NewsAndEventsSection = ({ campusNews, campusEvents }) => (
  <div className="content-section">
    <div className="content-grid">
      <NewsSection campusNews={campusNews} />
      <EventsAndQuickLinksSection campusEvents={campusEvents} />
    </div>
  </div>
);

// ===== NEWS SECTION COMPONENT =====
const NewsSection = ({ campusNews }) => (
  <div className="content-wide">
    <div className="card">
      <div className="card-header">
        <Bell size={24} style={{ color: '#8b5cf6' }} />
        <h4 className="card-title">Campus News & Announcements</h4>
      </div>
      <div className="card-body">
        {campusNews.map((newsItem) => (
          <NewsItem key={newsItem.id} newsItem={newsItem} />
        ))}
      </div>
    </div>
  </div>
);

// ===== INDIVIDUAL NEWS ITEM COMPONENT =====
const NewsItem = ({ newsItem }) => {
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
    <div className="news-item">
      <div className="news-header">
        <h6 className="news-title">{newsItem.title}</h6>
        <span className={getNewsBadgeClass(newsItem.category)}>
          {newsItem.category}
        </span>
      </div>
      <p className="news-excerpt">{newsItem.excerpt}</p>
      <div className="news-footer">
        <small className="news-date">
          <Calendar size={14} />
          {formatDate(newsItem.date)}
        </small>
        <button className="btn-read-more">
          Read More <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

// ===== EVENTS AND QUICK LINKS SECTION COMPONENT =====
const EventsAndQuickLinksSection = ({ campusEvents }) => (
  <div className="flex-column gap-24">
    <EventsSection campusEvents={campusEvents} />
    <QuickLinksSection />
  </div>
);

// ===== EVENTS SECTION COMPONENT =====
const EventsSection = ({ campusEvents }) => {
  const getEventBadgeClass = (type) => {
    const classes = {
      event: 'badge badge-sm badge-purple',
      workshop: 'badge badge-sm badge-green',
      academic: 'badge badge-sm badge-yellow',
      career: 'badge badge-sm badge-blue'
    };
    return classes[type] || 'badge badge-sm';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card">
      <div className="card-header-sm">
        <Calendar size={20} style={{ color: '#8b5cf6' }} />
        <h5 className="card-title-sm">Upcoming Events</h5>
      </div>
      <div className="card-body-sm">
        {campusEvents.map((event) => (
          <EventItem key={event.id} event={event} 
            getEventBadgeClass={getEventBadgeClass} 
            formatDate={formatDate} 
          />
        ))}
        <div className="text-center mb-16">
          <button className="btn-read-more w-full">
            View Full Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== INDIVIDUAL EVENT ITEM COMPONENT =====
const EventItem = ({ event, getEventBadgeClass, formatDate }) => (
  <div className="event-item">
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
);

// ===== QUICK LINKS SECTION COMPONENT =====
const QuickLinksSection = () => {
  const quickLinks = [
    { icon: BookOpen, label: 'Academic Calendar' },
    { icon: Building, label: 'Campus Facilities' },
    { icon: Phone, label: 'Student Support' },
    { icon: Target, label: 'Career Services' },
    { icon: BookOpen, label: 'Online Library' }
  ];

  return (
    <div className="card">
      <div className="card-header-sm">
        <Star size={20} style={{ color: '#8b5cf6' }} />
        <h5 className="card-title-sm">Quick Links</h5>
      </div>
      <div className="card-body-sm">
        <div className="quick-links">
          {quickLinks.map((link, idx) => (
            <button key={idx} className="quick-link-btn">
              <link.icon size={18} style={{ color: '#8b5cf6' }} />
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== ACADEMIC CALENDAR SECTION COMPONENT =====
const AcademicCalendarSection = () => {
  const keyDates = [
    { date: 'Aug 26', event: 'Semester Begins' },
    { date: 'Sep 30 - Oct 4', event: 'Mid-Term Break' },
    { date: 'Oct 14-18', event: 'Mid-Term Examinations' },
    { date: 'Nov 25-29', event: 'Final Examinations' },
    { date: 'Dec 6', event: 'Semester Ends' }
  ];

  const importantDeadlines = [
    { date: 'Sep 15', event: 'Course Add/Drop Deadline' },
    { date: 'Oct 1', event: 'Assignment 1 Due' },
    { date: 'Nov 1', event: 'Assignment 2 Due' },
    { date: 'Nov 15', event: 'Project Submissions' }
  ];

  return (
    <div className="content-section">
      <div className="hero-container">
        <div className="card">
          <div className="card-header">
            <Calendar size={24} style={{ color: '#8b5cf6' }} />
            <h4 className="card-title">Academic Calendar - Semester 1, 2025</h4>
          </div>
          <div style={{ padding: '32px' }}>
            <div className="calendar-grid">
              <CalendarList title="Key Dates:" items={keyDates} />
              <CalendarList title="Important Deadlines:" items={importantDeadlines} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== CALENDAR LIST COMPONENT =====
const CalendarList = ({ title, items }) => (
  <div>
    <h6 className="calendar-section-title">{title}</h6>
    <ul className="calendar-list">
      {items.map((item, idx) => (
        <li key={idx} className="calendar-item">
          <strong className="calendar-date">{item.date}:</strong> {item.event}
        </li>
      ))}
    </ul>
  </div>
);

// ===== CAMPUS SPOTLIGHT SECTION COMPONENT =====
const CampusSpotlightSection = () => {
  const spotlightItems = [
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
  ];

  return (
    <div className="content-section">
      <div className="spotlight-grid">
        {spotlightItems.map((item, idx) => (
          <SpotlightCard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

// ===== INDIVIDUAL SPOTLIGHT CARD COMPONENT =====
const SpotlightCard = ({ item }) => (
  <div className="spotlight-card">
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
);

// ===== CALL TO ACTION SECTION COMPONENT =====
const CallToActionSection = ({ onShowLogin }) => (
  <div className="cta-section">
    <div className="cta-container">
      <div className="cta-card">
        <h3 className="cta-title">Ready to Access Your Academic Portal?</h3>
        <p className="cta-description">
          Students and staff can login to access the reporting system, course materials, and academic resources.
        </p>
        <button onClick={onShowLogin} className="btn-cta">
          Enter LUCT Reporting System
        </button>
      </div>
    </div>
  </div>
);

export default HomePage;