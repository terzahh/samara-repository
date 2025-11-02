import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { login } from '../../../services/authService';
import { validateEmail, validatePassword } from '../../../utils/validators';
import './LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
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
      // Start login but don't fail early; in parallel, poll session for up to ~20s
      const loginPromise = login(formData.email, formData.password)
        .then(u => ({ user: u, error: null }))
        .catch(err => ({ user: null, error: err }));

      let session = null;
      const start = Date.now();
      for (let i = 0; i < 20; i++) {
        if (window.supabase) {
          try {
            const { data: { session: s } } = await window.supabase.auth.getSession();
            if (s) { session = s; break; }
          } catch (_) {
            // ignore and retry
          }
        }
        // small delay between polls
        await new Promise(r => setTimeout(r, 1000));
      }

      const result = await Promise.race([
        loginPromise,
        new Promise(resolve => setTimeout(() => resolve({ user: null, error: new Error('Login did not complete in time. Please try again.') }), 30000))
      ]);

      if (result && result.error) {
        throw result.error;
      }

      if (result && result.user) {
        console.log('Login successful (promise) in', Date.now() - start, 'ms:', result.user);
        window.location.replace('/');
        return;
      }

      if (session) {
        console.log('Login successful (session detected) in', Date.now() - start, 'ms');
        window.location.replace('/');
        return;
      }

      throw new Error('Login did not complete. Please check your network and try again.');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="login-form-card">
      <Card.Body>
        <Card.Title className="text-center mb-4">Login</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </Form>
        
        <div className="text-center mt-3">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LoginForm;