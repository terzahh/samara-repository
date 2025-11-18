import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
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
import { getAllResearch } from '../../supabase/database';
import './CollegePage.css';

const CollegePage = () => {
  const { id } = useParams();
  const collegeId = Number(id);
  const college = colleges.find(c => c.id === collegeId);

  const [allResearch, setAllResearch] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all'); // all | undergraduate | postgraduate
  const [selectedYear, setSelectedYear] = useState('all'); // 'all' or numeric year
  const [availableYears, setAvailableYears] = useState([]);
  const [displayedResearch, setDisplayedResearch] = useState([]);

  useEffect(() => {
    // load a large page to get all research for filtering on this page
    const fetch = async () => {
      try {
        const { research } = await getAllResearch(1, 1000, {});
        setAllResearch(research || []);
      } catch (e) {
        console.error('Failed to load research for college page', e);
        setAllResearch([]);
      }
    };
    fetch();
  }, [collegeId]);

  // compute available years and displayedResearch whenever filters change
  useEffect(() => {
    // filter by department if selected, else include all departments in this college
    const deptNames = college.departments ? college.departments.map(d => d.name) : [];

    let filtered = allResearch.filter(r => {
      // r.departments may be an object { name: '...' } or array; handle both
      const rDeptName = r.departments?.name || (Array.isArray(r.departments) ? r.departments[0]?.name : null);
      // match only research that belongs to one of this college's departments
      const inCollege = deptNames.length === 0 ? true : deptNames.includes(rDeptName);
      if (!inCollege) return false;
      // if a department is selected, only include those research items
      if (selectedDepartment && rDeptName !== selectedDepartment) return false;
      // level filtering placeholder: currently no explicit level field on research; kept for UI
      // if selectedLevel is not 'all', we could map types to level if applicable
      return true;
    });

    // derive years
    const yearsSet = new Set();
    filtered.forEach(r => {
      const y = r.year || (r.created_at ? new Date(r.created_at).getFullYear() : null);
      if (y) yearsSet.add(y);
    });
    const years = Array.from(yearsSet).sort((a,b) => b - a);
    setAvailableYears(years);

    // apply year filter
    let byYear = filtered;
    if (selectedYear && selectedYear !== 'all') {
      byYear = filtered.filter(r => {
        const y = r.year || (r.created_at ? new Date(r.created_at).getFullYear() : null);
        return String(y) === String(selectedYear);
      });
    }

    setDisplayedResearch(byYear);
  }, [allResearch, college, selectedDepartment, selectedLevel, selectedYear]);

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

        {/* Departments Section - interactive */}
        {college.departments && college.departments.length > 0 && (
          <Row className="mb-5">
            <Col md={12}>
              <h2 className="section-title mb-4"><FontAwesomeIcon icon={faGraduationCap} className="me-2" />Departments</h2>
              <Row className="mb-3">
                {college.departments.map((d, idx) => (
                  <Col md={6} lg={4} key={idx} className="mb-3">
                    <Card
                      onClick={() => { setSelectedDepartment(d.name); setSelectedYear('all'); }}
                      className={`department-card shadow-sm border-0 h-100 department-hover ${selectedDepartment === d.name ? 'selected-department' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body className="p-3">
                        <Card.Title className="mb-1">{d.name}</Card.Title>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <Badge bg="primary">Undergraduate</Badge>
                          <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); setSelectedDepartment(d.name); setSelectedYear('all'); }}>
                            View <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Level selector */}
              <div className="mb-4">
                <Button variant={selectedLevel === 'all' ? 'primary' : 'outline-primary'} size="sm" className="me-2" onClick={() => setSelectedLevel('all')}>All Levels</Button>
                <Button variant={selectedLevel === 'undergraduate' ? 'primary' : 'outline-primary'} size="sm" className="me-2" onClick={() => setSelectedLevel('undergraduate')}>Undergraduate</Button>
                <Button variant={selectedLevel === 'postgraduate' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setSelectedLevel('postgraduate')}>Postgraduate</Button>
              </div>

              {/* Years filter */}
              <div className="mb-3">
                <span className="me-2">Filter by year:</span>
                <Button size="sm" variant={selectedYear === 'all' ? 'primary' : 'outline-secondary'} className="me-2" onClick={() => setSelectedYear('all')}>All</Button>
                {availableYears.length === 0 && <span className="text-muted">No publications found</span>}
                {availableYears.map((y) => (
                  <Button key={y} size="sm" variant={String(selectedYear) === String(y) ? 'primary' : 'outline-secondary'} className="me-2 mb-2" onClick={() => setSelectedYear(y)}>{y}</Button>
                ))}
              </div>

              {/* Research list for selected filters */}
              <div>
                {selectedDepartment ? (
                  <div>
                    <h5 className="mb-3">Showing research for <strong>{selectedDepartment}</strong> {selectedYear !== 'all' ? ` — ${selectedYear}` : ''}</h5>
                    {displayedResearch.length === 0 ? (
                      <p className="text-muted">No research files found for the selected filters.</p>
                    ) : (
                      <Row>
                        {displayedResearch.map((r) => (
                          <Col md={6} lg={4} key={r.id} className="mb-3">
                            <Card className="shadow-sm h-100">
                              <Card.Body>
                                <Card.Title className="mb-2">{r.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{r.author} — {r.year || (r.created_at ? new Date(r.created_at).getFullYear() : '')}</Card.Subtitle>
                                <p className="mb-2 text-truncate" style={{ maxHeight: '3.6rem' }}>{r.abstract}</p>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                  <Link to={`/research/${r.id}`} className="btn btn-sm btn-outline-primary">Open</Link>
                                  <small className="text-muted">{r.type}</small>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </div>
                ) : (
                  <p className="text-muted">Select a department above to view publications grouped by year.</p>
                )}
              </div>
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
