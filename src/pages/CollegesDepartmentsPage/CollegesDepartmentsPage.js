import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Accordion, Badge, Form, InputGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faGraduationCap,
  faEnvelope,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import { getAllDepartments, getAllResearch, getResearchYearsByDepartment } from '../../supabase/database';
import './CollegesDepartmentsPage.css';
import colleges from '../../data/collegesData';

const CollegesDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [researchCounts, setResearchCounts] = useState({});
  const [expandedCollege, setExpandedCollege] = useState(null);
  const [yearsByDept, setYearsByDept] = useState({});
  const [visibleYearsDept, setVisibleYearsDept] = useState({});
  const [loadingYears, setLoadingYears] = useState({});
  const [departmentMap, setDepartmentMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Normalize department names consistently to avoid mismatches
  const normalizeName = (name) => {
    return (name || '')
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/\s+/g, ' ') // collapse inner whitespace
      .replace(/[^\w\s]/g, '') // remove punctuation
      .replace(/\s/g, ''); // remove spaces for strict key
  };

  // Alias map from displayed labels → actual DB department names
  const displayToDbAlias = useMemo(() => ({
    'electrical & computer engineering': 'electrical engineering',
    'electrical and computer engineering': 'electrical engineering',
    'construction technology management': 'construction technology management', // keep same if exists
    'water resource & irrigation engineering': 'water resource & irrigation engineering',
    'water resource and irrigation engineering': 'water resource & irrigation engineering',
  }), []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const depts = await getAllDepartments();
        setDepartments(depts);

        // Build a strict normalized name -> id map to avoid cross-mapping
        const deptMap = depts.reduce((acc, dept) => {
          const key = normalizeName(dept.name);
          // Do not overwrite if duplicate normalized names exist
          if (!acc[key]) acc[key] = dept.id;
          return acc;
        }, {});
        setDepartmentMap(deptMap);

        // Get research counts for each department using their IDs
        const counts = {};
        for (const dept of depts) {
          try {
            const { totalCount } = await getAllResearch(1, 1, { department: dept.id });
            counts[dept.id] = totalCount || 0;
          } catch (error) {
            console.warn(`Error getting research count for department ${dept.name}:`, error);
            counts[dept.id] = 0;
          }
        }
        setResearchCounts(counts);
        
        console.log('Research counts by department ID:', counts);
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };

    loadData();
  }, []);

  // colleges array is loaded from src/data/collegesData.js

  const findDepartmentByName = (name) => {
    const lowered = (name || '').toLowerCase().trim();
    // Strict: only exact case-insensitive match, no fallbacks to avoid cross-mapping
    const exact = departments.find(
      dept => (dept.name || '').toLowerCase().trim() === lowered
    );
    if (exact) return exact;

    // Try alias mapping (display label -> db name), still strict on the resolved name
    const alias = displayToDbAlias[lowered];
    if (alias) {
      const aliasExact = departments.find(
        dept => (dept.name || '').toLowerCase().trim() === alias.toLowerCase().trim()
      );
      if (aliasExact) return aliasExact;
    }

    return null;
  };

  const getResearchCount = (deptName) => {
    const dept = findDepartmentByName(deptName);
    const count = dept ? (researchCounts[dept.id] || 0) : 0;
    
    // Debug logging for first few calls
    if (!getResearchCount.logged && getResearchCount.callCount < 5) {
      console.log(`getResearchCount("${deptName}") -> ${count} (dept: ${dept ? dept.name : 'not found'})`);
      getResearchCount.callCount = (getResearchCount.callCount || 0) + 1;
      if (getResearchCount.callCount >= 5) {
        getResearchCount.logged = true;
      }
    }
    
    return count;
  };

  const loadYearsForDept = async (deptId) => {
    if (!deptId) return;
    // Avoid reloading if we already have years
    if (yearsByDept[deptId]) {
      setVisibleYearsDept(prev => ({ ...prev, [deptId]: !prev[deptId] }));
      return;
    }

    setLoadingYears(prev => ({ ...prev, [deptId]: true }));
    try {
      const years = await getResearchYearsByDepartment(deptId);
      setYearsByDept(prev => ({ ...prev, [deptId]: years }));
      setVisibleYearsDept(prev => ({ ...prev, [deptId]: true }));
    } catch (e) {
      console.error('Error loading years for dept', deptId, e);
      setYearsByDept(prev => ({ ...prev, [deptId]: [] }));
      setVisibleYearsDept(prev => ({ ...prev, [deptId]: true }));
    } finally {
      setLoadingYears(prev => ({ ...prev, [deptId]: false }));
    }
  };

  const toggleCollege = (collegeId) => {
    setExpandedCollege(expandedCollege === collegeId ? null : collegeId);
  };

  // Filter function for search box (matches department cards across colleges)
  const departmentMatchesSearch = (deptLabel) => {
    if (!searchTerm.trim()) return true;
    return deptLabel.toLowerCase().includes(searchTerm.toLowerCase().trim());
  };

  // Build flattened department list for search results
  const flattenedDepartments = useMemo(() => {
    const items = [];
    colleges.forEach(college => {
      (college.departments || []).forEach(d => {
        items.push({ collegeId: college.id, collegeName: college.name, name: d.name });
      });
    });
    return items;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return flattenedDepartments.filter(item => departmentMatchesSearch(item.name));
  }, [flattenedDepartments, searchTerm]);

  return (
    <div className="colleges-departments-page">
      <Container className="py-5">
        <Row>
          <Col md={12}>
            <div className="page-header text-center mb-5">
              <h1 className="page-title">
                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                Colleges & Departments
              </h1>
              <p className="page-subtitle">
                Browse research organized by colleges and departments
              </p>
            </div>
          </Col>
        </Row>

        {/* Department quick search */}
        <Row className="mb-4">
          <Col md={8} className="mx-auto">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search departments (e.g., Electrical Engineering, Computer Science, Civil Engineering)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                  Clear
                </Button>
              )}
            </InputGroup>
          </Col>
        </Row>

        {/* Search Results Quick Access */}
        {searchTerm.trim() && (
          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header as="h5">Search Results</Card.Header>
                <Card.Body>
                  {searchResults.length === 0 ? (
                    <p className="text-muted mb-0">No departments found.</p>
                  ) : (
                    <Row>
                      {searchResults.map((item, idx) => {
                        const deptData = findDepartmentByName(item.name);
                        const count = deptData ? (researchCounts[deptData.id] || 0) : 0;
                        return (
                          <Col md={6} lg={4} key={`${item.name}-${idx}`} className="mb-3">
                            <Card className="department-card h-100">
                              <Card.Body>
                                <Card.Title as="h5" className="department-name">
                                  {item.name}
                                </Card.Title>
                                <Card.Text className="mb-2">
                                  <small className="text-muted">{item.collegeName}</small>
                                </Card.Text>
                                {deptData ? (
                                  <>
                                    <p className="research-count mb-2">
                                      <Badge bg="primary">{count} Research Items</Badge>
                                    </p>
                                    <Link 
                                      to={`/browse?department=${deptData.id}`}
                                      className="btn btn-sm btn-outline-primary"
                                    >
                                      View Research
                                    </Link>
                                  </>
                                ) : (
                                  <p className="text-muted small mb-0">
                                    No matching department record
                                  </p>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <Row>
          <Col md={12}>
            <Accordion activeKey={expandedCollege?.toString()} className="colleges-accordion">
              {colleges.map((college) => (
                <Accordion.Item eventKey={college.id.toString()} key={college.id}>
                    <Accordion.Header onClick={() => toggleCollege(college.id)}>
                    <div className="college-header">
                        <h3 className="college-name">{college.name}</h3>
                      {college.contact && (
                        <Badge bg="info" className="ms-2">Contact Info Available</Badge>
                      )}
                    </div>
                  </Accordion.Header>
                    <Accordion.Body>
                      <div className="mb-2">
                        <Link to={`/colleges/${college.id}`} className="btn btn-sm btn-outline-primary me-2">Open College Page</Link>
                      </div>
                    {/* Visit college website button */}
                    {college.website && (
                      <div className="mb-3">
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          Visit College Website
                        </a>
                      </div>
                    )}
                    {/* Contact Information */}
                    {college.contact && (
                      <Card className="contact-card mb-4">
                        <Card.Body>
                          <h5 className="mb-3">
                            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                            Contact Information
                          </h5>
                          <Row>
                            <Col md={6}>
                              <p className="mb-2">
                                <strong>{college.contact.title}</strong>
                              </p>
                              <p className="mb-2">
                                <strong>Name:</strong> {college.contact.name}
                              </p>
                            </Col>
                            <Col md={6}>
                              <p className="mb-2">
                                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                <strong>Email:</strong>{' '}
                                <a href={`mailto:${college.contact.email}`}>
                                  {college.contact.email}
                                </a>
                              </p>
                              <p className="mb-0">
                                <FontAwesomeIcon icon={faPhone} className="me-2" />
                                <strong>Phone:</strong> {college.contact.phone}
                              </p>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}

                    {/* Undergraduate Programs */}
                    {college.departments && college.departments.length > 0 && (
                      <div className="programs-section mb-4">
                        <h4 className="programs-title mb-3">
                          <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                          Undergraduate Programs
                        </h4>
                        <Row>
                          {college.departments
                            .filter(dept => departmentMatchesSearch(dept.name))
                            .map((dept, index) => {
                            const deptData = findDepartmentByName(dept.name);
                            const count = getResearchCount(dept.name);
                            
                            return (
                              <Col md={6} lg={4} key={index} className="mb-3">
                                <Card className="department-card h-100">
                                  <Card.Body>
                                    <Card.Title as="h5" className="department-name">
                                      {dept.name}
                                    </Card.Title>
                                    {deptData ? (
                                      <>
                                        <p className="research-count mb-2">
                                          <Badge bg="primary">{count} Research Items</Badge>
                                        </p>
                                        <div className="d-flex gap-2">
                                          <Link 
                                            to={`/browse?department=${deptData.id}`}
                                            className="btn btn-sm btn-outline-primary"
                                          >
                                            View Research
                                          </Link>
                                          <Button 
                                            variant="outline-secondary" 
                                            size="sm"
                                            onClick={() => loadYearsForDept(deptData.id)}
                                          >
                                            {loadingYears[deptData.id] ? 'Loading...' : 'Years'}
                                          </Button>
                                        </div>
                                        {/* Years panel */}
                                        {visibleYearsDept[deptData.id] && (
                                          <div className="mt-2 years-panel">
                                            <div className="d-flex flex-wrap gap-2">
                                              <Link to={`/browse?department=${deptData.id}`} className="badge bg-secondary text-decoration-none p-2">All</Link>
                                              {(yearsByDept[deptData.id] || []).map((y) => (
                                                <Link 
                                                  key={y}
                                                  to={`/browse?department=${deptData.id}&year=${y}`}
                                                  className="badge bg-light text-dark border p-2"
                                                >
                                                  {y}
                                                </Link>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-muted small mb-0">
                                        No research available yet
                                      </p>
                                    )}
                                  </Card.Body>
                                </Card>
                              </Col>
                            );
                          })}
                        </Row>
                      </div>
                    )}

                    {/* Postgraduate Programs */}
                    {college.postgraduate && college.postgraduate.length > 0 && (
                      <div className="programs-section">
                        <h4 className="programs-title mb-3">
                          <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                          Postgraduate Programs
                        </h4>
                        <Row>
                          {college.postgraduate
                            .filter(pg => departmentMatchesSearch(pg))
                            .map((program, index) => {
                              const deptData = findDepartmentByName(program);
                              const count = deptData ? (researchCounts[deptData.id] || 0) : 0;
                              return (
                                <Col md={6} lg={4} key={index} className="mb-3">
                                  <Card className="program-card">
                                    <Card.Body>
                                      <Card.Text className="mb-2">{program}</Card.Text>
                                      {deptData ? (
                                        <>
                                          <div className="d-flex align-items-center justify-content-between mb-2">
                                            <Badge bg="primary">{count} Research Items</Badge>
                                            <div>
                                              <Link 
                                                to={`/browse?department=${deptData.id}`}
                                                className="btn btn-sm btn-outline-primary me-2"
                                              >
                                                View Research
                                              </Link>
                                              <Button 
                                                variant="outline-secondary" 
                                                size="sm"
                                                onClick={() => loadYearsForDept(deptData.id)}
                                              >
                                                {loadingYears[deptData.id] ? 'Loading...' : 'Years'}
                                              </Button>
                                            </div>
                                          </div>
                                          {visibleYearsDept[deptData.id] && (
                                            <div className="mt-1 years-panel">
                                              <div className="d-flex flex-wrap gap-2">
                                                <Link to={`/browse?department=${deptData.id}`} className="badge bg-secondary text-decoration-none p-2">All</Link>
                                                {(yearsByDept[deptData.id] || []).map((y) => (
                                                  <Link 
                                                    key={y}
                                                    to={`/browse?department=${deptData.id}&year=${y}`}
                                                    className="badge bg-light text-dark border p-2"
                                                  >
                                                    {y}
                                                  </Link>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <small className="text-muted">No matching department</small>
                                      )}
                                    </Card.Body>
                                  </Card>
                                </Col>
                              );
                            })}
                        </Row>
                      </div>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>

        {/* Browse All Research */}
        <Row className="mt-5">
          <Col md={12}>
            <Card className="browse-all-card text-center">
              <Card.Body>
                <h3 className="mb-3">Browse All Research</h3>
                <p className="mb-4">
                  Explore the complete collection of research papers, theses, and dissertations
                </p>
                <Link to="/browse" className="btn btn-primary btn-lg">
                  Browse Research
                  <FontAwesomeIcon icon={faGraduationCap} className="ms-2" />
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CollegesDepartmentsPage;

