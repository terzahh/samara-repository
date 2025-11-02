import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faDownload, 
  faHistory,
  faBookmark
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useResearch } from '../../../hooks/useResearch';
import Loading from '../../common/Loading/Loading';
import { formatDate, truncateText, getResearchTypeLabel } from '../../../utils/helpers';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const { researchList, loading, fetchResearchList } = useResearch();
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  
  useEffect(() => {
    // In a real implementation, this would fetch user-specific data
    // For now, we'll just use the general research list
    fetchResearchList(1, 10, {}, true);
    
    // Mock data for download history and bookmarks
    setDownloadHistory([
      {
        id: '1',
        title: 'Machine Learning Applications in Healthcare',
        author: 'John Doe',
        downloadDate: new Date('2023-05-15')
      },
      {
        id: '2',
        title: 'Climate Change Impact on Agriculture',
        author: 'Jane Smith',
        downloadDate: new Date('2023-04-20')
      }
    ]);
    
    setBookmarks([
      {
        id: '3',
        title: 'Renewable Energy Sources',
        author: 'Robert Johnson',
        bookmarkDate: new Date('2023-05-10')
      }
    ]);
  }, [fetchResearchList]);
  
  return (
    <Container fluid className="user-dashboard">
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">User Dashboard</h1>
        <p className="text-muted">Welcome back, {user?.user_metadata?.display_name || user?.email}!</p>
      </div>
      
      <Row className="stats-cards mb-4">
        <Col md={4} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <FontAwesomeIcon icon={faDownload} />
              </div>
              <div>
                <h3 className="stat-number">{downloadHistory.length}</h3>
                <p className="stat-label">Downloads</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <FontAwesomeIcon icon={faBookmark} />
              </div>
              <div>
                <h3 className="stat-number">{bookmarks.length}</h3>
                <p className="stat-label">Bookmarks</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <FontAwesomeIcon icon={faHistory} />
              </div>
              <div>
                <h3 className="stat-number">0</h3>
                <p className="stat-label">Comments</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header as="h5">User Activity</Card.Header>
            <Card.Body className="p-0">
              <Tab.Container id="user-tabs" defaultActiveKey="recent">
                <Nav variant="pills" className="user-nav">
                  <Nav.Item>
                    <Nav.Link eventKey="recent">
                      Recent Research
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="downloads">
                      Download History
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="bookmarks">
                      Bookmarks
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content className="p-4">
                  <Tab.Pane eventKey="recent">
                    {loading ? (
                      <Loading message="Loading recent research..." />
                    ) : researchList.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-muted">No research found.</p>
                        <Button as={Link} to="/browse" variant="primary">
                          Browse Research
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
                              <th>Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {researchList.slice(0, 5).map(research => (
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
                                <td>{formatDate(research.created_at)}</td>
                                <td>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    as={Link}
                                    to={`/research/${research.id}`}
                                  >
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="downloads">
                    {downloadHistory.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-muted">No downloads yet.</p>
                        <Button as={Link} to="/browse" variant="primary">
                          Browse Research
                        </Button>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Author</th>
                              <th>Download Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {downloadHistory.map(item => (
                              <tr key={item.id}>
                                <td>
                                  <Link to={`/research/${item.id}`} className="research-link">
                                    {truncateText(item.title, 50)}
                                  </Link>
                                </td>
                                <td>{item.author}</td>
                                <td>{formatDate(item.downloadDate)}</td>
                                <td>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    as={Link}
                                    to={`/research/${item.id}`}
                                  >
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="bookmarks">
                    {bookmarks.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-muted">No bookmarks yet.</p>
                        <Button as={Link} to="/browse" variant="primary">
                          Browse Research
                        </Button>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Author</th>
                              <th>Bookmark Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookmarks.map(item => (
                              <tr key={item.id}>
                                <td>
                                  <Link to={`/research/${item.id}`} className="research-link">
                                    {truncateText(item.title, 50)}
                                  </Link>
                                </td>
                                <td>{item.author}</td>
                                <td>{formatDate(item.bookmarkDate)}</td>
                                <td>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    as={Link}
                                    to={`/research/${item.id}`}
                                  >
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;