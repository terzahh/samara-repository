import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faEdit, 
  faTrash, 
  faComments,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import UploadResearch from '../UploadResearch/UploadResearch';
import EditResearch from '../EditResearch/EditResearch';
import ViewComments from '../ViewComments/ViewComments';
import { getAllResearch } from '../../../supabase/database';
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
  
  useEffect(() => {
    const fetchResearch = async () => {
      try {
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
  
  if (loading) {
    return <Loading message="Loading research..." />;
  }
  
  return (
    <Container fluid className="department-dashboard">
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Department Dashboard</h1>
        <p className="text-muted">Manage research in your department</p>
      </div>
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              <span>Research Management</span>
              <Button 
                variant="primary" 
                onClick={() => setShowUploadModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Upload Research
              </Button>
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
                      {researchList.map(research => (
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
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEditResearch(research)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleViewComments(research)}
                            >
                              <FontAwesomeIcon icon={faComments} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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