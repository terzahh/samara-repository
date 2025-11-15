import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Form, Badge, Alert, InputGroup, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faKey, faCopy } from '@fortawesome/free-solid-svg-icons';
import { getUsers, changeUserRole } from '../../../services/userService';
import { getAllRoles, getAllDepartments } from '../../../supabase/database';
import { getRoleLabel } from '../../../utils/helpers';
import { registerUser, adminResetUserPassword, adminGenerateResetLink } from '../../../supabase/customAuth';
import { validateEmail, validatePassword, validateRequired } from '../../../utils/validators';
import Loading from '../../common/Loading/Loading';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showResetLinkModal, setShowResetLinkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [resetLink, setResetLink] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'user',
    departmentId: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersList = await getUsers();
        const rolesList = await getAllRoles();
        const departmentsList = await getAllDepartments();
        setUsers(usersList);
        setRoles(rolesList);
        setDepartments(departmentsList);
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

  const filteredUsers = useMemo(() => {
    const term = searchText.toLowerCase().trim();
    return users.filter(u => {
      const roleMatch = roleFilter === 'all' || u.roles?.name === roleFilter;
      const deptMatch = departmentFilter === 'all' || (u.departments?.id === departmentFilter || u.departments?.name === departmentFilter);
      const textMatch = !term || [u.display_name, u.email, u.departments?.name].some(v => (v || '').toLowerCase().includes(term));
      return roleMatch && deptMatch && textMatch;
    });
  }, [users, searchText, roleFilter, departmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const toggleSelectAllOnPage = (checked) => {
    const next = new Set(selectedUserIds);
    if (checked) {
      pagedUsers.forEach(u => next.add(u.id));
    } else {
      pagedUsers.forEach(u => next.delete(u.id));
    }
    setSelectedUserIds(next);
  };

  const toggleSelectOne = (userId, checked) => {
    const next = new Set(selectedUserIds);
    if (checked) next.add(userId); else next.delete(userId);
    setSelectedUserIds(next);
  };

  const bulkChangeRole = async (targetRoleName) => {
    if (!targetRoleName) return;
    try {
      setLoading(true);
      const ids = Array.from(selectedUserIds);
      for (const id of ids) {
        await changeUserRole(id, targetRoleName);
      }
      const usersList = await getUsers();
      setUsers(usersList);
      setSuccess(`Updated role for ${ids.length} user(s) to ${getRoleLabel(targetRoleName)}.`);
      setSelectedUserIds(new Set());
    } catch (e) {
      setError(e.message || 'Bulk role update failed.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveChanges = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await changeUserRole(selectedUser.id, newRole);
      
      // Refresh users list
      const usersList = await getUsers();
      setUsers(usersList);
      
      setSuccess(`User role updated successfully to ${getRoleLabel(newRole)}`);
      setShowEditModal(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role. Please try again.');
    }
  };

  const handleAddUser = () => {
    setShowAddModal(true);
    setNewUser({
      displayName: '',
      email: '',
      password: '',
      role: 'user',
      departmentId: ''
    });
    setErrors({});
    setError('');
    setSuccess('');
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateNewUser = () => {
    const newErrors = {};
    
    if (!validateRequired(newUser.displayName)) {
      newErrors.displayName = 'Name is required';
    }
    
    if (!validateEmail(newUser.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!validatePassword(newUser.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (newUser.role === 'department_head' && !newUser.departmentId) {
      newErrors.departmentId = 'Department is required for Department Heads';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateNewUser()) return;
    
    try {
      // Store admin session before creating user (registerUser will create a session for the new user)
      const adminUser = JSON.parse(localStorage.getItem('user') || 'null');
      const adminToken = localStorage.getItem('auth_token');
      
      // Create user using registerUser
      const createdUser = await registerUser(
        newUser.email,
        newUser.password,
        newUser.displayName,
        newUser.role
      );
      
      // Restore admin session after user creation
      if (adminUser && adminUser.id !== createdUser.id) {
        localStorage.setItem('user', JSON.stringify(adminUser));
        if (adminToken) {
          localStorage.setItem('auth_token', adminToken);
        }
      }
      
      // If department head, update department
      if (newUser.role === 'department_head' && newUser.departmentId && createdUser.id) {
        const { updateUserProfile } = await import('../../../supabase/customAuth');
        await updateUserProfile(createdUser.id, { department_id: newUser.departmentId });
      }
      
      // Refresh users list
      const usersList = await getUsers();
      setUsers(usersList);
      
      setSuccess('User created successfully!');
      setShowAddModal(false);
      setNewUser({
        displayName: '',
        email: '',
        password: '',
        role: 'user',
        departmentId: ''
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message || 'Failed to create user. Please try again.');
    }
  };
  
  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setResetPasswordData({ newPassword: '', confirmPassword: '' });
    setShowResetPasswordModal(true);
    setError('');
    setSuccess('');
  };

  const handleGenerateResetLink = async (user) => {
    try {
      setLoading(true);
      setError('');
      const result = await adminGenerateResetLink(user.id);
      setResetLink(result.resetLink);
      setSelectedUser(user);
      setShowResetLinkModal(true);
      console.log('🔗 Admin Generated Reset Link:', result.resetLink);
      console.log('📧 For user:', result.email);
      console.log('⏰ Expires at:', new Date(result.expiresAt).toLocaleString());
    } catch (error) {
      console.error('Error generating reset link:', error);
      setError(error.message || 'Failed to generate reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewPassword = async () => {
    if (!selectedUser) return;

    // Validate passwords
    if (!resetPasswordData.newPassword || resetPasswordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await adminResetUserPassword(selectedUser.id, resetPasswordData.newPassword);
      setSuccess(`Password reset successfully for ${selectedUser.display_name}`);
      setShowResetPasswordModal(false);
      setResetPasswordData({ newPassword: '', confirmPassword: '' });
      setSelectedUser(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    }
  };

  const copyResetLink = () => {
    navigator.clipboard.writeText(resetLink).then(() => {
      setSuccess('Reset link copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }).catch(() => {
      setError('Failed to copy link. Please copy manually.');
    });
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
      
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h3 className="mb-0">User Management</h3>
        <div className="d-flex flex-wrap gap-2">
          <InputGroup>
            <Form.Control
              placeholder="Search name, email, department"
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
            />
          </InputGroup>
          <Form.Select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            style={{ minWidth: 160 }}
          >
            <option value="all">All Roles</option>
            {roles.map(r => <option key={r.id} value={r.name}>{getRoleLabel(r.name)}</option>)}
          </Form.Select>
          <Form.Select
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
            style={{ minWidth: 200 }}
          >
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Form.Select>
          <Button variant="primary" onClick={handleAddUser}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <Form.Check
            type="checkbox"
            label="Select page"
            onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
            checked={pagedUsers.length > 0 && pagedUsers.every(u => selectedUserIds.has(u.id))}
            disabled={pagedUsers.length === 0}
          />
          <Form.Select
            size="sm"
            style={{ width: 220 }}
            onChange={(e) => e.target.value && bulkChangeRole(e.target.value)}
            defaultValue=""
            disabled={selectedUserIds.size === 0}
          >
            <option value="">Bulk change role...</option>
            {roles.map(r => <option key={r.id} value={r.name}>{getRoleLabel(r.name)}</option>)}
          </Form.Select>
        </div>
        <div className="text-muted small">
          {filteredUsers.length} result(s)
        </div>
      </div>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th style={{ width: 36 }}></th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pagedUsers.map(user => (
            <tr key={user.id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedUserIds.has(user.id)}
                  onChange={(e) => toggleSelectOne(user.id, e.target.checked)}
                />
              </td>
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
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => handleEditUser(user)}
                    title="Edit Role"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button 
                    variant="outline-warning" 
                    size="sm" 
                    onClick={() => handleResetPassword(user)}
                    title="Reset Password"
                  >
                    <FontAwesomeIcon icon={faKey} />
                  </Button>
                  <Button 
                    variant="outline-info" 
                    size="sm" 
                    onClick={() => handleGenerateResetLink(user)}
                    title="Generate Reset Link"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center my-3">
          <Pagination>
            <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>
                {p}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
          </Pagination>
        </div>
      )}
      
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

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                name="displayName"
                value={newUser.displayName}
                onChange={handleNewUserChange}
                isInvalid={!!errors.displayName}
                placeholder="Enter full name"
              />
              <Form.Control.Feedback type="invalid">
                {errors.displayName}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                isInvalid={!!errors.email}
                placeholder="Enter email address"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleNewUserChange}
                isInvalid={!!errors.password}
                placeholder="Enter password (min 6 characters)"
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role *</Form.Label>
              <Form.Select
                name="role"
                value={newUser.role}
                onChange={handleNewUserChange}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {getRoleLabel(role.name)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {newUser.role === 'department_head' && (
              <Form.Group className="mb-3">
                <Form.Label>Department *</Form.Label>
                <Form.Select
                  name="departmentId"
                  value={newUser.departmentId}
                  onChange={handleNewUserChange}
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateUser}>
            Create User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reset Password Modal */}
      <Modal show={showResetPasswordModal} onHide={() => setShowResetPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset User Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Alert variant="info" className="mb-3">
                Resetting password for: <strong>{selectedUser.display_name}</strong> ({selectedUser.email})
              </Alert>
              
              <Form.Group className="mb-3">
                <Form.Label>New Password *</Form.Label>
                <Form.Control
                  type="password"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password (min 6 characters)"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password *</Form.Label>
                <Form.Control
                  type="password"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </Form.Group>

              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetPasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveNewPassword}>
            Reset Password
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reset Link Modal */}
      <Modal show={showResetLinkModal} onHide={() => setShowResetLinkModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Password Reset Link Generated</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && resetLink && (
            <div>
              <Alert variant="success">
                <strong>Reset link generated for:</strong> {selectedUser.display_name} ({selectedUser.email})
              </Alert>
              
              <Form.Group className="mb-3">
                <Form.Label>Reset Link</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={resetLink}
                    readOnly
                    className="font-monospace"
                  />
                  <Button variant="outline-secondary" onClick={copyResetLink}>
                    <FontAwesomeIcon icon={faCopy} /> Copy
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  Share this link with the user. It will expire in 1 hour.
                </Form.Text>
              </Form.Group>

              <Alert variant="info">
                <strong>Instructions:</strong>
                <ol className="mb-0 mt-2">
                  <li>Copy the reset link above</li>
                  <li>Share it with the user via email or other secure method</li>
                  <li>The user can click the link to reset their password</li>
                  <li>The link expires in 1 hour</li>
                </ol>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetLinkModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;