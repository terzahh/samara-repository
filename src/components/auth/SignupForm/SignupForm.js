import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../../services/authService';
import { validateEmail, validatePassword, validateRequired } from '../../../utils/validators';
import { ROLES } from '../../../utils/constants';
import { getAllDepartments } from '../../../supabase/database';
import './SignupForm.css';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    registrationType: 'user', // 'user' or 'department_head'
    departmentId: ''
  });
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const depts = await getAllDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);
  
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
    
    if (!validateRequired(formData.displayName)) {
      newErrors.displayName = 'Name is required';
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.registrationType === 'department_head' && !formData.departmentId) {
      newErrors.departmentId = 'Please select a department';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const role = formData.registrationType === 'department_head' 
        ? ROLES.DEPARTMENT_HEAD 
        : ROLES.USER;
      
      const departmentId = formData.registrationType === 'department_head' 
        ? formData.departmentId 
        : null;

      // Register user - department heads will need admin approval
      await register(
        formData.email,
        formData.password,
        formData.displayName,
        role,
        departmentId,
        formData.registrationType === 'department_head' // pending approval for dept heads
      );

      if (formData.registrationType === 'department_head') {
        setSuccess('Registration successful! Your account is pending admin approval. You will be notified once approved.');
        // Reset form
        setFormData({
          displayName: '',
          email: '',
          password: '',
          confirmPassword: '',
          registrationType: 'user',
          departmentId: ''
        });
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Regular users can login immediately
        navigate('/login');
      }
    } catch (error) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="signup-form-card">
      <Card.Body>
        <Card.Title className="text-center mb-4">Sign Up</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Registration Type</Form.Label>
            <div>
              <Form.Check
                type="radio"
                label="Register as Authenticated User"
                name="registrationType"
                id="registration-user"
                value="user"
                checked={formData.registrationType === 'user'}
                onChange={(e) => setFormData({ ...formData, registrationType: e.target.value, departmentId: '' })}
                className="mb-2"
              />
              <Form.Check
                type="radio"
                label="Register as Department Head (Requires Admin Approval)"
                name="registrationType"
                id="registration-dept-head"
                value="department_head"
                checked={formData.registrationType === 'department_head'}
                onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
              />
            </div>
          </Form.Group>

          {formData.registrationType === 'department_head' && (
            <Form.Group className="mb-3" controlId="departmentId">
              <Form.Label>Department</Form.Label>
              <Form.Select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                isInvalid={!!errors.departmentId}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.departmentId}
              </Form.Control.Feedback>
            </Form.Group>
          )}
          <Form.Group className="mb-3" controlId="displayName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              isInvalid={!!errors.displayName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.displayName}
            </Form.Control.Feedback>
          </Form.Group>
          
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
          
          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              isInvalid={!!errors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </div>
        </Form>
        
        <div className="text-center mt-3">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SignupForm;