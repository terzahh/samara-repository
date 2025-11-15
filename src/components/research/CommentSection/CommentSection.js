import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../hooks/useAuth';
import { createComment } from '../../../services/researchService';
import { getComments } from '../../../supabase/database';
import { formatDate } from '../../../utils/helpers';
import Loading from '../../common/Loading/Loading';
import './CommentSection.css';

const CommentSection = ({ researchId }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  
  // Fetch comments using local state only - no global context to prevent conflicts
  useEffect(() => {
    if (!researchId) return;
    
    let isMounted = true;
    setLoading(true);
    
    const loadComments = async () => {
      try {
        const fetchedComments = await getComments(researchId);
        if (isMounted) {
          setComments(fetchedComments || []);
        }
      } catch (err) {
        console.error('Error loading comments:', err);
        if (isMounted) {
          setComments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadComments();
    
    return () => {
      isMounted = false;
    };
  }, [researchId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const commentData = {
        research_id: researchId,
        user_id: user.id,
        content: newComment,
        is_author: false // This would be true if the commenter is the research author
      };
      
      await createComment(researchId, commentData);
      
      // Reset form
      setNewComment('');
      setSuccess('Comment added successfully!');
      
      // Refresh comments locally
      setLoading(true);
      try {
        const refreshedComments = await getComments(researchId);
        setComments(refreshedComments || []);
      } catch (err) {
        console.error('Error refreshing comments:', err);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      // Show more specific error message
      if (error.message?.includes('Row Level Security') || error.message?.includes('Permission denied')) {
        setError('Permission denied. Please check your authentication and RLS policies.');
      } else {
        setError(error.message || 'Failed to add comment. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Card className="comment-section">
      <Card.Header as="h5">
        <FontAwesomeIcon icon={faComment} className="me-2" />
        Comments ({comments?.length || 0})
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        {user ? (
          <Form onSubmit={handleSubmit} className="mb-4">
            <Form.Group controlId="newComment">
              <Form.Label>Add a Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Share your thoughts about this research..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </Form>
        ) : (
          <Alert variant="info">
            Please <a href="/login">log in</a> to leave a comment.
          </Alert>
        )}
        
        {loading ? (
          <Loading message="Loading comments..." />
        ) : !comments || comments.length === 0 ? (
          <div className="text-center py-3">
            <p className="text-muted">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <ListGroup className="comments-list">
            {comments.map(comment => (
              <ListGroup.Item key={comment.id || Math.random()} className="comment-item">
                <div className="d-flex">
                  <div className="comment-avatar me-3">
                    <FontAwesomeIcon icon={faUser} size="2x" />
                  </div>
                  <div className="comment-content flex-grow-1">
                    <div className="comment-header d-flex justify-content-between">
                      <h6 className="comment-author mb-1">
                        {comment.users?.display_name || comment.user?.display_name || 'Anonymous'}
                        {comment.is_author && (
                          <span className="badge bg-primary ms-2">Author</span>
                        )}
                      </h6>
                      <small className="text-muted">
                        {formatDate(comment.created_at)}
                      </small>
                    </div>
                    <p className="comment-text mb-0">{comment.content}</p>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default CommentSection;