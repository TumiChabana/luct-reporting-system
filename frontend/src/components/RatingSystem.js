import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import { supabase } from '../config/supabase';

function RatingSystem({ user, reportId }) {
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.role === 'student' && reportId) {
      checkUserRating();
      fetchAverageRating();
    }
  }, [user, reportId]);

  const checkUserRating = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating_value')
        .eq('report_id', reportId)
        .eq('student_id', user.id)
        .single();

      if (data) {
        setUserRating(data.rating_value);
        setHasRated(true);
      }
    } catch (error) {
      // No rating found for this user
      console.log('No existing rating found for this user');
    }
  };

  const fetchAverageRating = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating_value')
        .eq('report_id', reportId);

      if (data && data.length > 0) {
        const total = data.reduce((sum, rating) => sum + rating.rating_value, 0);
        const average = total / data.length;
        setAverageRating(average);
        setTotalRatings(data.length);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleRate = async (rating) => {
    if (user.role !== 'student') return;

    setLoading(true);
    const ratingValue = parseInt(rating);

    try {
      const { error } = await supabase
        .from('ratings')
        .upsert(
          {
            report_id: reportId,
            student_id: user.id,
            rating_value: ratingValue
          },
          { onConflict: 'report_id,student_id' }
        );

      if (error) throw error;

      setUserRating(ratingValue);
      setHasRated(true);
      fetchAverageRating(); // Refresh average
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating] || 'Not Rated';
  };

  const getRatingColor = (rating) => {
    const colors = {
      1: 'danger',
      2: 'warning',
      3: 'info',
      4: 'primary',
      5: 'success'
    };
    return colors[rating] || 'secondary';
  };

  if (user.role !== 'student') {
    return (
      <Card className="mt-3">
        <Card.Body>
          <h6>Class Rating</h6>
          {totalRatings > 0 ? (
            <div className="d-flex align-items-center">
              <Badge bg={getRatingColor(Math.round(averageRating))} className="fs-6">
                {averageRating.toFixed(1)}/5 - {getRatingLabel(Math.round(averageRating))}
              </Badge>
              <span className="ms-2 text-muted">({totalRatings} ratings)</span>
            </div>
          ) : (
            <p className="text-muted mb-0">No ratings yet</p>
          )}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mt-3">
      <Card.Body>
        <Row>
          {/* Student Rating Section */}
          <Col md={6}>
            <h6>Rate This Class</h6>
            {hasRated ? (
              <Alert variant="success" className="py-2">
                <div className="d-flex align-items-center">
                  <span>Your rating: </span>
                  <Badge bg={getRatingColor(userRating)} className="ms-2 fs-6">
                    {userRating}/5 - {getRatingLabel(userRating)}
                  </Badge>
                </div>
                <small className="text-muted">Thank you for your feedback!</small>
                <div className="mt-2">
                  <Form.Select 
                    value={userRating}
                    onChange={(e) => handleRate(e.target.value)}
                    disabled={loading}
                    size="sm"
                  >
                    <option value="0">Change your rating...</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </Form.Select>
                </div>
              </Alert>
            ) : (
              <div>
                <Form.Select 
                  value={userRating}
                  onChange={(e) => handleRate(e.target.value)}
                  disabled={loading}
                >
                  <option value="0">Select your rating...</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </Form.Select>
                <small className="text-muted d-block mt-2">
                  1 (Poor) to 5 (Excellent) scale
                </small>
              </div>
            )}
          </Col>

          {/* Average Rating Section */}
          <Col md={6}>
            <h6>Class Average</h6>
            {totalRatings > 0 ? (
              <div>
                <Badge bg={getRatingColor(Math.round(averageRating))} className="fs-5 mb-2">
                  {averageRating.toFixed(1)} / 5
                </Badge>
                <div className="mb-2">
                  <strong>{getRatingLabel(Math.round(averageRating))}</strong>
                </div>
                <div className="text-muted small">
                  Based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-muted mb-2">No ratings yet</p>
                <Badge bg="secondary" className="fs-6">
                  Be the first to rate!
                </Badge>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default RatingSystem;