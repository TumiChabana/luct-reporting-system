import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import { supabase } from '../config/supabase';

function CourseAssignment({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    lecturer_id: '',
    stream: '',
    program_type: user.degree_type || 'Degree',
    academic_year: new Date().getFullYear().toString(),
    semester: '1'
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setFetchingData(true);
    await fetchAssignments();
    await fetchLecturers();
    setFetchingData(false);
  };

  const fetchAssignments = async () => {
    try {
      console.log('Starting fetchAssignments...');
      console.log('User info:', { role: user.role, degree_type: user.degree_type, id: user.id });
      
      // First, try a simple query without joins
      let query = supabase
        .from('course_assignments')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by program type for PL users
      if (user.role === 'pl') {
        console.log('Filtering for PL user, program_type:', user.degree_type);
        query = query.eq('program_type', user.degree_type);
      }

      const { data: assignmentsData, error: assignmentsError } = await query;

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        throw assignmentsError;
      }

      console.log('Raw assignments data:', assignmentsData);
      console.log('Number of assignments found:', assignmentsData?.length || 0);

      if (!assignmentsData || assignmentsData.length === 0) {
        console.log('No assignments found');
        setAssignments([]);
        return;
      }

      // Fetch related user data separately for better error handling
      const lecturerIds = [...new Set(assignmentsData.map(a => a.lecturer_id).filter(Boolean))];
      const assignedByIds = [...new Set(assignmentsData.map(a => a.assigned_by).filter(Boolean))];
      
      console.log('Fetching lecturer IDs:', lecturerIds);
      console.log('Fetching assigned_by IDs:', assignedByIds);

      // Fetch lecturers
      let lecturersMap = {};
      if (lecturerIds.length > 0) {
        const { data: lecturersData, error: lecturersError } = await supabase
          .from('users')
          .select('id, name, email, stream')
          .in('id', lecturerIds);

        if (!lecturersError && lecturersData) {
          lecturersMap = Object.fromEntries(lecturersData.map(l => [l.id, l]));
          console.log('Lecturers fetched:', lecturersMap);
        } else {
          console.warn('Could not fetch lecturers:', lecturersError);
        }
      }

      // Fetch assigned_by users
      let assignedByMap = {};
      if (assignedByIds.length > 0) {
        const { data: assignedByData, error: assignedByError } = await supabase
          .from('users')
          .select('id, name')
          .in('id', assignedByIds);

        if (!assignedByError && assignedByData) {
          assignedByMap = Object.fromEntries(assignedByData.map(u => [u.id, u]));
          console.log('Assigned by users fetched:', assignedByMap);
        } else {
          console.warn('Could not fetch assigned_by users:', assignedByError);
        }
      }

      // Combine the data
      const enrichedAssignments = assignmentsData.map(assignment => ({
        ...assignment,
        lecturer: lecturersMap[assignment.lecturer_id] || null,
        assigned_by_user: assignedByMap[assignment.assigned_by] || null
      }));

      console.log('Enriched assignments:', enrichedAssignments);
      setAssignments(enrichedAssignments);

    } catch (error) {
      console.error('Error in fetchAssignments:', error);
      setError('Failed to load course assignments: ' + error.message);
      setAssignments([]);
    }
  };

  const fetchLecturers = async () => {
    try {
      console.log('Fetching lecturers...');
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, stream')
        .in('role', ['lecturer', 'prl'])
        .order('name');

      if (error) {
        console.error('Error fetching lecturers:', error);
        throw error;
      }
      
      console.log('Lecturers fetched:', data);
      setLecturers(data || []);
    } catch (error) {
      console.error('Error in fetchLecturers:', error);
      setError('Failed to load lecturers: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('Submitting form data:', formData);

      // Validate form data
      if (!formData.course_code || !formData.course_name || !formData.lecturer_id || !formData.stream) {
        throw new Error('Please fill in all required fields');
      }

      const insertData = {
        course_code: formData.course_code.trim(),
        course_name: formData.course_name.trim(),
        lecturer_id: formData.lecturer_id,
        stream: formData.stream,
        program_type: formData.program_type,
        academic_year: formData.academic_year,
        semester: formData.semester,
        assigned_by: user.id
      };

      console.log('Inserting data:', insertData);

      const { data, error } = await supabase
        .from('course_assignments')
        .insert([insertData])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Insert successful:', data);

      setMessage('Course assigned successfully!');
      setShowModal(false);
      
      // Reset form
      setFormData({
        course_code: '',
        course_name: '',
        lecturer_id: '',
        stream: '',
        program_type: user.degree_type || 'Degree',
        academic_year: new Date().getFullYear().toString(),
        semester: '1'
      });

      // Refetch assignments to ensure UI is in sync with database
      await fetchAssignments();

    } catch (error) {
      console.error('Error assigning course:', error);
      setError('Error assigning course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this course assignment?')) return;

    try {
      console.log('Deleting assignment:', assignmentId);
      
      const { error } = await supabase
        .from('course_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Assignment deleted successfully');
      setMessage('Course assignment removed successfully!');
      
      // Refetch to ensure UI is in sync
      await fetchAssignments();
      
    } catch (error) {
      console.error('Error removing assignment:', error);
      setError('Error removing assignment: ' + error.message);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  return (
    <Container>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h4>Course Assignment Management</h4>
            <small className="text-muted">
              {user.role === 'pl' ? `Manage ${user.degree_type} program courses` : 'Manage all course assignments'}
            </small>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Assign New Course
          </Button>
        </Card.Header>
        <Card.Body>
          {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          {fetchingData ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading course assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No course assignments found.</p>
              <Button variant="outline-primary" onClick={() => setShowModal(true)}>
                Create Your First Assignment
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-dark">
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Lecturer</th>
                    <th>Stream</th>
                    <th>Program</th>
                    <th>Year/Semester</th>
                    <th>Assigned By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td><strong>{assignment.course_code}</strong></td>
                      <td>{assignment.course_name}</td>
                      <td>
                        {assignment.lecturer ? (
                          <>
                            {assignment.lecturer.name}
                            <br />
                            <small className="text-muted">{assignment.lecturer.email}</small>
                          </>
                        ) : (
                          <span className="text-muted">Lecturer not found</span>
                        )}
                      </td>
                      <td>
                        <Badge bg="info">{assignment.stream}</Badge>
                      </td>
                      <td>
                        <Badge bg={assignment.program_type === 'Degree' ? 'primary' : 'success'}>
                          {assignment.program_type}
                        </Badge>
                      </td>
                      <td>{assignment.academic_year} - Sem {assignment.semester}</td>
                      <td>
                        {assignment.assigned_by_user ? (
                          assignment.assigned_by_user.name
                        ) : (
                          <span className="text-muted">Unknown</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Assign Course Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Assign New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.course_code}
                    onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                    placeholder="e.g., DIWA2110"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.course_name}
                    onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                    placeholder="e.g., Web Application Development"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Lecturer *</Form.Label>
                  <Form.Select
                    value={formData.lecturer_id}
                    onChange={(e) => setFormData({...formData, lecturer_id: e.target.value})}
                    required
                  >
                    <option value="">Select Lecturer...</option>
                    {lecturers.map(lecturer => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.name} ({lecturer.role.toUpperCase()}) - {lecturer.stream || 'N/A'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stream *</Form.Label>
                  <Form.Select
                    value={formData.stream}
                    onChange={(e) => setFormData({...formData, stream: e.target.value})}
                    required
                  >
                    <option value="">Select Stream...</option>
                    <option value="IT">Information Technology</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Program Type *</Form.Label>
                  <Form.Select
                    value={formData.program_type}
                    onChange={(e) => setFormData({...formData, program_type: e.target.value})}
                    required
                    disabled={user.role === 'pl'}
                  >
                    <option value="Degree">Degree</option>
                    <option value="Diploma">Diploma</option>
                  </Form.Select>
                  {user.role === 'pl' && (
                    <Form.Text className="text-muted">
                      Locked to your program type
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Academic Year *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                    placeholder="e.g., 2024"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Semester *</Form.Label>
                  <Form.Select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    required
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Assigning...' : ' Assign Course'}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default CourseAssignment;