import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faLock, 
  faFileAlt,
  faHistory,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { getAllResearch, getUserProfile, upsertUserProfile } from '../../supabase/database';
import { uploadFile } from '../../supabase/storage';
import { updateUserProfile, updateProfile } from '../../services/authService';
import { formatDate, truncateText } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, isAdmin, isDepartmentHead, isUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    avatarUrl: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userResearch, setUserResearch] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      // Load user research if department head
      if (isDepartmentHead() && user?.departmentId) {
        const { research } = await getAllResearch(1, 50, { department: user.departmentId });
        setUserResearch(research || []);
      }
      
      // Load user activities (downloads, comments, etc.)
      // This would need to be implemented in the database
      setUserActivities([]);

      // Load extended profile
      const extra = await getUserProfile(user.id).catch(() => null);
      if (extra) {
        setProfileData(prev => ({
          ...prev,
          phone: extra.phone || '',
          bio: extra.bio || '',
          avatarUrl: extra.avatar_url || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(user.id, {
        display_name: profileData.displayName
      });
      await upsertUserProfile(user.id, {
        phone: profileData.phone || null,
        bio: profileData.bio || null,
        avatar_url: profileData.avatarUrl || null
      });

      setSuccess('Profile updated successfully!');
      // Update user context would be handled by AuthContext
      window.location.reload();
    } catch (error) {
      setError(error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const path = `avatars/${user.id}_${Date.now()}_${file.name}`;
      await uploadFile(file, path);
      // Use public URL from same bucket
      const { supabase } = await import('../../supabase/supabase');
      const { data } = supabase.storage.from('research-files').getPublicUrl(path);
      const url = data.publicUrl;
      setProfileData(prev => ({ ...prev, avatarUrl: url }));
      await upsertUserProfile(user.id, { avatar_url: url });
      setSuccess('Profile image updated.');
    } catch (err) {
      setError(err.message || 'Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      // Password update would need to be implemented in the backend
      // For now, just show a message
      setSuccess('Password change functionality requires backend implementation.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <Container className="py-5">
        <Row>
          <Col md={12}>
            <h1 className="page-title mb-4">My Profile</h1>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <Card.Body className="p-0">
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                  <Nav variant="tabs" className="profile-tabs">
                    <Nav.Item>
                      <Nav.Link eventKey="profile">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Profile Information
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="password">
                        <FontAwesomeIcon icon={faLock} className="me-2" />
                        Change Password
                      </Nav.Link>
                    </Nav.Item>
                    {!isUser() && (
                      <Nav.Item>
                        <Nav.Link eventKey="uploads">
                          <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                          My Uploads
                        </Nav.Link>
                      </Nav.Item>
                    )}
                    {isUser() && (
                      <Nav.Item>
                        <Nav.Link eventKey="activities">
                          <FontAwesomeIcon icon={faHistory} className="me-2" />
                          My Activities
                        </Nav.Link>
                      </Nav.Item>
                    )}
                  </Nav>

                  <Tab.Content className="p-4">
                    {/* Profile Information Tab */}
                    <Tab.Pane eventKey="profile">
                      {error && <Alert variant="danger">{error}</Alert>}
                      {success && <Alert variant="success">{success}</Alert>}
                      
                      <Form onSubmit={handleProfileUpdate}>
                        <Row className="mb-3">
                          <Col md={12}>
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={profileData.avatarUrl || 'https://via.placeholder.com/96x96?text=Avatar'}
                                alt="avatar"
                                style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <Form.Label className="mb-1">Profile Image</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} />
                                <Form.Text className="text-muted">PNG/JPG up to ~2MB</Form.Text>
                              </div>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Full Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.displayName}
                                onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                required
                              />
                            </Form.Group>
                          </Col>
                          
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                type="email"
                                value={profileData.email}
                                disabled
                              />
                              <Form.Text className="text-muted">
                                Email cannot be changed
                              </Form.Text>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Phone</Form.Label>
                              <Form.Control
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                placeholder="+251-xxx-xxx-xxxx"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Role</Form.Label>
                              <Form.Control
                                type="text"
                                value={user?.role || 'user'}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Bio</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                          />
                        </Form.Group>

                        {user?.departmentName && (
                          <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                            <Form.Control
                              type="text"
                              value={user.departmentName}
                              disabled
                            />
                          </Form.Group>
                        )}

                        <Button variant="primary" type="submit" disabled={loading}>
                          {loading ? 'Updating...' : 'Update Profile'}
                        </Button>
                      </Form>
                    </Tab.Pane>

                    {/* Change Password Tab */}
                    <Tab.Pane eventKey="password">
                      {error && <Alert variant="danger">{error}</Alert>}
                      {success && <Alert variant="success">{success}</Alert>}
                      
                      <Form onSubmit={handlePasswordChange}>
                        <Form.Group className="mb-3">
                          <Form.Label>Current Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            required
                          />
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={loading}>
                          {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                      </Form>
                    </Tab.Pane>

                    {/* My Uploads Tab (for Department Heads) */}
                    {!isUser() && (
                      <Tab.Pane eventKey="uploads">
                        <h4>My Uploaded Research</h4>
                        {userResearch.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th>Title</th>
                                  <th>Author</th>
                                  <th>Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {userResearch.map((research) => (
                                  <tr key={research.id}>
                                    <td>
                                      <Link to={`/research/${research.id}`}>
                                        {truncateText(research.title, 50)}
                                      </Link>
                                    </td>
                                    <td>{research.author}</td>
                                    <td>{formatDate(research.created_at)}</td>
                                    <td>
                                      <Link 
                                        to={`/research/${research.id}`}
                                        className="btn btn-sm btn-outline-primary"
                                      >
                                        View
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-muted">No research uploaded yet.</p>
                        )}
                      </Tab.Pane>
                    )}

                    {/* My Activities Tab (for Users) */}
                    {isUser() && (
                      <Tab.Pane eventKey="activities">
                        <h4>My Activities</h4>
                        {userActivities.length > 0 ? (
                          <ul className="list-unstyled">
                            {userActivities.map((activity, index) => (
                              <li key={index} className="activity-item mb-3 p-3 border rounded">
                                {activity.description}
                                <span className="text-muted small ms-2">
                                  {formatDate(activity.date)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">No activities recorded yet.</p>
                        )}
                      </Tab.Pane>
                    )}
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;

