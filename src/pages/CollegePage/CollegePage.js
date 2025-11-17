import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faAward, 
  faBook, 
  faGraduationCap, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
  faArrowRight,
  faBullseye,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import colleges from '../../data/collegesData';
import './CollegePage.css';

const CollegePage = () => {
  const { id } = useParams();
  const collegeId = Number(id);
  const college = colleges.find(c => c.id === collegeId);

  if (!college) {
    return (
      <Container className="py-5">
        <h2>College not found</h2>
        <p>The requested college could not be found.</p>
        <Link to="/colleges" className="btn btn-primary">Back to Colleges</Link>
      </Container>
    );
  }

  return (
    <div className="college-page">
      {/* Hero Section */}
      <div className="college-hero-section" style={{
        background: `linear-gradient(135deg, rgba(45,123,168,0.95), rgba(74,159,212,0.85))`
      }}>
        <Container className="py-5">
          <Row className="align-items-center">
            <Col md={8} className="text-white mb-4 mb-md-0">
              <h1 className="college-hero-title mb-3">{college.name}</h1>
              <p className="college-hero-subtitle mb-4">
                Excellence in Education | Research | Community Service
              </p>
              {college.contact && (
                <div className="hero-contact">
                  <span className="badge badge-light me-2">
                    <FontAwesomeIcon icon={faAward} /> Dean: {college.contact.name}
                  </span>
                </div>
              )}
            </Col>
            <Col md={4} className="text-center">
              <div className="hero-icon-box">
                <FontAwesomeIcon icon={faGraduationCap} size="4x" style={{ color: '#fff', opacity: 0.3 }} />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        {/* Description Section */}
        {college.description && (
          <Row className="mb-5">
            <Col md={10} className="mx-auto">
              <Card className="description-card shadow-lg border-0 rounded-lg animate-fade-in">
                <Card.Body className="p-4">
                  <h3 className="mb-3"><FontAwesomeIcon icon={faBook} className="me-2" style={{ color: '#2d7ba8' }} />About the College</h3>
                  <p className="description-text">{college.description}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Mission & Vision Section */}
        {(college.mission || college.vision) && (
          <Row className="mb-5">
            <Col md={5} className="mb-4">
              <Card className="mission-vision-card shadow border-0 h-100 animate-fade-in">
                <Card.Body className="p-4">
                  <div className="mission-icon mb-3">
                    <FontAwesomeIcon icon={faBullseye} size="2x" style={{ color: '#2d7ba8' }} />
                  </div>
                  <h4 className="mb-3">Mission</h4>
                  <p className="mission-text">{college.mission}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={5} className="ms-auto mb-4">
              <Card className="mission-vision-card shadow border-0 h-100 animate-fade-in">
                <Card.Body className="p-4">
                  <div className="vision-icon mb-3">
                    <FontAwesomeIcon icon={faEye} size="2x" style={{ color: '#4a9fd4' }} />
                  </div>
                  <h4 className="mb-3">Vision</h4>
                  <p className="vision-text">{college.vision}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Departments Section */}
        {college.departments && college.departments.length > 0 && (
          <Row className="mb-5">
            <Col md={12}>
              <h2 className="section-title mb-4"><FontAwesomeIcon icon={faGraduationCap} className="me-2" />Undergraduate Programs</h2>
              <Row>
                {college.departments.map((d, idx) => (
                  <Col md={6} lg={4} key={idx} className="mb-4">
                    <Card className="department-card shadow-sm border-0 h-100 department-hover">
                      <Card.Body className="p-4">
                        <Card.Title className="mb-3">{d.name}</Card.Title>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <Badge bg="primary">Undergraduate</Badge>
                          <Link to={`/browse?departmentName=${encodeURIComponent(d.name)}`} className="btn btn-sm btn-outline-primary">
                            View Research <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}

        {/* Postgraduate Section */}
        {college.postgraduate && college.postgraduate.length > 0 && (
          <Row className="mb-5">
            <Col md={12}>
              <h2 className="section-title mb-4"><FontAwesomeIcon icon={faBook} className="me-2" />Postgraduate Programs</h2>
              <div className="postgraduate-grid">
                {college.postgraduate.map((pg, idx) => (
                  <div key={idx} className="postgraduate-item p-3 rounded-lg shadow-sm border border-light">
                    <p className="mb-0 postgraduate-text">{pg}</p>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        )}

        {/* Contact Information Section */}
        {college.contact && (
          <Row className="mb-5">
            <Col md={10} className="mx-auto">
              <Card className="contact-card shadow-lg border-0 rounded-lg">
                <Card.Body className="p-4">
                  <h3 className="mb-4"><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" style={{ color: '#2d7ba8' }} />Contact Information</h3>
                  <Row>
                    <Col md={6} className="mb-3">
                      <div className="contact-info-item">
                        <p className="mb-1"><strong>Dean</strong></p>
                        <p className="contact-value">{college.contact.name}</p>
                      </div>
                      <div className="contact-info-item mt-3">
                        <p className="mb-1"><strong>Title</strong></p>
                        <p className="contact-value">{college.contact.title}</p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="contact-info-item">
                        <p className="mb-1"><FontAwesomeIcon icon={faEnvelope} className="me-2" /><strong>Email</strong></p>
                        <a href={`mailto:${college.contact.email}`} className="contact-link">
                          {college.contact.email}
                        </a>
                      </div>
                      <div className="contact-info-item mt-3">
                        <p className="mb-1"><FontAwesomeIcon icon={faPhone} className="me-2" /><strong>Phone</strong></p>
                        <p className="contact-value">{college.contact.phone}</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Action Buttons */}
        <Row className="mb-5">
          <Col md={8} className="mx-auto text-center">
            <div className="action-buttons">
              {college.website && (
                <a href={college.website} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg me-2">
                  Official Page <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                </a>
              )}
              <Link to="/colleges" className="btn btn-outline-primary btn-lg">
                Back to All Colleges
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CollegePage;
