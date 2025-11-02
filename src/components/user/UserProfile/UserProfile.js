import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../hooks/useAuth';
import { updateProfile } from '../../../services/authService';
import { getAllDepartments } from '../../../supabase/database';
import Loading from '../../common/Loading/Loading';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    display_name: user?.user_metadata?.display_name || '',
    email: user?.email || ''
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
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
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateProfile(user.id, {
        display_name: formData.display_name
      });
      
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="user-profile">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>My Profile</h3>
      </div>
      
      <Card className="profile-card">
        <Card.Header as="h5">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          Profile Information
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="display_name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
              <Form.Text className="text-muted">
                Email address cannot be changed.
              </Form.Text>
            </Form.Group>
            
            <Button variant="primary" type="submit" disabled={loading}>
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserProfile;