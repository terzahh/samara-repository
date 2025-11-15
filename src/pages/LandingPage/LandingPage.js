import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBookOpen, 
  faSearch, 
  faUsers, 
  faDownload,
  faArrowRight,
  faGraduationCap,
  faBuilding,
  faCalendarAlt,
  faEye,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { getAllResearch } from '../../supabase/database';
import { getSystemStats } from '../../supabase/database';
import AnimatedCounter from '../../components/common/AnimatedCounter/AnimatedCounter';
import ScrollReveal from '../../components/common/ScrollReveal/ScrollReveal';
import ParallaxSection from '../../components/common/ParallaxSection/ParallaxSection';
import './LandingPage.css';

const LandingPage = () => {
  const [recentUploads, setRecentUploads] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [stats, setStats] = useState({ totalResearch: 0, totalUsers: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get recent uploads
        const { research } = await getAllResearch(1, 6);
        setRecentUploads(research || []);

        // Get most viewed (for now, using recent uploads as placeholder)
        setMostViewed(research?.slice(0, 6) || []);

        // Get system stats
        const systemStats = await getSystemStats();
        setStats({
          totalResearch: systemStats.totalResearch || 0,
          totalUsers: systemStats.totalUsers || 0
        });
      } catch (error) {
        console.error('Error loading landing page data:', error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="landing-page">
      
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-particles"></div>
        </div>
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col md={6} className="hero-content">
              <ScrollReveal direction="left" delay={0}>
                <h1 className="hero-title">
                  Samara University<br />
                  <span className="gradient-text">Institutional Repository</span>
                </h1>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={200}>
                <p className="hero-subtitle">
                  A centralized platform for collecting, preserving, and disseminating the scholarly works of Samara University's academic community.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={400}>
                <div className="hero-buttons">
                  <Button as={Link} to="/browse" variant="primary" size="lg" className="me-3 btn-modern-primary">
                    Browse Research
                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                  </Button>
                  <Button as={Link} to="/login" variant="outline-light" size="lg" className="btn-modern-outline-light">
                    Login
                  </Button>
                </div>
              </ScrollReveal>
            </Col>
            <Col md={6} className="hero-image">
              <ParallaxSection speed={0.3}>
                <div className="hero-image-container">
                  <div className="hero-icon-wrapper">
                    <FontAwesomeIcon icon={faGraduationCap} className="hero-icon" />
                    <div className="icon-glow"></div>
                  </div>
                  <div className="floating-elements">
                    <div className="floating-element element-1">
                      <FontAwesomeIcon icon={faBookOpen} />
                    </div>
                    <div className="floating-element element-2">
                      <FontAwesomeIcon icon={faSearch} />
                    </div>
                    <div className="floating-element element-3">
                      <FontAwesomeIcon icon={faUsers} />
                    </div>
                  </div>
                </div>
              </ParallaxSection>
            </Col>
          </Row>
        </Container>
      </section>

      {/* About Section */}
      <section className="about-section py-5">
        <Container>
          <Row>
            <Col md={12}>
              <ScrollReveal direction="up">
                <div className="about-content glass-card">
                  <ScrollReveal direction="up" delay={100}>
                    <h2 className="section-title text-center mb-4">About the Repository</h2>
                  </ScrollReveal>
                  <ScrollReveal direction="up" delay={200}>
                    <p className="about-text">
                      The Samara University Institutional Repository serves as a comprehensive digital archive 
                      dedicated to preserving and providing open access to the intellectual output of our 
                      academic community. Our repository facilitates the discovery, dissemination, and long-term 
                      preservation of scholarly works, including theses, dissertations, research papers, and 
                      project reports produced by students, faculty, and researchers across all colleges and 
                      departments of Samara University.
                    </p>
                  </ScrollReveal>
                  <ScrollReveal direction="up" delay={300}>
                    <p className="about-text">
                      Through this platform, we aim to enhance the visibility of research conducted at our 
                      institution, promote academic collaboration, and contribute to the global knowledge base. 
                      The repository provides researchers, students, and the broader academic community with 
                      easy access to high-quality scholarly content while ensuring proper attribution and 
                      copyright protection for all contributors.
                    </p>
                  </ScrollReveal>
                  <ScrollReveal direction="up" delay={400}>
                    <div className="text-center mt-4">
                      <Button as={Link} to="/about" variant="outline-primary" size="lg" className="btn-modern-outline">
                        Learn More
                        <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                      </Button>
                    </div>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Quick Access Tiles */}
      <section className="quick-access-section py-5">
        <Container>
          <ScrollReveal direction="up">
            <h2 className="section-title text-center mb-5">Quick Access</h2>
          </ScrollReveal>
          <Row>
            <Col md={3} className="mb-4">
              <ScrollReveal direction="up" delay={0}>
                <Card className="quick-access-card modern-card h-100 text-center">
                  <Card.Body>
                    <div className="quick-access-icon mb-3">
                      <FontAwesomeIcon icon={faBuilding} />
                    </div>
                    <Card.Title as="h5">Browse by College</Card.Title>
                    <Card.Text>
                      Explore research organized by academic colleges
                    </Card.Text>
                    <Button as={Link} to="/colleges" variant="primary" size="sm" className="btn-modern-primary">
                      View Colleges
                    </Button>
                  </Card.Body>
                </Card>
              </ScrollReveal>
            </Col>
            
            <Col md={3} className="mb-4">
              <ScrollReveal direction="up" delay={100}>
                <Card className="quick-access-card modern-card h-100 text-center">
                  <Card.Body>
                    <div className="quick-access-icon mb-3">
                      <FontAwesomeIcon icon={faGraduationCap} />
                    </div>
                    <Card.Title as="h5">Browse by Department</Card.Title>
                    <Card.Text>
                      Discover research from specific departments
                    </Card.Text>
                    <Button as={Link} to="/colleges" variant="primary" size="sm" className="btn-modern-primary">
                      View Departments
                    </Button>
                  </Card.Body>
                </Card>
              </ScrollReveal>
            </Col>
            
            <Col md={3} className="mb-4">
              <ScrollReveal direction="up" delay={200}>
                <Card className="quick-access-card modern-card h-100 text-center">
                  <Card.Body>
                    <div className="quick-access-icon mb-3">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                    <Card.Title as="h5">Recent Uploads</Card.Title>
                    <Card.Text>
                      View the latest research additions
                    </Card.Text>
                    <Button as={Link} to="/browse?sort=recent" variant="primary" size="sm" className="btn-modern-primary">
                      View Recent
                    </Button>
                  </Card.Body>
                </Card>
              </ScrollReveal>
            </Col>
            
            <Col md={3} className="mb-4">
              <ScrollReveal direction="up" delay={300}>
                <Card className="quick-access-card modern-card h-100 text-center">
                  <Card.Body>
                    <div className="quick-access-icon mb-3">
                      <FontAwesomeIcon icon={faEye} />
                    </div>
                    <Card.Title as="h5">Most Viewed</Card.Title>
                    <Card.Text>
                      Explore popular research works
                    </Card.Text>
                    <Button as={Link} to="/browse?sort=popular" variant="primary" size="sm" className="btn-modern-primary">
                      View Popular
                    </Button>
                  </Card.Body>
                </Card>
              </ScrollReveal>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Highlights Section */}
      <section className="highlights-section py-5">
        <Container>
          <Row>
            <Col md={6} className="mb-4">
              <ScrollReveal direction="right" delay={0}>
                <Card className="highlights-card modern-card h-100">
                  <Card.Header as="h5" className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Most Recent Uploads
                  </Card.Header>
                  <Card.Body>
                    {recentUploads.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                        {recentUploads.slice(0, 5).map((research) => (
                          <li key={research.id} className="mb-3 pb-3 border-bottom">
                            <Link to={`/research/${research.id}`} className="text-decoration-none">
                              <h6 className="mb-1 text-primary">{research.title}</h6>
                              <p className="text-muted small mb-0">
                                {research.author} • {research.year}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">No recent uploads available.</p>
                    )}
                    <div className="mt-3">
                      <Button as={Link} to="/browse" variant="outline-primary" size="sm" className="btn-modern-outline">
                        View All
                        <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </ScrollReveal>
            </Col>
            
            <Col md={6} className="mb-4">
              <ScrollReveal direction="left" delay={200}>
                <Card className="highlights-card modern-card h-100">
                  <Card.Header as="h5" className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faEye} className="me-2" />
                    Most Viewed Works
                  </Card.Header>
                  <Card.Body>
                    {mostViewed.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                        {mostViewed.slice(0, 5).map((research) => (
                          <li key={research.id} className="mb-3 pb-3 border-bottom">
                            <Link to={`/research/${research.id}`} className="text-decoration-none">
                              <h6 className="mb-1 text-primary">{research.title}</h6>
                              <p className="text-muted small mb-0">
                                {research.author} • {research.year}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">No popular works available.</p>
                    )}
                    <div className="mt-3">
                      <Button as={Link} to="/browse?sort=popular" variant="outline-primary" size="sm" className="btn-modern-outline">
                        View All
                        <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </ScrollReveal>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Collections Button */}
      <section className="collections-section py-5">
        <Container className="text-center">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="section-title mb-4">Explore Collections</h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={200}>
            <p className="section-subtitle mb-4">
              Browse curated collections of research organized by theme, department, or research type
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={400}>
            <Button as={Link} to="/browse" variant="primary" size="lg" className="btn-modern-primary">
              <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
              View Collections
            </Button>
          </ScrollReveal>
        </Container>
      </section>
      
      <section className="features-section py-5">
        <Container>
          <ScrollReveal direction="up">
            <h2 className="section-title text-center mb-5">Key Features</h2>
          </ScrollReveal>
          <Row>
            <Col md={4} className="mb-4">
              <ScrollReveal direction="up" delay={0}>
                <Card className="feature-card modern-card h-100">
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
              </ScrollReveal>
            </Col>
            
            <Col md={4} className="mb-4">
              <ScrollReveal direction="up" delay={100}>
                <Card className="feature-card modern-card h-100">
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
              </ScrollReveal>
            </Col>
            
            <Col md={4} className="mb-4">
              <ScrollReveal direction="up" delay={200}>
                <Card className="feature-card modern-card h-100">
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
              </ScrollReveal>
            </Col>
          </Row>
        </Container>
      </section>
      
      <section className="stats-section py-5">
        <Container>
          <Row className="text-center">
            <Col md={4} className="mb-4">
              <ScrollReveal direction="scale" delay={0}>
                <div className="stat-item glass-card">
                  <h3 className="stat-number">
                    <AnimatedCounter end={stats.totalResearch} suffix="+" />
                  </h3>
                  <p className="stat-label">Research Papers</p>
                </div>
              </ScrollReveal>
            </Col>
            
            <Col md={4} className="mb-4">
              <ScrollReveal direction="scale" delay={200}>
                <div className="stat-item glass-card">
                  <h3 className="stat-number">
                    <AnimatedCounter end={stats.totalUsers} suffix="+" />
                  </h3>
                  <p className="stat-label">Users</p>
                </div>
              </ScrollReveal>
            </Col>
            
            <Col md={4} className="mb-4">
              <ScrollReveal direction="scale" delay={400}>
                <div className="stat-item glass-card">
                  <h3 className="stat-number">
                    <AnimatedCounter end={50} suffix="+" />
                  </h3>
                  <p className="stat-label">Departments</p>
                </div>
              </ScrollReveal>
            </Col>
          </Row>
        </Container>
      </section>
      
      <section className="cta-section py-5">
        <Container className="text-center">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="section-title mb-4">Get Started Today</h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={200}>
            <p className="section-subtitle mb-4">
              Join our community of researchers and scholars. Access a wealth of knowledge and contribute your own research.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={400}>
            <Button as={Link} to="/signup" variant="primary" size="lg" className="btn-modern-primary">
              Sign Up Now
              <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            </Button>
          </ScrollReveal>
        </Container>
      </section>
      
    </div>
  );
};

export default LandingPage;