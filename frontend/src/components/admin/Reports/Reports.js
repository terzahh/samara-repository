import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faChartBar, faChartPie } from '@fortawesome/free-solid-svg-icons';
import { getSystemStats, getContactMessages } from '../../../supabase/database';
import Loading from '../../common/Loading/Loading';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const systemStats = await getSystemStats();
        setStats(systemStats);
        // Load contact messages if table exists
        try {
          const msgs = await getContactMessages();
          setMessages(msgs);
        } catch (e) {
          // Table may not exist; ignore
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching system stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const downloadReport = (format) => {
    if (format === 'PDF') {
      downloadPDFReport();
    } else if (format === 'Excel') {
      downloadExcelReport();
    }
  };

  const downloadPDFReport = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('System Reports', 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      let yPosition = 40;
      
      // User Statistics Table
      doc.setFontSize(14);
      doc.text('User Statistics', 14, yPosition);
      yPosition += 10;
      
      const userData = [
        ['Administrators', stats.adminCount, `${stats.totalUsers > 0 ? ((stats.adminCount / stats.totalUsers) * 100).toFixed(1) : 0}%`],
        ['Department Heads', stats.departmentHeadCount, `${stats.totalUsers > 0 ? ((stats.departmentHeadCount / stats.totalUsers) * 100).toFixed(1) : 0}%`],
        ['Regular Users', stats.userCount, `${stats.totalUsers > 0 ? ((stats.userCount / stats.totalUsers) * 100).toFixed(1) : 0}%`],
        ['Total', stats.totalUsers, '100%']
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [['User Type', 'Count', 'Percentage']],
        body: userData,
        theme: 'striped',
        headStyles: { fillColor: [45, 123, 168] },
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
      
      // Research Statistics Table
      doc.setFontSize(14);
      doc.text('Research Statistics', 14, yPosition);
      yPosition += 10;
      
      const researchData = [
        ['Theses', stats.thesisCount, `${stats.totalResearch > 0 ? ((stats.thesisCount / stats.totalResearch) * 100).toFixed(1) : 0}%`],
        ['Dissertations', stats.dissertationCount, `${stats.totalResearch > 0 ? ((stats.dissertationCount / stats.totalResearch) * 100).toFixed(1) : 0}%`],
        ['Research Papers', stats.researchPaperCount, `${stats.totalResearch > 0 ? ((stats.researchPaperCount / stats.totalResearch) * 100).toFixed(1) : 0}%`],
        ['Conference Papers', stats.conferencePaperCount, `${stats.totalResearch > 0 ? ((stats.conferencePaperCount / stats.totalResearch) * 100).toFixed(1) : 0}%`],
        ['Project Reports', stats.projectReportCount, `${stats.totalResearch > 0 ? ((stats.projectReportCount / stats.totalResearch) * 100).toFixed(1) : 0}%`],
        ['Total', stats.totalResearch, '100%']
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Research Type', 'Count', 'Percentage']],
        body: researchData,
        theme: 'striped',
        headStyles: { fillColor: [45, 123, 168] },
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
      
      // Access Level Statistics
      doc.setFontSize(14);
      doc.text('Access Level Statistics', 14, yPosition);
      yPosition += 10;
      
      const accessData = [
        ['Public Research', stats.publicResearchCount],
        ['Restricted Research', stats.restrictedResearchCount]
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Access Level', 'Count']],
        body: accessData,
        theme: 'striped',
        headStyles: { fillColor: [45, 123, 168] },
      });
      
      // Save PDF
      const fileName = `system-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const downloadExcelReport = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // User Statistics Sheet
      const userData = [
        ['User Type', 'Count', 'Percentage'],
        ['Administrators', stats.adminCount, `${stats.totalUsers > 0 ? ((stats.adminCount / stats.totalUsers) * 100).toFixed(1) : 0}%`],
        ['Department Heads', stats.departmentHeadCount, `${stats.totalUsers > 0 ? ((stats.departmentHeadCount / stats.totalUsers) * 100).toFixed(1) : 0}%`],
        ['Regular Users', stats.userCount, `${stats.totalUsers > 0 ? ((stats.userCount / stats.totalUsers) * 100).toFixed(1) : 0}%`],
        ['Total', stats.totalUsers, '100%']
      ];
      const userWs = XLSX.utils.aoa_to_sheet(userData);
      XLSX.utils.book_append_sheet(wb, userWs, 'User Statistics');
      
      // Research Statistics Sheet
      const researchData = [
        ['Research Type', 'Count', 'Percentage'],
        ['Theses', stats.thesisCount, `${stats.totalResearch > 0 ? ((stats.thesisCount / stats.totalResearch) * 100).toFixed(1) : 0}%`],
        ['Dissertations', stats.dissertationCount, `${stats.totalResearch > 0 ? ((stats.dissertationCount / stats.totalResearch) * 100).toFixed(1) : 0}%`],
        ['Research Papers', stats.researchPaperCount, `${stats.totalResearch > 0 ? ((stats.researchPaperCount / stats.totalResearch) * 100).toFixed(1) : 0}%`],
        ['Conference Papers', stats.conferencePaperCount, `${stats.totalResearch > 0 ? ((stats.conferencePaperCount / stats.totalResearch) * 100).toFixed(1) : 0}%`],
        ['Project Reports', stats.projectReportCount, `${stats.totalResearch > 0 ? ((stats.projectReportCount / stats.totalResearch) * 100).toFixed(1) : 0}%`],
        ['Total', stats.totalResearch, '100%']
      ];
      const researchWs = XLSX.utils.aoa_to_sheet(researchData);
      XLSX.utils.book_append_sheet(wb, researchWs, 'Research Statistics');
      
      // Access Level Statistics Sheet
      const accessData = [
        ['Access Level', 'Count'],
        ['Public Research', stats.publicResearchCount],
        ['Restricted Research', stats.restrictedResearchCount]
      ];
      const accessWs = XLSX.utils.aoa_to_sheet(accessData);
      XLSX.utils.book_append_sheet(wb, accessWs, 'Access Level Statistics');
      
      // Save Excel file
      const fileName = `system-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error generating Excel report:', error);
      alert('Failed to generate Excel report. Please try again.');
    }
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

      <Card className="report-card mt-4">
        <Card.Header as="h5">Recent Contact Messages</Card.Header>
        <Card.Body>
          {messages.length === 0 ? (
            <p className="text-muted mb-0">No contact messages.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</td>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.subject}</td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{m.message}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Reports;