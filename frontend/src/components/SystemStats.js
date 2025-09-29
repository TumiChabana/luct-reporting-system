import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Table, Badge } from 'react-bootstrap';
import { supabase } from '../config/supabase';

function SystemStats({ user }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    reportsByStatus: {},
    reportsByCourse: {},
    recentActivity: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Total reports
      const { count: totalReports, error: reportsError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });

      // Reports by status
      const { data: statusData, error: statusError } = await supabase
        .from('reports')
        .select('status');

      // Reports by course
      const { data: courseData, error: courseError } = await supabase
        .from('reports')
        .select('course_code, course_name');

      // Recent activity
      const { data: recentData, error: recentError } = await supabase
        .from('reports')
        .select(`
          *,
          lecturer:users!reports_lecturer_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (usersError || reportsError || statusError || courseError || recentError) {
        throw new Error('Error fetching statistics');
      }

      // Process data
      const reportsByStatus = statusData?.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {});

      const reportsByCourse = courseData?.reduce((acc, report) => {
        const key = `${report.course_code} - ${report.course_name}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalUsers: totalUsers || 0,
        totalReports: totalReports || 0,
        reportsByStatus: reportsByStatus || {},
        reportsByCourse: reportsByCourse || {},
        recentActivity: recentData || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      submitted: 'warning',
      under_review: 'info',
      reviewed: 'success'
    };
    return variants[status] || 'secondary';
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-primary">{stats.totalUsers}</h2>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-success">{stats.totalReports}</h2>
              <p className="text-muted mb-0">Total Reports</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-warning">{stats.reportsByStatus.submitted || 0}</h2>
              <p className="text-muted mb-0">Pending Review</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-info">{stats.reportsByStatus.reviewed || 0}</h2>
              <p className="text-muted mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Reports by Status</h5>
            </Card.Header>
            <Card.Body>
              {Object.entries(stats.reportsByStatus).map(([status, count]) => (
                <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                  <Badge bg={getStatusVariant(status)}>
                    {status.replace('_', ' ')}
                  </Badge>
                  <span>{count} reports</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              {stats.recentActivity.map((report) => (
                <div key={report.id} className="mb-2">
                  <div className="d-flex justify-content-between">
                    <strong>{report.course_code}</strong>
                    <small className="text-muted">
                      {new Date(report.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <small className="text-muted">
                    By {report.lecturer?.name} • {report.class_name}
                  </small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default SystemStats;