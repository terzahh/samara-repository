import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAward,
  faBook,
  faBookOpen,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faArrowRight,
  faBullseye,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import colleges from '../../data/collegesData';
import ResearchCard from '../../components/research/ResearchCard/ResearchCard';
import { getAllResearch } from '../../supabase/database';
import { getResearchLevel } from '../../utils/helpers';
import './CollegePage.css';

const CollegePage = () => {
  const { id } = useParams();
  const collegeId = Number(id);
  const college = colleges.find(c => c.id === collegeId);

  const [allResearch, setAllResearch] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null); // null | 'undergraduate' | 'postgraduate'
  const [selectedYear, setSelectedYear] = useState('all'); // 'all' or numeric year
  const [availableYears, setAvailableYears] = useState([]);
  const [displayedResearch, setDisplayedResearch] = useState([]);
  const [deptCounts, setDeptCounts] = useState({ total: 0, undergraduate: 0, postgraduate: 0, unknown: 0 });
  const [yearCounts, setYearCounts] = useState({});
  const yearsRef = React.useRef(null);
  const researchRef = React.useRef(null);
  const [deptFilteredDebug, setDeptFilteredDebug] = useState([]);
  const [filteredDebug, setFilteredDebug] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

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

    // helper to map research.type to a rough level
    const mapTypeToLevel = (type) => {
      const t = (type || '').toLowerCase();
      const post = new Set(['thesis', 'dissertation']);
      const under = new Set(['project_report', 'capstone', 'undergraduate_project']);
      if (post.has(t)) return 'postgraduate';
      if (under.has(t)) return 'undergraduate';
      return 'both';
    };

    // Helper to check keywords for level tag
    const hasLevelKeyword = (r, lvl) => {
      if (!r || !r.keywords) return false;
      try {
        const kws = typeof r.keywords === 'string' ? r.keywords.toLowerCase() : JSON.stringify(r.keywords).toLowerCase();
        return kws.includes(`level:${lvl}`);
      } catch (e) {
        return false;
      }
    };

    let filtered = allResearch.filter(r => {
      // r.departments may be an object { name: '...' } or array; handle both
      const rDeptName = r.departments?.name || (Array.isArray(r.departments) ? r.departments[0]?.name : null);

      // match only research that belongs to one of this college's departments
      const inCollege = deptNames.length === 0 ? true : deptNames.includes(rDeptName);
      if (!inCollege) return false;

      // Department/program matching: if selectedDepartment is set, allow matches where
      // - rDeptName exactly equals selectedDepartment (regular department)
      // - OR selectedDepartment is an extra program name: match against keywords/title/abstract
      if (selectedDepartment) {
        const selectedLower = String(selectedDepartment).toLowerCase();
        const matchedDept = rDeptName === selectedDepartment;
        const textFields = `${r.title || ''} ${r.abstract || ''} ${r.keywords || ''}`.toLowerCase();
        const matchedProgram = !matchedDept && textFields.includes(selectedLower);
        if (!matchedDept && !matchedProgram) return false;
      }

      // level filtering: use canonical helper. For 'postgraduate' require explicit/postgraduate mapping.
      if (selectedLevel) {
        const lvl = getResearchLevel(r); // returns 'undergraduate'|'postgraduate'|'unknown'
        if (selectedLevel === 'postgraduate') {
          // be strict: only include explicit postgraduate
          if (lvl !== 'postgraduate') return false;
        } else if (selectedLevel === 'undergraduate') {
          // be lenient: include items marked undergraduate OR unknown (treat unknown as undergrad)
          if (!(lvl === 'undergraduate' || lvl === 'unknown')) return false;
        }
      }

      return true;
    });

    // derive years for the selected department (ignore selectedLevel so years show all uploads)
    if (selectedDepartment) {
      const deptFiltered = allResearch.filter(r => {
        const rDeptName = r.departments?.name || (Array.isArray(r.departments) ? r.departments[0]?.name : null);
        // match department exact or program-name occurrences in text
        if (rDeptName === selectedDepartment) return true;
        const textFields = `${r.title || ''} ${r.abstract || ''} ${r.keywords || ''}`.toLowerCase();
        if (String(selectedDepartment).toLowerCase() && textFields.includes(String(selectedDepartment).toLowerCase())) return true;
        return false;
      });

      // save debug snapshot of deptFiltered for inspection
      setDeptFilteredDebug(deptFiltered.map(r => ({ id: r.id, title: r.title, year: r.year || (r.created_at ? new Date(r.created_at).getFullYear() : null), type: r.type, keywords: r.keywords, departments: r.departments })));

      // compute department-level counts by inferred level
      const counts = deptFiltered.reduce((acc, r) => {
        const lvl = getResearchLevel(r);
        if (lvl === 'postgraduate') {
          acc.postgraduate += 1;
          acc.total += 1;
        } else if (lvl === 'undergraduate') {
          acc.undergraduate += 1;
          acc.total += 1;
        }
        // Unknowns are ignored in the count
        return acc;
      }, { total: 0, undergraduate: 0, postgraduate: 0 });
      setDeptCounts(counts);

      // compute per-year counts for dropdown labels
      const yc = {};
      const yearsSet = new Set();
      deptFiltered.forEach(r => {
        const y = r.year || (r.created_at ? new Date(r.created_at).getFullYear() : null);
        if (y) {
          yearsSet.add(y);
          yc[y] = (yc[y] || 0) + 1;
        }
      });
      setYearCounts(yc);
      const years = Array.from(yearsSet).sort((a, b) => b - a);
      setAvailableYears(years);
    } else {
      setAvailableYears([]);
      setDeptCounts({ total: 0, undergraduate: 0, postgraduate: 0, unknown: 0 });
      setYearCounts({});
    }

    // apply year filter
    let byYear = filtered;
    if (selectedYear && selectedYear !== 'all') {
      byYear = filtered.filter(r => {
        const y = r.year || (r.created_at ? new Date(r.created_at).getFullYear() : null);
        return String(y) === String(selectedYear);
      });
    }

    // save debug snapshot of filtered and displayed
    setFilteredDebug(filtered.map(r => ({ id: r.id, title: r.title, year: r.year || (r.created_at ? new Date(r.created_at).getFullYear() : null), type: r.type, keywords: r.keywords, departments: r.departments })));
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
                <FontAwesomeIcon icon={faBookOpen} size="4x" style={{ color: '#fff', opacity: 0.3 }} />
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
              <div className="text-center mb-3">
                <h2 className="section-title departments-title mb-3">Departments</h2>

                <div className="level-buttons-main d-flex justify-content-center mb-4">
                  <Button
                    className={`level-btn me-3 ${selectedLevel === 'undergraduate' ? 'active' : ''}`}
                    size="lg"
                    variant={selectedLevel === 'undergraduate' ? 'primary' : 'outline-primary'}
                    onClick={() => { setSelectedLevel('undergraduate'); setSelectedDepartment(null); setSelectedYear('all'); }}
                  >
                    Undergraduate
                  </Button>
                  <Button
                    className={`level-btn ${selectedLevel === 'postgraduate' ? 'active' : ''}`}
                    size="lg"
                    variant={selectedLevel === 'postgraduate' ? 'primary' : 'outline-primary'}
                    onClick={() => { setSelectedLevel('postgraduate'); setSelectedDepartment(null); setSelectedYear('all'); }}
                  >
                    Postgraduate
                  </Button>
                </div>

                {!selectedLevel && <p className="text-muted">Choose a level to view departments.</p>}
              </div>

              <Row className="mb-3">
                {selectedLevel && (
                  (() => {
                    const levelLabel = selectedLevel === 'undergraduate' ? 'Undergraduate' : 'Postgraduate';
                    const filteredDepartments = (college.departments || []).filter(d => Array.isArray(d.programs) && d.programs.includes(levelLabel));
                    // include any program names declared on the college that don't match departments exactly
                    const collegePrograms = (selectedLevel === 'postgraduate' ? (college.postgraduate || []) : []);
                    const deptNamesLower = (college.departments || []).map(d => d.name.toLowerCase());
                    const extraPrograms = collegePrograms.filter(pg => !deptNamesLower.includes(String(pg).toLowerCase()));
                    if (filteredDepartments.length === 0) {
                      return <Col><p className="text-muted">No departments available for {levelLabel}.</p></Col>;
                    }
                    return (
                      <>
                        {filteredDepartments.map((d, idx) => (
                          <Col md={6} lg={4} key={idx} className="mb-3">
                            <Card
                              onClick={() => { setSelectedDepartment(d.name); setSelectedYear('all'); setTimeout(() => { yearsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); }}
                              className={`department-card shadow-sm border-0 h-100 department-hover ${selectedDepartment === d.name ? 'selected-department' : ''}`}
                              style={{ cursor: 'pointer' }}
                            >
                              <Card.Body className="p-3">
                                <Card.Title className="mb-1">{d.name}</Card.Title>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                  <Badge bg="secondary">{levelLabel}</Badge>
                                  <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); setSelectedDepartment(d.name); setSelectedYear('all'); setTimeout(() => { yearsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); }}>
                                    View <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}

                        {extraPrograms.map((pg, i) => (
                          <Col md={6} lg={4} key={`pg-${i}`} className="mb-3">
                            <Card
                              onClick={() => { setSelectedDepartment(pg); setSelectedYear('all'); setTimeout(() => { yearsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); }}
                              className={`department-card shadow-sm border-0 h-100 department-hover ${selectedDepartment === pg ? 'selected-department' : ''}`}
                              style={{ cursor: 'pointer' }}
                            >
                              <Card.Body className="p-3">
                                <Card.Title className="mb-1">{pg}</Card.Title>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                  <Badge bg="secondary">{levelLabel}</Badge>
                                  <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); setSelectedDepartment(pg); setSelectedYear('all'); setTimeout(() => { yearsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); }}>
                                    View <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </>
                    );
                  })()
                )}
              </Row>

              {/* Department Years section */}
              {selectedDepartment && (
                <div ref={yearsRef} className="department-years mb-4">
                  <h4 className="mb-3">{selectedDepartment} – Publication Years</h4>
                  {availableYears.length === 0 ? (
                    <p className="text-muted">No publications found for {selectedDepartment}.</p>
                  ) : (
                    <div className="d-flex align-items-center">
                      <DropdownButton
                        id="years-dropdown"
                        title={selectedYear === 'all' ? 'Select Year' : String(selectedYear)}
                        variant="outline-secondary"
                        className="me-3"
                      >
                        <Dropdown.Item
                          active={selectedYear === 'all'}
                          onClick={() => { setSelectedYear('all'); setTimeout(() => { researchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); }}
                        >
                          All Years ({deptCounts.total})
                        </Dropdown.Item>
                        {availableYears.map((y) => (
                          <Dropdown.Item
                            key={String(y)}
                            active={String(selectedYear) === String(y)}
                            onClick={() => { setSelectedYear(y); setTimeout(() => { researchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); }}
                          >
                            {y} ({yearCounts[y] || 0})
                          </Dropdown.Item>
                        ))}
                      </DropdownButton>

                      <div className="text-muted small">
                        {deptCounts.total} file(s) — {deptCounts.undergraduate} Undergraduate, {deptCounts.postgraduate} Postgraduate
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Research list for selected filters */}
              <div ref={researchRef}>
                {selectedDepartment ? (
                  <div>
                    <h5 className="mb-3">Showing research for <strong>{selectedDepartment}</strong> {selectedYear !== 'all' ? ` — ${selectedYear}` : ''}</h5>
                    {displayedResearch.length === 0 ? (
                      <p className="text-muted">No research files found for the selected filters.</p>
                    ) : (
                      <Row>
                        {displayedResearch.map((r) => (
                          <Col md={6} lg={4} key={r.id} className="mb-3">
                            <ResearchCard research={r} />
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

        {/* Postgraduate section removed as requested */}

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