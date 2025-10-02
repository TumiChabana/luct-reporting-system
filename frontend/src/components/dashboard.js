import UserManagement from './UserManagement';
import SystemStats from './SystemStats';
import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Alert, Badge, Nav, Button } from 'react-bootstrap';
import { supabase } from '../config/supabase';
import ReportForm from './ReportForm';
import ReportList from './ReportList';
import '../App.css';
import CourseAssignment from './CourseAssignment';


function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalReports: 0, pendingReview: 0 });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      let reportsQuery = supabase.from('reports').select('*', { count: 'exact' });
      
      if (user.role === 'lecturer') {
        reportsQuery = reportsQuery.eq('lecturer_id', user.id);
      }

      const { count: totalReports, error } = await reportsQuery;

      if (error) throw error;

      setStats({
        totalReports: totalReports || 0,
        pendingReview: 0 // You can add logic for pending reviews
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getRoleDescription = () => {
    const descriptions = {
      student: 'View class reports and track your learning progress',
      lecturer: 'Submit class reports and monitor student attendance',
      prl: 'Review lecturer reports and provide quality feedback',
      pl: 'Manage program courses and view academic analytics',
      admin: 'System administration and user management'
    };
    return descriptions[user.role] || 'Welcome to the system';
  };

  const getWelcomeColor = () => {
    const colors = {
      student: 'success',
      lecturer: 'primary', 
      prl: 'warning',
      pl: 'info',
      admin: 'danger'
    };
    return colors[user.role] || 'success';
  };

  const handleReportSubmitted = () => {
    fetchStats(); // Refresh stats when new report is submitted
    setActiveTab('my-reports');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'admin':
        return (
            <div>
            <SystemStats user={user} />
            <UserManagement user={user} />
            </div>
        );
      case 'overview':
        return (
          
          <div>
            <Row className="mb-4">
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h3>{stats.totalReports}</h3>
                    <p className="text-muted mb-0">
                      {user.role === 'lecturer' ? 'Reports Submitted' : 'Total Reports'}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h3>{stats.pendingReview}</h3>
                    <p className="text-muted mb-0">Pending Review</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h3>
                      {user.role === 'student' ? '()' : 
                       user.role === 'lecturer' ? '()' : 
                       user.role === 'admin' ? '' : ''}
                    </h3>
                    <p className="text-muted mb-0">{user.role.toUpperCase()}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card>
              <Card.Body>
                <h5>Quick Actions</h5>
                <Row>
                  {user.role === 'lecturer' && (
                    <Col md={6}>
                      <div className="d-grid gap-2">
                        <Button 
                          variant="primary" 
                          onClick={() => setActiveTab('submit-report')}
                        >
                          Submit New Report
                        </Button>
                        <Button 
                          variant="outline-primary" 
                          onClick={() => setActiveTab('my-reports')}
                        >
                          View My Reports
                        </Button>
                      </div>
                    </Col>
                  )}
                  {user.role === 'student' && (
                    <Col md={6}>
                      <div className="d-grid gap-2">
                        <Button 
                          variant="success" 
                          onClick={() => setActiveTab('view-reports')}
                        >
                          View Class Reports
                        </Button>
                      </div>
                    </Col>
                  )}
                  {user.role === 'prl' && (
                    <Col md={6}>
                      <div className="d-grid gap-2">
                        <Button 
                          variant="warning" 
                          onClick={() => setActiveTab('review-reports')}
                        >
                          Review Reports
                        </Button>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </div>
        );

      case 'course-assignment':
            return <CourseAssignment user={user} />;
      case 'submit-report':
        return <ReportForm user={user} onReportSubmitted={handleReportSubmitted} />;

      case 'my-reports':
      case 'view-reports':
      case 'review-reports':
        return <ReportList user={user} />;

      default:
        return <div>Select a tab to get started</div>;
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Row>
                <Col>
                  <h3>Welcome to Your Dashboard</h3>
                </Col>
                <Col xs="auto">
                  <Badge bg={getWelcomeColor()} className="fs-6">
                    {user.role.toUpperCase()}
                  </Badge>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Alert variant={getWelcomeColor()}>
                <h5>Hello, {user.name}!</h5>
                <p className="mb-0">{getRoleDescription()}</p>
              </Alert>

              {/* Navigation Tabs */}
              <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="overview">Overview</Nav.Link>
                </Nav.Item>
                
                {user.role === 'lecturer' && (
                  <>
                    <Nav.Item>
                      <Nav.Link eventKey="submit-report">Submit Report</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="my-reports">My Reports</Nav.Link>
                    </Nav.Item>
                  </>
                )}
                
                {user.role === 'student' && (
                  <Nav.Item>
                    <Nav.Link eventKey="view-reports">View Reports</Nav.Link>
                  </Nav.Item>
                )}
                
                {user.role === 'prl' && (
                  <Nav.Item>
                    <Nav.Link eventKey="review-reports">Review Reports</Nav.Link>
                  </Nav.Item>
                )}
                
                {user.role === 'admin' && (
                  
                  <Nav.Item>
                    <Nav.Link eventKey="admin">Admin Panel</Nav.Link>
                  </Nav.Item>
                )}

                {user.role === 'pl' && (
                    <Nav.Item>
                        <Nav.Link eventKey="course-assignment">Assign Courses</Nav.Link>
                    </Nav.Item>
                )}

              </Nav>

              {/* Tab Content */}
              {renderTabContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;