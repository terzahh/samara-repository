import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { getUsers, changeUserRole } from '../../../services/userService';
import { getAllRoles } from '../../../supabase/database';
import { getRoleLabel } from '../../../utils/helpers';
import Loading from '../../common/Loading/Loading';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersList = await getUsers();
        const rolesList = await getAllRoles();
        setUsers(usersList);
        setRoles(rolesList);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewRole(user.roles.name);
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };
  
  const handleSaveChanges = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await changeUserRole(selectedUser.id, newRole);
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { 
                ...user, 
                roles: { ...user.roles, name: newRole } 
              } 
            : user
        )
      );
      
      setSuccess(`User role updated successfully to ${getRoleLabel(newRole)}`);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role. Please try again.');
    }
  };
  
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'department_head':
        return 'warning';
      case 'user':
        return 'info';
      default:
        return 'secondary';
    }
  };
  
  if (loading) {
    return <Loading message="Loading users..." />;
  }
  
  return (
    <div className="user-management">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>User Management</h3>
      </div>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.display_name}</td>
              <td>{user.email}</td>
              <td>
                <Badge bg={getRoleBadgeVariant(user.roles.name)}>
                  {getRoleLabel(user.roles.name)}
                </Badge>
              </td>
              <td>{user.departments?.name || 'N/A'}</td>
              <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
              <td>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => handleEditUser(user)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>User</Form.Label>
                <Form.Control
                  type="text"
                  value={`${selectedUser.display_name} (${selectedUser.email})`}
                  disabled
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;