import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faChartBar, faChartPie } from '@fortawesome/free-solid-svg-icons';
import { getSystemStats } from '../../../supabase/database';
import Loading from '../../common/Loading/Loading';
import './Reports.css';

const Reports = () => {
  const [stats, setStats] = useState({
    totalResearch: 0,
    totalUsers: 0,
    adminCount: 0,
    departmentHeadCount: 0,
    userCount: 0,
    thesisCount: 0,
    dissertationCount: 0,
    researchPaperCount: 0,
    conferencePaperCount: 0,
    projectReportCount: 0,
    publicResearchCount: 0,
    restrictedResearchCount: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const systemStats = await getSystemStats();
        setStats(systemStats);
      } catch (error) {
        console.error('Error fetching system stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const downloadReport = (format) => {
    // In a real implementation, this would generate and download a report
    // For now, we'll just show an alert
    alert(`Downloading ${format} report...`);
  };
  
  if (loading) {
    return <Loading message="Loading reports..." />;
  }
  
  return (
    <div className="reports">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>System Reports</h3>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => downloadReport('PDF')}
          >
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Download PDF
          </Button>
          <Button 
            variant="outline-success"
            onClick={() => downloadReport('Excel')}
          >
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Download Excel
          </Button>
        </div>
      </div>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card className="report-card">
            <Card.Header as="h5">
              <FontAwesomeIcon icon={faChartPie} className="me-2" />
              User Statistics
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>User Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Administrators</td>
                    <td>{stats.adminCount}</td>
                    <td>
                      {stats.totalUsers > 0 
                        ? `${((stats.adminCount / stats.totalUsers) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>Department Heads</td>
                    <td>{stats.departmentHeadCount}</td>
                    <td>
                      {stats.totalUsers > 0 
                        ? `${((stats.departmentHeadCount / stats.totalUsers) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>Regular Users</td>
                    <td>{stats.userCount}</td>
                    <td>
                      {stats.totalUsers > 0 
                        ? `${((stats.userCount / stats.totalUsers) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr className="table-active">
                    <td><strong>Total</strong></td>
                    <td><strong>{stats.totalUsers}</strong></td>
                    <td><strong>100%</strong></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="report-card">
            <Card.Header as="h5">
              <FontAwesomeIcon icon={faChartBar} className="me-2" />
              Research Statistics
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Research Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Theses</td>
                    <td>{stats.thesisCount}</td>
                    <td>
                      {stats.totalResearch > 0 
                        ? `${((stats.thesisCount / stats.totalResearch) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>Dissertations</td>
                    <td>{stats.dissertationCount}</td>
                    <td>
                      {stats.totalResearch > 0 
                        ? `${((stats.dissertationCount / stats.totalResearch) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>Research Papers</td>
                    <td>{stats.researchPaperCount}</td>
                    <td>
                      {stats.totalResearch > 0 
                        ? `${((stats.researchPaperCount / stats.totalResearch) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>Conference Papers</td>
                    <td>{stats.conferencePaperCount}</td>
                    <td>
                      {stats.totalResearch > 0 
                        ? `${((stats.conferencePaperCount / stats.totalResearch) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>Project Reports</td>
                    <td>{stats.projectReportCount}</td>
                    <td>
                      {stats.totalResearch > 0 
                        ? `${((stats.projectReportCount / stats.totalResearch) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr className="table-active">
                    <td><strong>Total</strong></td>
                    <td><strong>{stats.totalResearch}</strong></td>
                    <td><strong>100%</strong></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="report-card">
        <Card.Header as="h5">Access Level Statistics</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3">
              <div className="stat-item">
                <h4 className="stat-value">{stats.publicResearchCount}</h4>
                <p className="stat-label">Public Research</p>
              </div>
            </Col>
            <Col md={6} className="mb-3">
              <div className="stat-item">
                <h4 className="stat-value">{stats.restrictedResearchCount}</h4>
                <p className="stat-label">Restricted Research</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Reports;