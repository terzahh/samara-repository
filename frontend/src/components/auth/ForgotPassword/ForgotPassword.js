import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ForgotPassword.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        toast.success('Reset code sent to your email!');
        // Redirect to reset password page with email
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setError(data.error || 'Failed to send reset email');
        toast.error(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <Card className="forgot-password-card">
        <Card.Body>
          <h2 className="text-center mb-4">Forgot Password</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <Link to="/login">Back to Login</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ForgotPassword;