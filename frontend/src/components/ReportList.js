import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { supabase } from '../config/supabase';

function ReportList({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          lecturer:users!reports_lecturer_id_fkey(name, email),
          prl:users!reports_prl_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (user.role === 'lecturer') {
        query = query.eq('lecturer_id', user.id);
      } else if (user.role === 'student') {
        // Students see all reports (in real app, would filter by their stream/course)
        query = query;
      } else if (user.role === 'prl') {
        // PRL sees reports from their stream
        query = query.eq('status', 'submitted');
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
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

  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleAddFeedback = async (reportId, feedback) => {
    if (user.role === 'prl') {
      try {
        const { error } = await supabase
          .from('reports')
          .update({ 
            prl_feedback: feedback,
            prl_id: user.id,
            status: 'reviewed'
          })
          .eq('id', reportId);

        if (error) throw error;
        
        setShowModal(false);
        fetchReports(); // Refresh the list
      } catch (error) {
        console.error('Error adding feedback:', error);
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <Card.Body className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading reports...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Card.Header>
          <h4>📋 Class Reports</h4>
          <small className="text-muted">
            {user.role === 'lecturer' ? 'Your submitted reports' : 
             user.role === 'student' ? 'Available class reports' :
             'Reports for review'}
          </small>
        </Card.Header>
        <Card.Body>
          {reports.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No reports found.</p>
              {user.role === 'lecturer' && (
                <p>Submit your first class report to get started!</p>
              )}
            </div>
          ) : (
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Class</th>
                  <th>Week</th>
                  <th>Date</th>
                  <th>Students</th>
                  {user.role !== 'lecturer' && <th>Lecturer</th>}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <strong>{report.course_code}</strong>
                      <br />
                      <small>{report.course_name}</small>
                    </td>
                    <td>{report.class_name}</td>
                    <td>Week {report.week_of_reporting}</td>
                    <td>{new Date(report.date_of_lecture).toLocaleDateString()}</td>
                    <td>
                      {report.actual_students_present}/{report.total_registered_students}
                    </td>
                    {user.role !== 'lecturer' && (
                      <td>{report.lecturer?.name}</td>
                    )}
                    <td>
                      <Badge bg={getStatusVariant(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => viewReportDetails(report)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Report Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Report Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <div>
              <Row>
                <Col md={6}>
                  <strong>Course:</strong> {selectedReport.course_name} ({selectedReport.course_code})
                </Col>
                <Col md={6}>
                  <strong>Class:</strong> {selectedReport.class_name}
                </Col>
              </Row>
              <Row className="mt-2">
                <Col md={6}>
                  <strong>Date:</strong> {new Date(selectedReport.date_of_lecture).toLocaleDateString()}
                </Col>
                <Col md={6}>
                  <strong>Time:</strong> {selectedReport.scheduled_time}
                </Col>
              </Row>
              <Row className="mt-2">
                <Col md={6}>
                  <strong>Venue:</strong> {selectedReport.venue}
                </Col>
                <Col md={6}>
                  <strong>Attendance:</strong> {selectedReport.actual_students_present}/{selectedReport.total_registered_students}
                </Col>
              </Row>
              
              <hr />
              
              <div className="mt-3">
                <strong>Topic Taught:</strong>
                <p>{selectedReport.topic_taught}</p>
              </div>
              
              <div className="mt-3">
                <strong>Learning Outcomes:</strong>
                <p>{selectedReport.learning_outcomes}</p>
              </div>
              
              <div className="mt-3">
                <strong>Recommendations:</strong>
                <p>{selectedReport.recommendations}</p>
              </div>

              {selectedReport.prl_feedback && (
                <div className="mt-3 p-3 bg-light rounded">
                  <strong>PRL Feedback:</strong>
                  <p className="mb-1">{selectedReport.prl_feedback}</p>
                  <small className="text-muted">
                    Reviewed by: {selectedReport.prl?.name}
                  </small>
                </div>
              )}

              {user.role === 'prl' && !selectedReport.prl_feedback && (
                <div className="mt-3">
                  <Form.Group>
                    <Form.Label>Add Feedback</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter your feedback..."
                      onChange={(e) => {
                        setSelectedReport({
                          ...selectedReport,
                          prl_feedback: e.target.value
                        });
                      }}
                    />
                  </Form.Group>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {user.role === 'prl' && !selectedReport?.prl_feedback && (
            <Button 
              variant="primary"
              onClick={() => handleAddFeedback(selectedReport.id, selectedReport.prl_feedback)}
            >
              Submit Feedback
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ReportList;