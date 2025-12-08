import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { verifyResetToken, resetPasswordWithToken } from '../../services/authService';
import { validatePassword } from '../../utils/validators';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No reset token provided. Please use the link from your email.');
        setVerifying(false);
        return;
      }

      try {
        const tokenData = await verifyResetToken(token);
        if (tokenData && tokenData.valid) {
          setEmail(tokenData.email);
          setVerifying(false);
        } else {
          setError('Invalid or expired reset token.');
          setVerifying(false);
        }
      } catch (error) {
        setError(error.message || 'Invalid or expired reset token.');
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const result = await resetPasswordWithToken(token, formData.newPassword);
      setSuccess(true);
      setError(''); // Clear any previous errors
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to reset password. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="reset-password-page">
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Card>
                <Card.Body className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Verifying token...</span>
                  </div>
                  <p className="mt-3">Verifying reset token...</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="reset-password-card">
              <Card.Body>
                <Card.Title className="text-center mb-4">Reset Password</Card.Title>
                
                {error && !success && <Alert variant="danger">{error}</Alert>}
                
                {success ? (
                  <Alert variant="success">
                    <strong>Password Reset Successful!</strong>
                    <p className="mb-0 mt-2">
                      Your password has been reset successfully. You will be redirected to the login page shortly.
                    </p>
                  </Alert>
                ) : token ? (
                  <>
                    {email && (
                      <Alert variant="info" className="mb-3">
                        Resetting password for: <strong>{email}</strong>
                      </Alert>
                    )}
                    
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="newPassword">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password"
                          isInvalid={!!errors.newPassword}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.newPassword}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          Password must be at least 6 characters
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="confirmPassword">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          isInvalid={!!errors.confirmPassword}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <div className="d-grid gap-2">
                        <Button variant="primary" type="submit" disabled={loading}>
                          {loading ? 'Resetting Password...' : 'Reset Password'}
                        </Button>
                      </div>
                    </Form>
                  </>
                ) : (
                  <Alert variant="warning">
                    <strong>Invalid Reset Link</strong>
                    <p className="mb-0 mt-2">
                      This password reset link is invalid or has expired. Please request a new password reset.
                    </p>
                  </Alert>
                )}
                
                <div className="text-center mt-3">
                  <p>
                    <Link to="/login">Back to Login</Link>
                  </p>
                  {!token && (
                    <p>
                      <Link to="/forgot-password">Request New Reset Link</Link>
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPasswordPage;

