import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { supabaseForCustomAuth } from '../../../supabase/supabase';
import Loading from '../../common/Loading/Loading';
import { formatDate } from '../../../utils/helpers';
import './PendingApprovals.css';

const PendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [action, setAction] = useState(''); // 'approve' or 'reject'

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      // First get department_head role ID
      const { data: roleData, error: roleError } = await supabaseForCustomAuth
        .from('roles')
        .select('id')
        .eq('name', 'department_head')
        .single();

      if (roleError) throw roleError;

      // Try to get users with approved = false
      // If approved column doesn't exist, this will return an empty array
      const { data, error: fetchError } = await supabaseForCustomAuth
        .from('users')
        .select(`
          id,
          email,
          display_name,
          created_at,
          department_id,
          roles(name),
          departments(name)
        `)
        .eq('role_id', roleData.id);

      if (fetchError) {
        // If error is due to approved column not existing, show message
        if (fetchError.code === '42703') {
          setError('The approved column does not exist in the database. Please run the ADD_APPROVED_COLUMN.sql migration.');
          setPendingUsers([]);
          return;
        }
        throw fetchError;
      }

      // Filter for users where approved = false (if column exists)
      // If column doesn't exist, we'll get all department heads, so filter by trying to check approved
      let pendingUsers = [];
      if (data && data.length > 0) {
        for (const user of data) {
          try {
            const { data: userApproved, error: approvedError } = await supabaseForCustomAuth
              .from('users')
              .select('approved')
              .eq('id', user.id)
              .maybeSingle();
            
            // If column doesn't exist, break and show message
            if (approvedError && approvedError.code === '42703') {
              setError('The approved column does not exist in the database. Please run the ADD_APPROVED_COLUMN.sql migration.');
              setPendingUsers([]);
              return;
            }
            
            // If approved is false, add to pending list
            if (userApproved && userApproved.approved === false) {
              pendingUsers.push(user);
            }
          } catch (e) {
            // Skip this user if we can't check approval status
            console.warn('Could not check approval status for user:', user.id);
          }
        }
      }
      
      setPendingUsers(pendingUsers);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setError('Failed to fetch pending approvals.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (user) => {
    setSelectedUser(user);
    setAction('approve');
    setShowConfirmModal(true);
  };

  const handleReject = (user) => {
    setSelectedUser(user);
    setAction('reject');
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      if (action === 'approve') {
        // Update user to approved
        const { error: updateError } = await supabaseForCustomAuth
          .from('users')
          .update({ approved: true })
          .eq('id', selectedUser.id);

        if (updateError) {
          // If error is due to approved column not existing
          if (updateError.code === '42703') {
            setError('The approved column does not exist in the database. Please run the ADD_APPROVED_COLUMN.sql migration.');
          } else {
            throw updateError;
          }
          setShowConfirmModal(false);
          return;
        }
        setSuccess(`Department head ${selectedUser.display_name} has been approved.`);
      } else if (action === 'reject') {
        // Delete user (or mark as rejected)
        const { error: deleteError } = await supabaseForCustomAuth
          .from('users')
          .delete()
          .eq('id', selectedUser.id);

        if (deleteError) throw deleteError;
        setSuccess(`Department head registration for ${selectedUser.display_name} has been rejected and removed.`);
      }

      setShowConfirmModal(false);
      setSelectedUser(null);
      setAction('');
      fetchPendingUsers();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error processing approval:', error);
      setError(`Failed to ${action} user. Please try again.`);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return <Loading message="Loading pending approvals..." />;
  }

  return (
    <div className="pending-approvals">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Pending Department Head Approvals</h3>
        <Badge bg="warning" className="fs-6">
          {pendingUsers.length} Pending
        </Badge>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {pendingUsers.length === 0 ? (
        <Alert variant="info">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          No pending approvals at this time.
        </Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.display_name}</td>
                <td>{user.email}</td>
                <td>{user.departments?.name || 'N/A'}</td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleApprove(user)}
                  >
                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(user)}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {action === 'approve' ? 'Approve Department Head' : 'Reject Department Head'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to {action === 'approve' ? 'approve' : 'reject'} the registration 
            for <strong>{selectedUser?.display_name}</strong> ({selectedUser?.email})?
          </p>
          {action === 'reject' && (
            <Alert variant="warning">
              This action will permanently delete the user account. This cannot be undone.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant={action === 'approve' ? 'success' : 'danger'}
            onClick={confirmAction}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PendingApprovals;

