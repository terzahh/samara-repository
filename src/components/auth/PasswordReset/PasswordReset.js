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
  const [resetLink, setResetLink] = useState('');
  
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
      console.log('🔄 Requesting password reset for:', email);
      const result = await forgotPassword(email);
      console.log('📥 Password reset response received:', result);
      
      setSuccess(true);
      
      // Extract reset link from result if available
      if (result && result.resetLink) {
        setResetLink(result.resetLink);
        console.log('✅ Reset link found in response:', result.resetLink);
      } else {
        // If no link in response, the user might not exist
        console.log('⚠️ Reset link not in response.');
        console.log('ℹ️ This could mean:');
        console.log('   1. The email is not registered in the system');
        console.log('   2. There was an error (check console for details)');
        console.log('   3. Check the console above for any reset link that was logged');
      }
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setError(error.message || 'Failed to send password reset email. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="password-reset-card">
      <Card.Body>
        <Card.Title className="text-center mb-4">Reset Password</Card.Title>
        
        {success ? (
          <div>
            <Alert variant="success">
              <strong>Password Reset Request Received</strong>
              <p className="mb-0 mt-2">
                If an account exists with this email address, you will receive password reset instructions.
                Please check your inbox and follow the instructions to reset your password.
              </p>
            </Alert>
            <Alert variant="info" className="mt-3">
              <strong>Password Reset Instructions:</strong>
              <div className="mt-2">
                <p className="mb-2">
                  <strong>Important:</strong> Check your browser console (Press F12 → Console tab) for the password reset link.
                </p>
                {resetLink ? (
                  <div className="mt-3">
                    <Alert variant="success" className="mb-3">
                      <strong>✅ Password Reset Link Generated!</strong>
                    </Alert>
                    <p className="mb-2">
                      <strong>Password Reset Link:</strong>
                    </p>
                    <div className="bg-light p-3 rounded mb-2 border" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      <code style={{ wordBreak: 'break-all', fontSize: '12px' }}>
                        {resetLink}
                      </code>
                    </div>
                    <div className="d-flex gap-2 mb-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => {
                          window.open(resetLink, '_blank');
                        }}
                      >
                        Open Reset Link
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(resetLink).then(() => {
                            alert('Reset link copied to clipboard!');
                          }).catch(() => {
                            // Fallback for older browsers
                            const textArea = document.createElement('textarea');
                            textArea.value = resetLink;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            alert('Reset link copied to clipboard!');
                          });
                        }}
                      >
                        Copy Link
                      </Button>
                    </div>
                    <p className="mb-2 small text-muted">
                      Click "Open Reset Link" or copy the link above to reset your password. The link expires in 1 hour.
                    </p>
                  </div>
                ) : (
                  <Alert variant="warning" className="mt-2">
                    <strong>⚠️ Reset Link Not Available</strong>
                    <p className="mb-2 mt-2">
                      The reset link was not returned in the response. This could mean:
                    </p>
                    <ul className="mb-2">
                      <li>The email address is not registered in the system</li>
                      <li>There was an error processing the request</li>
                    </ul>
                    <p className="mb-0">
                      <strong>Please check your browser console (Press F12 → Console tab)</strong> for detailed information and any reset link that may have been generated.
                    </p>
                    <p className="mb-0 mt-2 small">
                      If you believe this email should be registered, please contact the administrator or try again.
                    </p>
                  </Alert>
                )}
                <p className="mb-0 small text-muted mt-2">
                  <strong>Note:</strong> In production, the reset link will be automatically sent to your email address.
                </p>
              </div>
            </Alert>
          </div>
        ) : (
          <>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <p className="text-center mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <Alert variant="info" className="mb-3">
              <small>
                <strong>💡 Tip:</strong> After submitting, check the browser console (F12 → Console) for detailed information. 
                If a reset link is generated, it will be displayed above and also logged to the console.
              </small>
            </Alert>
            
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