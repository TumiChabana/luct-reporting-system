import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import { supabase } from '../config/supabase';
import '../App.css';

function CourseAssignment({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    lecturer_id: '',
    stream: '',
    program_type: '',
    academic_year: new Date().getFullYear().toString(),
    semester: '1'
  });

  useEffect(() => {
    fetchAssignments();
    fetchLecturers();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      let query = supabase
        .from('course_assignments')
        .select(`
          *,
          lecturer:users!course_assignments_lecturer_id_fkey(name, email, stream),
          assigned_by_user:users!course_assignments_assigned_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      // PL can only see assignments for their program type
      if (user.role === 'pl') {
        query = query.eq('program_type', user.program_type);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchLecturers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['lecturer', 'prl', 'pl']);

      if (error) throw error;
      setLecturers(data || []);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('course_assignments')
        .insert([
          {
            ...formData,
            assigned_by: user.id
          }
        ]);

      if (error) throw error;

      setMessage('Course assigned successfully!');
      setShowModal(false);
      setFormData({
        course_code: '',
        course_name: '',
        lecturer_id: '',
        stream: '',
        program_type: user.program_type || '',
        academic_year: new Date().getFullYear().toString(),
        semester: '1'
      });
      
      fetchAssignments();
    } catch (error) {
      setError('Error assigning course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this course assignment?')) return;

    try {
      const { error } = await supabase
        .from('course_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      setMessage(' Course assignment removed!');
      fetchAssignments();
    } catch (error) {
      setError('Error removing assignment: ' + error.message);
    }
  };

  return (
    <Container>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h4>📚 Course Assignment Management</h4>
            <small className="text-muted">
              {user.role === 'pl' ? `Manage ${user.program_type} program courses` : 'Manage all course assignments'}
            </small>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            ➕ Assign New Course
          </Button>
        </Card.Header>
        <Card.Body>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Table responsive striped>
            <thead>
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
                  <td>{assignment.lecturer?.name}</td>
                  <td>
                    <Badge bg="info">{assignment.stream}</Badge>
                  </td>
                  <td>
                    <Badge bg={assignment.program_type === 'Degree' ? 'primary' : 'success'}>
                      {assignment.program_type}
                    </Badge>
                  </td>
                  <td>{assignment.academic_year} - Sem {assignment.semester}</td>
                  <td>{assignment.assigned_by_user?.name}</td>
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

          {assignments.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No course assignments found.</p>
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
                  <Form.Label>Course Code</Form.Label>
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
                  <Form.Label>Course Name</Form.Label>
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
                  <Form.Label>Lecturer</Form.Label>
                  <Form.Select
                    value={formData.lecturer_id}
                    onChange={(e) => setFormData({...formData, lecturer_id: e.target.value})}
                    required
                  >
                    <option value="">Select Lecturer...</option>
                    {lecturers.map(lecturer => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.name} ({lecturer.role.toUpperCase()})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stream</Form.Label>
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
                  <Form.Label>Program Type</Form.Label>
                  <Form.Select
                    value={formData.program_type}
                    onChange={(e) => setFormData({...formData, program_type: e.target.value})}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Degree">Degree</option>
                    <option value="Diploma">Diploma</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Academic Year</Form.Label>
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
                  <Form.Label>Semester</Form.Label>
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

            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Assigning...' : 'Assign Course'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default CourseAssignment;