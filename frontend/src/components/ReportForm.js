import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { supabase } from '../config/supabase';

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
    recommendations: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        recommendations: ''
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

  // Pre-fill with today's date and current week
  React.useEffect(() => {
    const today = new Date();
    const currentWeek = Math.ceil((today - new Date(today.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
    
    setFormData(prev => ({
      ...prev,
      date_of_lecture: today.toISOString().split('T')[0],
      week_of_reporting: currentWeek
    }));
  }, []);

  return (
    <Container>
      <Card>
        <Card.Header>
          <h4>📝 Submit Class Report</h4>
        </Card.Header>
        <Card.Body>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
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
                {loading ? 'Submitting Report...' : '📤 Submit Report'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ReportForm;