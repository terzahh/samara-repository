import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../services/authService';
import { validateEmail } from '../../../utils/validators';
import './PasswordReset.css';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear errors when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="password-reset-card">
      <Card.Body>
        <Card.Title className="text-center mb-4">Reset Password</Card.Title>
        
        {success ? (
          <Alert variant="success">
            Password reset email sent! Please check your inbox for further instructions.
          </Alert>
        ) : (
          <>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <p className="text-center mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4" controlId="email">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
              
              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </div>
            </Form>
          </>
        )}
        
        <div className="text-center mt-3">
          <p>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PasswordReset;