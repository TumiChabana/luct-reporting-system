import { exportToExcel } from '../services/exportService';
import { exportSingleReportToExcel } from '../services/exportService';
import RatingSystem from './RatingSystem';
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { supabase } from '../config/supabase';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function ReportList({ user }) {
  const [exporting, setExporting] = useState(false);
  const [exportingSingle, setExportingSingle] = useState(null);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  
  // Add missing function for single report export
  const exportSingleReportToExcel = async (report) => {
    // You'll need to implement this function in your exportService
    // For now, using the existing export function
    await exportToExcel(user, [report]); // Assuming exportToExcel can accept specific reports
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          lecturer:users!reports_lecturer_id_fkey(id, name),
          prl:users!reports_prl_id_fkey(id, name)
        `)
        .order('date_of_lecture', { ascending: false });

      // Filter based on user role
      if (user.role === 'lecturer') {
        query = query.eq('lecturer_id', user.id);
      } else if (user.role === 'student') {
        // If students should only see certain reports, add filter here
        // For now, showing all reports
      } else if (user.role === 'prl') {
        // PRLs can see all reports
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Failed to load reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, courseFilter]);

  const filterReports = () => {
    let filtered = reports;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.lecturer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(report => report.course_code === courseFilter);
    }

    setFilteredReports(filtered);
  };

  // Get unique courses for filter
  const uniqueCourses = [...new Set(reports.map(report => report.course_code))];
  
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

  // Add this function to handle PRL feedback
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
        alert('Failed to add feedback: ' + error.message);
      }
    }
  };

  // Add PRL rating functionality
  const handlePRLRating = async (reportId, rating) => {
    if (user.role === 'prl') {
      try {
        const { error } = await supabase
          .from('reports')
          .update({ 
            prl_rating: rating
          })
          .eq('id', reportId);

        if (error) throw error;
        
        fetchReports(); // Refresh the list
      } catch (error) {
        console.error('Error adding PRL rating:', error);
        alert('Failed to add rating: ' + error.message);
      }
    }
  };

  

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToExcel(user);
    } catch (error) {
      alert(error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportSingle = async (report) => {
    setExportingSingle(report.id);
    try {
      await exportSingleReportToExcel(report);
    } catch (error) {
      alert(error.message);
    } finally {
      setExportingSingle(null);
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4>Class Reports</h4>
              <small className="text-muted">
                {user.role === 'lecturer' ? 'Your submitted reports' : 
                 user.role === 'student' ? 'Available class reports' :
                 'Reports for review'}
              </small>
            </div>
            <Button
              variant="success"
              size="sm"
              onClick={handleExport}
              disabled={exporting || reports.length === 0}
            >
              {exporting ? 'Exporting...' : 'Export to Excel'}
            </Button>
          </div>
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
            <>
              {/* Search and Filter Section */}
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Search</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by course, class, or lecturer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="reviewed">Reviewed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Course</Form.Label>
                    <Form.Select
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                    >
                      <option value="all">All Courses</option>
                      {uniqueCourses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Results Count */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">
                  Showing {filteredReports.length} of {reports.length} reports
                </span>
                {(searchTerm || statusFilter !== 'all' || courseFilter !== 'all') && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setCourseFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {filteredReports.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No reports found matching your criteria.</p>
                </div>
              ) : (
                <Table responsive striped className="reports-table">
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
                    {filteredReports.map((report) => (
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
                          <div className="d-flex gap-1">
                            <Button
                              
                              size="sm"
                              onClick={() => viewReportDetails(report)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleExportSingle(report)}
                              disabled={exportingSingle === report.id}
                            >
                              {exportingSingle === report.id ? 'Downloading' : 'Download'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
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
              {/* Add download button at the top of modal */}
              <div className="d-flex justify-content-end mb-3">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleExportSingle(selectedReport)}
                  disabled={exportingSingle === selectedReport.id}
                >
                  {exportingSingle === selectedReport.id ? ' Exporting...' : 'Download Excel'}
                </Button>
              </div>

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
                  <strong>Academic Year:</strong> {selectedReport.academic_year}
                </Col>
                <Col md={6}>
                  <strong>Semester:</strong> {selectedReport.semester}
                </Col>
              </Row>
              <Row className="mt-2">
                <Col md={6}>
                  <strong>Stream:</strong> {selectedReport.stream}
                </Col>
                <Col md={6}>
                  <strong>Program Type:</strong> {selectedReport.program_type}
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
              
              {/* Lecturer Rating */}
              {selectedReport.lecturer_rating && (
                <Row className="mt-2">
                  <Col md={12}>
                    <strong>Lecturer Rating:</strong> {'⭐'.repeat(selectedReport.lecturer_rating)}
                  </Col>
                </Row>
              )}

              {/* PRL Rating */}
              {selectedReport.prl_rating && (
                <Row className="mt-2">
                  <Col md={12}>
                    <strong>PRL Rating:</strong> {'⭐'.repeat(selectedReport.prl_rating)}
                  </Col>
                </Row>
              )}
              
              <hr />
              
              <div className="mt-3">
                <strong>Topic Taught:</strong>
                <p className="mt-1">{selectedReport.topic_taught}</p>
              </div>
              
              <div className="mt-3">
                <strong>Learning Outcomes:</strong>
                <p className="mt-1">{selectedReport.learning_outcomes}</p>
              </div>
              
              <div className="mt-3">
                <strong>Recommendations:</strong>
                <p className="mt-1">{selectedReport.recommendations}</p>
              </div>

              {selectedReport.prl_feedback && (
                <div className="mt-3 p-3 bg-light rounded">
                  <strong>PRL Feedback:</strong>
                  <p className="mt-1 mb-1">{selectedReport.prl_feedback}</p>
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

              {/* Rating System */}
              <RatingSystem user={user} reportId={selectedReport?.id} />
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