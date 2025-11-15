import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Button, Form, InputGroup, Pagination, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faEdit, 
  faTrash, 
  faComments,
  faPlus,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import UploadResearch from '../UploadResearch/UploadResearch';
import EditResearch from '../EditResearch/EditResearch';
import ViewComments from '../ViewComments/ViewComments';
import { getAllResearch, getDepartmentById } from '../../../supabase/database';
import { useAuth } from '../../../hooks/useAuth';
import Loading from '../../common/Loading/Loading';
import { formatDate, truncateText, getResearchTypeLabel } from '../../../utils/helpers';
import './DepartmentDashboard.css';

const DepartmentDashboard = () => {
  const [researchList, setResearchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const { user, departmentId } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentName, setDepartmentName] = useState('');
  const pageSize = 10;
  
  useEffect(() => {
    const fetchResearch = async () => {
      try {
        // Get department name
        if (departmentId) {
          const department = await getDepartmentById(departmentId);
          setDepartmentName(department?.name || '');
        }
        
        // Get research for the department head's department
        const { research } = await getAllResearch(1, 50, { department: departmentId });
        setResearchList(research);
      } catch (error) {
        console.error('Error fetching research:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (departmentId) {
      fetchResearch();
    }
  }, [departmentId]);
  
  const handleEditResearch = (research) => {
    setSelectedResearch(research);
    setShowEditModal(true);
  };
  
  const handleViewComments = (research) => {
    setSelectedResearch(research);
    setShowCommentsModal(true);
  };
  
  const refreshResearchList = () => {
    setLoading(true);
    getAllResearch(1, 50, { department: departmentId })
      .then(({ research }) => {
        setResearchList(research);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error refreshing research list:', error);
        setLoading(false);
      });
  };

  const filteredResearch = researchList.filter(r => {
    const term = searchText.toLowerCase().trim();
    const matchesText = !term || [r.title, r.author, r.keywords].some(v => (v || '').toLowerCase().includes(term));
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    const matchesAccess = accessFilter === 'all' || r.access_level === accessFilter;
    return matchesText && matchesType && matchesAccess;
  });

  const totalPages = Math.max(1, Math.ceil(filteredResearch.length / pageSize));
  const pagedResearch = filteredResearch.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, typeFilter, accessFilter]);
  
  if (loading) {
    return <Loading message="Loading research..." />;
  }
  
  return (
    <Container fluid className="department-dashboard">
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Department Dashboard</h1>
        <p className="text-muted">
          {departmentName ? `Manage research in ${departmentName}` : 'Manage research in your department'}
        </p>
      </div>
      
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card>
            <Card.Header as="h5">Navigation</Card.Header>
            <Card.Body className="d-grid gap-2">
              <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Upload Research
              </Button>
              <Button variant="outline-secondary" onClick={refreshResearchList}>
                Refresh List
              </Button>
              <div className="mt-2">
                <div className="text-muted small mb-1">Quick Filters</div>
                <Badge bg="info" className="me-2 mb-2" onClick={() => setAccessFilter('public')} style={{ cursor: 'pointer' }}>Public</Badge>
                <Badge bg="warning" text="dark" className="me-2 mb-2" onClick={() => setAccessFilter('restricted')} style={{ cursor: 'pointer' }}>Restricted</Badge>
                <Badge bg="secondary" className="mb-2" onClick={() => { setAccessFilter('all'); setTypeFilter('all'); }} style={{ cursor: 'pointer' }}>Clear</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={9}>
          <Card>
            <Card.Header as="h5" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span>Research Management</span>
              <div className="d-flex flex-wrap gap-2">
                <InputGroup>
                  <Form.Control
                    placeholder="Search title, author, keywords"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </InputGroup>
                <Form.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ minWidth: 180 }}>
                  <option value="all">All Types</option>
                  <option value="thesis">Thesis</option>
                  <option value="dissertation">Dissertation</option>
                  <option value="research_paper">Research Paper</option>
                  <option value="conference_paper">Conference Paper</option>
                  <option value="project_report">Project Report</option>
                </Form.Select>
                <Form.Select value={accessFilter} onChange={(e) => setAccessFilter(e.target.value)} style={{ minWidth: 160 }}>
                  <option value="all">All Access</option>
                  <option value="public">Public</option>
                  <option value="restricted">Restricted</option>
                </Form.Select>
                <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Upload
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {researchList.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No research documents found.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowUploadModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Upload Your First Research
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Type</th>
                        <th>Access Level</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedResearch.map(research => (
                        <tr key={research.id}>
                          <td>
                            <Link to={`/research/${research.id}`} className="research-link">
                              {truncateText(research.title, 50)}
                            </Link>
                          </td>
                          <td>{research.author}</td>
                          <td>
                            <span className="badge bg-info">
                              {getResearchTypeLabel(research.type)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${research.access_level === 'public' ? 'success' : 'warning'}`}>
                              {research.access_level === 'public' ? 'Public' : 'Restricted'}
                            </span>
                          </td>
                          <td>{formatDate(research.created_at)}</td>
                          <td>
                            <Button 
                              as={Link}
                              to={`/research/${research.id}`}
                              variant="outline-success" 
                              size="sm" 
                              className="me-2"
                              title="View Research"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEditResearch(research)}
                              title="Edit Research"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleViewComments(research)}
                              title="View Comments"
                            >
                              <FontAwesomeIcon icon={faComments} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center my-3">
                      <Pagination>
                        <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>
                            {p}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <UploadResearch 
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        onUploadSuccess={refreshResearchList}
        departmentId={departmentId}
      />
      
      {selectedResearch && (
        <>
          <EditResearch 
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            research={selectedResearch}
            onEditSuccess={refreshResearchList}
          />
          
          <ViewComments 
            show={showCommentsModal}
            onHide={() => setShowCommentsModal(false)}
            research={selectedResearch}
          />
        </>
      )}
    </Container>
  );
};

export default DepartmentDashboard;