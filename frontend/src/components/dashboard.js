import React from 'react';
import { Container, Card, Row, Col, Alert, Table, Badge } from 'react-bootstrap';
import { supabase } from '../config/supabase';

function Dashboard({ user }) {
  const getRoleDescription = () => {
    const descriptions = {
      student: 'View class reports and rate your classes',
      lecturer: 'Submit class reports and track your teaching',
      prl: 'Review lecturer reports and provide feedback',
      pl: 'Manage courses and view program reports',
      admin: 'Manage system users and overall monitoring'
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

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h3>Welcome to Your Dashboard</h3>
            </Card.Header>
            <Card.Body>
              <Alert variant={getWelcomeColor()}>
                <h5>🎉 Login Successful!</h5>
                <strong>Name:</strong> {user.name}<br />
                <strong>Role:</strong> <Badge bg={getWelcomeColor()}>{user.role.toUpperCase()}</Badge><br />
                <strong>Email:</strong> {user.email}<br />
                {user.stream !== 'N/A' && <><strong>Stream:</strong> {user.stream}<br /></>}
                {user.degree_type !== 'N/A' && <><strong>Program:</strong> {user.degree_type}<br /></>}
              </Alert>

              <Card className="mt-3">
                <Card.Body>
                  <h5>Your Role Capabilities</h5>
                  <p>{getRoleDescription()}</p>
                  
                  <Row className="mt-4">
                    <Col md={6}>
                      <Card className="bg-light">
                        <Card.Body>
                          <h6>Quick Actions:</h6>
                          <ul>
                            {user.role === 'student' && (
                              <>
                                <li>View Class Reports</li>
                                <li>Rate Classes</li>
                                <li>Track Attendance</li>
                              </>
                            )}
                            {user.role === 'lecturer' && (
                              <>
                                <li>Submit Reports</li>
                                <li>View Reporting History</li>
                                <li>Monitor Student Progress</li>
                              </>
                            )}
                            {user.role === 'admin' && (
                              <>
                                <li>User Management</li>
                                <li>System Reports</li>
                                <li>Analytics Dashboard</li>
                              </>
                            )}
                          </ul>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6}>
                      <Card>
                        <Card.Body>
                          <h6>System Status</h6>
                          <Table striped size="sm">
                            <tbody>
                              <tr>
                                <td>Database</td>
                                <td><Badge bg="success">Connected</Badge></td>
                              </tr>
                              <tr>
                                <td>Authentication</td>
                                <td><Badge bg="success">Active</Badge></td>
                              </tr>
                              <tr>
                                <td>User Role</td>
                                <td><Badge bg={getWelcomeColor()}>{user.role}</Badge></td>
                              </tr>
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;