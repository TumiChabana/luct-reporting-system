import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Alert } from 'react-bootstrap';
import { supabase } from '../config/supabase';

function RatingSystem({ user, reportId }) {
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    if (user.role === 'student') {
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

    try {
      const { error } = await supabase
        .from('ratings')
        .upsert(
          {
            report_id: reportId,
            student_id: user.id,
            rating_value: rating
          },
          { onConflict: 'report_id,student_id' }
        );

      if (error) throw error;

      setUserRating(rating);
      setHasRated(true);
      fetchAverageRating(); // Refresh average
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStars = (forDisplay = false, displayRating = averageRating) => {
    if (forDisplay) {
      return (
        <div className="d-flex align-items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`fs-5 ${star <= displayRating ? 'text-warning' : 'text-muted'}`}
            >
              {star <= displayRating ? '★' : '☆'}
            </span>
          ))}
          <Badge bg="secondary" className="ms-2">
            {displayRating.toFixed(1)} ({totalRatings} ratings)
          </Badge>
        </div>
      );
    }

    return (
      <div className="d-flex justify-content-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant={star <= userRating ? "warning" : "outline-warning"}
            size="sm"
            className="mx-1"
            onClick={() => handleRate(star)}
            disabled={hasRated}
          >
            {star <= userRating ? '★' : '☆'} {star}
          </Button>
        ))}
      </div>
    );
  };

  if (user.role !== 'student') {
    return (
      <Card className="mt-3">
        <Card.Body>
          <h6>Class Rating</h6>
          {totalRatings > 0 ? (
            renderStars(true)
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
          <Col md={6}>
            <h6>Rate This Class</h6>
            {hasRated ? (
              <Alert variant="success" className="py-2">
                <div className="d-flex align-items-center">
                  <span>Your rating: </span>
                  {renderStars(true, userRating)}
                </div>
                <small className="text-muted">Thank you for your feedback!</small>
              </Alert>
            ) : (
              <div>
                <p className="text-muted mb-2">How would you rate this class?</p>
                {renderStars()}
                <small className="text-muted d-block mt-2">
                  1 (Poor) - 5 (Excellent)
                </small>
              </div>
            )}
          </Col>
          <Col md={6}>
            <h6>Average Rating</h6>
            {totalRatings > 0 ? (
              renderStars(true)
            ) : (
              <p className="text-muted mb-0">Be the first to rate!</p>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default RatingSystem;