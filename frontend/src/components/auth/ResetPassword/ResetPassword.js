import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ResetPassword.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const verifyOTP = async () => {
    if (!formData.email || !formData.otp) {
      setError('Email and OTP are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOtpVerified(true);
        toast.success('OTP verified! Now enter your new password.');
      } else {
        setError(data.error || 'Invalid OTP');
        toast.error(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpVerified) {
      verifyOTP();
      return;
    }

    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-container">
        <Card className="reset-password-card">
          <Card.Body className="text-center">
            <div className="success-icon mb-3">✓</div>
            <h3 className="text-success">Password Reset Successfully!</h3>
            <p>Redirecting to login page...</p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <Card className="reset-password-card">
        <Card.Body>
          <h2 className="text-center mb-4">Reset Password</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Verification Code</Form.Label>
              <Form.Control
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                maxLength="6"
                disabled={otpVerified}
                required
              />
              <Form.Text className="text-muted">
                {otpVerified ? '✓ OTP verified' : 'Check your email for the verification code'}
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="New password"
                    disabled={!otpVerified}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    disabled={!otpVerified}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? (otpVerified ? 'Resetting...' : 'Verifying...') : (otpVerified ? 'Reset Password' : 'Verify OTP')}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <Link to="/forgot-password">Resend Code</Link>
            {' | '}
            <Link to="/login">Back to Login</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResetPassword;