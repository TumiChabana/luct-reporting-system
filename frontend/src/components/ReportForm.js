import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { supabase } from '../config/supabase';
import '../App.css';

function ReportForm({ user, onReportSubmitted }) {
  const [formData, setFormData] = useState({
    faculty_name: 'Faculty of ICT',
    class_name: '',
    week_of_reporting: '',
    date_of_lecture: '',
    course_name: '',
    course_code: '',
    actual_students_present: '',
    total_registered_students: '',
    venue: '',
    scheduled_time: '',
    topic_taught: '',
    learning_outcomes: '',
    recommendations: '',
    academic_year: '',
    semester: '',
    stream: '',
    program_type: '',
    lecturer_rating: 0
  });
  
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-fill with today's date and current week
    const today = new Date();
    const currentWeek = Math.ceil((today - new Date(today.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
    const currentYear = today.getFullYear();
    
    setFormData(prev => ({
      ...prev,
      date_of_lecture: today.toISOString().split('T')[0],
      week_of_reporting: currentWeek,
      academic_year: currentYear,
      semester: today.getMonth() >= 6 ? '2' : '1' // Semester 1: Jan-Jun, Semester 2: Jul-Dec
    }));

    // Fetch assigned courses for lecturer
    if (user.role === 'lecturer' || user.role === 'prl' || user.role === 'pl') {
      fetchAssignedCourses();
    }
  }, [user]);

  const fetchAssignedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('lecturer_id', user.id);

      if (error) throw error;
      setAssignedCourses(data || []);
    } catch (error) {
      console.error('Error fetching assigned courses:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleCourseSelect = (courseCode) => {
    const course = assignedCourses.find(c => c.course_code === courseCode);
    if (course) {
      setFormData(prev => ({
        ...prev,
        course_code: course.course_code,
        course_name: course.course_name,
        stream: course.stream,
        program_type: course.program_type,
        academic_year: course.academic_year,
        semester: course.semester
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([
          {
            lecturer_id: user.id,
            ...formData,
            actual_students_present: parseInt(formData.actual_students_present),
            total_registered_students: parseInt(formData.total_registered_students),
            week_of_reporting: parseInt(formData.week_of_reporting),
            lecturer_rating: parseInt(formData.lecturer_rating),
            status: 'submitted'
          }
        ])
        .select();

      if (error) throw error;

      setMessage('✅ Report submitted successfully!');
      setFormData({
        faculty_name: 'Faculty of ICT',
        class_name: '',
        week_of_reporting: '',
        date_of_lecture: '',
        course_name: '',
        course_code: '',
        actual_students_present: '',
        total_registered_students: '',
        venue: '',
        scheduled_time: '',
        topic_taught: '',
        learning_outcomes: '',
        recommendations: '',
        semester: '',
        stream: '',
        program_type: '',
        lecturer_rating: 0
      });

      if (onReportSubmitted) {
        onReportSubmitted();
      }
    } catch (error) {
      setError('Error submitting report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <Container>
      <Card>
        <Card.Header>
          <h4>Submit Class Report</h4>
        </Card.Header>
        <Card.Body>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Assigned Courses Dropdown for Lecturers */}
            {(user.role === 'lecturer' || user.role === 'prl' || user.role === 'pl') && assignedCourses.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Select Assigned Course</Form.Label>
                <Form.Select 
                  onChange={(e) => handleCourseSelect(e.target.value)}
                >
                  <option value="">Choose a course...</option>
                  {assignedCourses.map(course => (
                    <option key={course.id} value={course.course_code}>
                      {course.course_code} - {course.course_name} ({course.stream}, {course.program_type})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Faculty Name</Form.Label>
                  <Form.Select 
                    name="faculty_name" 
                    value={formData.faculty_name}
                    onChange={handleChange}
                    required
                  >
                    <option value="Faculty of ICT">Faculty of ICT</option>
                    <option value="Faculty of Business">Faculty of Business</option>
                    <option value="Faculty of Design">Faculty of Design</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Class Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="class_name"
                    placeholder="e.g., Web Development Class"
                    value={formData.class_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Academic Year</Form.Label>
                  <Form.Control
                    type="text"
                    name="academic_year"
                    placeholder="e.g., 2024"
                    value={formData.academic_year}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Semester</Form.Label>
                  <Form.Select 
                    name="semester" 
                    value={formData.semester}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Stream</Form.Label>
                  <Form.Select 
                    name="stream" 
                    value={formData.stream}
                    onChange={handleChange}
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

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Program Type</Form.Label>
                  <Form.Select 
                    name="program_type" 
                    value={formData.program_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Degree">Degree</option>
                    <option value="Diploma">Diploma</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Week of Reporting</Form.Label>
                  <Form.Control
                    type="number"
                    name="week_of_reporting"
                    min="1"
                    max="52"
                    value={formData.week_of_reporting}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Lecture</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_of_lecture"
                    value={formData.date_of_lecture}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Scheduled Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="scheduled_time"
                    value={formData.scheduled_time}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="course_name"
                    placeholder="e.g., Web Application Development"
                    value={formData.course_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="course_code"
                    placeholder="e.g., DIWA2110"
                    value={formData.course_code}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Actual Students Present</Form.Label>
                  <Form.Control
                    type="number"
                    name="actual_students_present"
                    min="1"
                    max="100"
                    value={formData.actual_students_present}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Registered Students</Form.Label>
                  <Form.Control
                    type="number"
                    name="total_registered_students"
                    min="1"
                    max="100"
                    value={formData.total_registered_students}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Venue</Form.Label>
              <Form.Control
                type="text"
                name="venue"
                placeholder="e.g., Computer Lab A, Room 101"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Rate This Class Session (1-5 stars)</Form.Label>
              <Form.Select 
                name="lecturer_rating" 
                value={formData.lecturer_rating}
                onChange={handleChange}
                required
              >
                <option value="0">Select Rating...</option>
                <option value="1">(Poor)</option>
                <option value="2">(Fair)</option>
                <option value="3"> (Good)</option>
                <option value="4"> (Very Good)</option>
                <option value="5">(Excellent)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Topic Taught</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="topic_taught"
                placeholder="Describe the main topics covered in this lecture..."
                value={formData.topic_taught}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Learning Outcomes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="learning_outcomes"
                placeholder="What should students be able to do after this lecture?"
                value={formData.learning_outcomes}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Recommendations</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="recommendations"
                placeholder="Any recommendations for improvement or follow-up actions..."
                value={formData.recommendations}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'Submitting Report...' : 'Submit Report'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ReportForm;