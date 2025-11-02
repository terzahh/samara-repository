import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBookOpen, 
  faSearch, 
  faUsers, 
  faDownload,
  faArrowRight,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="hero-content">
              <h1 className="hero-title">Samara University Institutional Repository</h1>
              <p className="hero-subtitle">
                A centralized platform for collecting, preserving, and disseminating the scholarly works of Samara University's academic community.
              </p>
              <div className="hero-buttons">
                <Button as={Link} to="/browse" variant="primary" size="lg" className="me-3">
                  Browse Research
                  <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="lg">
                  Login
                </Button>
              </div>
            </Col>
            <Col md={6} className="hero-image">
              <div className="hero-image-container">
                <FontAwesomeIcon icon={faGraduationCap} className="hero-icon" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      
      <section className="features-section py-5">
        <Container>
          <h2 className="section-title text-center mb-5">Key Features</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon mb-3">
                    <FontAwesomeIcon icon={faBookOpen} />
                  </div>
                  <Card.Title as="h4">Centralized Repository</Card.Title>
                  <Card.Text>
                    Access all research papers, theses, dissertations, and project reports in one centralized platform.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon mb-3">
                    <FontAwesomeIcon icon={faSearch} />
                  </div>
                  <Card.Title as="h4">Advanced Search</Card.Title>
                  <Card.Text>
                    Find research quickly with our advanced search and filtering capabilities.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon mb-3">
                    <FontAwesomeIcon icon={faDownload} />
                  </div>
                  <Card.Title as="h4">Easy Downloads</Card.Title>
                  <Card.Text>
                    Download research papers in various formats for offline reading and reference.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      <section className="stats-section py-5">
        <Container>
          <Row className="text-center">
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h3 className="stat-number">500+</h3>
                <p className="stat-label">Research Papers</p>
              </div>
            </Col>
            
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h3 className="stat-number">1000+</h3>
                <p className="stat-label">Users</p>
              </div>
            </Col>
            
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h3 className="stat-number">50+</h3>
                <p className="stat-label">Departments</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      
      <section className="cta-section py-5">
        <Container className="text-center">
          <h2 className="section-title mb-4">Get Started Today</h2>
          <p className="section-subtitle mb-4">
            Join our community of researchers and scholars. Access a wealth of knowledge and contribute your own research.
          </p>
          <Button as={Link} to="/signup" variant="primary" size="lg">
            Sign Up Now
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </Button>
        </Container>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage;