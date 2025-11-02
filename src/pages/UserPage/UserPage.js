import React from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import UserDashboard from '../../components/user/UserDashboard/UserDashboard';
import UserProfile from '../../components/user/UserProfile/UserProfile';
import ProtectedRoute from '../../components/common/ProtectedRoute/ProtectedRoute';
import { ROLES } from '../../utils/constants';
import './UserPage.css';

const UserPage = () => {
  return (
    <div className="user-page">
      <Header />
      
      <main className="user-main">
        <ProtectedRoute requiredRole={ROLES.USER}>
          <Container fluid className="p-0">
            <Tab.Container id="user-tabs" defaultActiveKey="dashboard">
              <Row className="g-0">
                <Col md={2} className="user-sidebar">
                  <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                      <Nav.Link eventKey="dashboard">Dashboard</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="profile">Profile</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col md={10} className="user-content">
                  <Tab.Content>
                    <Tab.Pane eventKey="dashboard">
                      <UserDashboard />
                    </Tab.Pane>
                    <Tab.Pane eventKey="profile">
                      <Container>
                        <UserProfile />
                      </Container>
                    </Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </Container>
        </ProtectedRoute>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserPage;