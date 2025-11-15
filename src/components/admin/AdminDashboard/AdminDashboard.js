import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faChartBar, 
  faCog, 
  faDatabase,
  faFileAlt,
  faComments,
  faUserCheck,
  faUserTimes
} from '@fortawesome/free-solid-svg-icons';
import UserManagement from '../UserManagement/UserManagement';
import Reports from '../Reports/Reports';
import Settings from '../Settings/Settings';
import Backup from '../Backup/Backup';
import PendingApprovals from '../PendingApprovals/PendingApprovals';
import { getSystemStats } from '../../../supabase/database';
import { formatFileSize } from '../../../utils/helpers';
import Loading from '../../common/Loading/Loading';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalResearch: 0,
    totalUsers: 0,
    adminCount: 0,
    departmentHeadCount: 0,
    userCount: 0,
    thesisCount: 0,
    dissertationCount: 0,
    researchPaperCount: 0,
    conferencePaperCount: 0,
    projectReportCount: 0,
    publicResearchCount: 0,
    restrictedResearchCount: 0,
    commentCount: 0,
    storageSizeBytes: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const systemStats = await getSystemStats();
        setStats(systemStats);
      } catch (error) {
        console.error('Error fetching system stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }
  
  return (
    <Container fluid className="admin-dashboard">
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="text-muted">Manage users, content, and system settings</p>
      </div>
      
      <Tab.Container id="admin-tabs" defaultActiveKey="users">
        <Row>
          <Col md={3} className="mb-3">
            <Card className="admin-sidebar">
              <Card.Header as="h5">Navigation</Card.Header>
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column admin-nav-vertical">
                  <Nav.Item>
                    <Nav.Link eventKey="users">
                      <FontAwesomeIcon icon={faUsers} className="me-2" />
                      User Management
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="approvals">
                      <FontAwesomeIcon icon={faUserCheck} className="me-2" />
                      Pending Approvals
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="reports">
                      <FontAwesomeIcon icon={faChartBar} className="me-2" />
                      Reports
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="settings">
                      <FontAwesomeIcon icon={faCog} className="me-2" />
                      Settings
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="backup">
                      <FontAwesomeIcon icon={faDatabase} className="me-2" />
                      Backup & Restore
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          <Col md={9}>
            <Card>
              <Card.Header as="h5">Management</Card.Header>
              <Card.Body className="p-0">
                <Tab.Content className="p-4">
                  <Tab.Pane eventKey="users">
                    <UserManagement />
                  </Tab.Pane>
                  <Tab.Pane eventKey="approvals">
                    <PendingApprovals />
                  </Tab.Pane>
                  <Tab.Pane eventKey="reports">
                    <Reports />
                  </Tab.Pane>
                  <Tab.Pane eventKey="settings">
                    <Settings />
                  </Tab.Pane>
                  <Tab.Pane eventKey="backup">
                    <Backup />
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Tab.Container>
      
      <Row className="stats-cards mb-4 mt-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <FontAwesomeIcon icon={faFileAlt} />
              </div>
              <div>
                <h3 className="stat-number">{stats.totalResearch}</h3>
                <p className="stat-label">Total Research</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div>
                <h3 className="stat-number">{stats.totalUsers}</h3>
                <p className="stat-label">Total Users</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <FontAwesomeIcon icon={faComments} />
              </div>
              <div>
                <h3 className="stat-number">{stats.commentCount || 0}</h3>
                <p className="stat-label">Comments</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <FontAwesomeIcon icon={faDatabase} />
              </div>
              <div>
                <h3 className="stat-number">
                  {stats.storageSizeBytes > 0 
                    ? formatFileSize(stats.storageSizeBytes)
                    : '0 GB'}
                </h3>
                <p className="stat-label">Storage Used</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="research-stats mb-4">
        <Col md={12}>
          <Card>
            <Card.Header as="h5">Research by Type</Card.Header>
            <Card.Body>
              <Row>
                <Col md={2} className="text-center mb-3">
                  <h4 className="research-type-count">{stats.thesisCount}</h4>
                  <p className="research-type-label">Theses</p>
                </Col>
                <Col md={2} className="text-center mb-3">
                  <h4 className="research-type-count">{stats.dissertationCount}</h4>
                  <p className="research-type-label">Dissertations</p>
                </Col>
                <Col md={2} className="text-center mb-3">
                  <h4 className="research-type-count">{stats.researchPaperCount}</h4>
                  <p className="research-type-label">Research Papers</p>
                </Col>
                <Col md={2} className="text-center mb-3">
                  <h4 className="research-type-count">{stats.conferencePaperCount}</h4>
                  <p className="research-type-label">Conference Papers</p>
                </Col>
                <Col md={2} className="text-center mb-3">
                  <h4 className="research-type-count">{stats.projectReportCount}</h4>
                  <p className="research-type-label">Project Reports</p>
                </Col>
                <Col md={2} className="text-center mb-3">
                  <h4 className="research-type-count">{stats.publicResearchCount}</h4>
                  <p className="research-type-label">Public</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;