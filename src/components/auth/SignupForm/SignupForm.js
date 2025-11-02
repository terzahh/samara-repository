import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { register } from '../../../services/authService';
import { validateEmail, validatePassword, validateRequired } from '../../../utils/validators';
import { ROLES } from '../../../utils/constants';
import { getAllDepartments } from '../../../supabase/database';
import './SignupForm.css';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.USER,
    departmentId: ''
  });
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsData = await getAllDepartments();
        setDepartments(departmentsData);
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
    
    if (formData.role === ROLES.DEPARTMENT_HEAD && !formData.departmentId) {
      newErrors.departmentId = 'Department is required for Department Heads';
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
      await register(
        formData.email,
        formData.password,
        formData.displayName,
        formData.role
      );
      
      // If department head, update department
      if (formData.role === ROLES.DEPARTMENT_HEAD && formData.departmentId) {
        const { updateProfile } = await import('../../../services/authService');
        // This would need to be implemented in the auth service
        // For now, we'll just show a success message
      }
      
      // Redirect will be handled by the AuthContext
      window.location.href = '/';
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
        
        <Form onSubmit={handleSubmit}>
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
          
          <Form.Group className="mb-3" controlId="role">
            <Form.Label>Account Type</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value={ROLES.USER}>Student/Researcher</option>
              <option value={ROLES.DEPARTMENT_HEAD}>Department Head</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Note: Admin accounts are created by system administrators.
            </Form.Text>
          </Form.Group>
          
          {formData.role === ROLES.DEPARTMENT_HEAD && (
            <Form.Group className="mb-4" controlId="departmentId">
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