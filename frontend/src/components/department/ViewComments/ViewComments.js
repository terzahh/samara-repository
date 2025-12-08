import React, { useState, useEffect } from 'react';
import { Modal, Card, Alert, Badge, Button } from 'react-bootstrap';
import { getComments } from '../../../supabase/database';
import { formatDate } from '../../../utils/helpers';
import Loading from '../../common/Loading/Loading';
import './ViewComments.css';

const ViewComments = ({ show, onHide, research }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (show && research) {
      setLoading(true);
      setError('');
      
      getComments(research.id)
        .then(commentsList => {
          setComments(commentsList);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching comments:', error);
          setError('Failed to load comments. Please try again.');
          setLoading(false);
        });
    }
  }, [show, research]);
  
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Comments on "{research?.title}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <Loading message="Loading comments..." />
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : comments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">No comments yet.</p>
          </div>
        ) : (
          <div className="comments-container">
            {comments.map(comment => (
              <Card key={comment.id} className="comment-card mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{comment.users.display_name}</strong>
                    <small className="text-muted ms-2">
                      {formatDate(comment.created_at)}
                    </small>
                  </div>
                  {comment.is_author && (
                    <Badge bg="primary">Author</Badge>
                  )}
                </Card.Header>
                <Card.Body>
                  {comment.content}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewComments;