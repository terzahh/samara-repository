import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract, faShieldAlt, faLock, faUserShield } from '@fortawesome/free-solid-svg-icons';
import './TermsPoliciesPage.css';

const TermsPoliciesPage = () => {
  return (
    <div className="terms-policies-page">
      <Container className="py-5">
        <Row>
          <Col md={12}>
            <div className="page-header text-center mb-5">
              <h1 className="page-title">Terms & Policies</h1>
              <p className="page-subtitle">
                Repository policies and guidelines for users and contributors
              </p>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-4">
            <Card className="policy-card">
              <Card.Header className="d-flex align-items-center">
                <FontAwesomeIcon icon={faFileContract} className="me-2" />
                <h3 className="mb-0">Copyright Policy</h3>
              </Card.Header>
              <Card.Body>
                <p>
                  The Samara University Institutional Repository respects intellectual property rights 
                  and copyright laws. Authors retain copyright to their works while granting the 
                  repository a non-exclusive license to preserve and provide access to their materials.
                </p>
                <h5>Author Rights</h5>
                <ul>
                  <li>Authors retain full copyright ownership of their works</li>
                  <li>Authors grant the repository a non-exclusive license to preserve and distribute their works</li>
                  <li>Authors may choose the access level (public or restricted) for their submissions</li>
                  <li>Authors may request removal of their works from the repository at any time</li>
                </ul>
                <h5>User Responsibilities</h5>
                <ul>
                  <li>Users must respect copyright restrictions when using materials from the repository</li>
                  <li>Users must properly cite and attribute works downloaded from the repository</li>
                  <li>Users may not reproduce, distribute, or use works for commercial purposes without permission</li>
                  <li>Users must comply with all applicable copyright laws and regulations</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>

          <Col md={12} className="mb-4">
            <Card className="policy-card">
              <Card.Header className="d-flex align-items-center">
                <FontAwesomeIcon icon={faFileContract} className="me-2" />
                <h3 className="mb-0">Submission Guidelines</h3>
              </Card.Header>
              <Card.Body>
                <p>
                  All submissions to the repository must comply with the following guidelines to ensure 
                  quality, accuracy, and consistency across all materials.
                </p>
                <h5>Eligibility Requirements</h5>
                <ul>
                  <li>Submissions must be original works created by students, faculty, or researchers affiliated with Samara University</li>
                  <li>Only final, approved versions of theses, dissertations, and research papers are accepted</li>
                  <li>Submissions must meet academic quality standards and be approved by the relevant department head or academic supervisor</li>
                </ul>
                <h5>File Requirements</h5>
                <ul>
                  <li>Accepted file formats: PDF, DOC, DOCX</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Files must be complete, readable, and not corrupted</li>
                  <li>Files must include all necessary pages, figures, and appendices</li>
                </ul>
                <h5>Metadata Requirements</h5>
                <ul>
                  <li>Complete and accurate title</li>
                  <li>Author name(s)</li>
                  <li>Department affiliation</li>
                  <li>Research type (thesis, dissertation, research paper, etc.)</li>
                  <li>Year of completion</li>
                  <li>Abstract (minimum 150 words)</li>
                  <li>Keywords (3-10 relevant keywords)</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>

          <Col md={12} className="mb-4">
            <Card className="policy-card">
              <Card.Header className="d-flex align-items-center">
                <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                <h3 className="mb-0">Data Privacy Policy</h3>
              </Card.Header>
              <Card.Body>
                <p>
                  We are committed to protecting the privacy of our users and contributors. This policy 
                  outlines how we collect, use, and protect personal information.
                </p>
                <h5>Information We Collect</h5>
                <ul>
                  <li>Name and email address for account registration</li>
                  <li>Department affiliation for department heads</li>
                  <li>Usage statistics and download history (anonymized)</li>
                  <li>Contact information provided through contact forms</li>
                </ul>
                <h5>How We Use Information</h5>
                <ul>
                  <li>To provide access to repository services and content</li>
                  <li>To communicate with users about their accounts and submissions</li>
                  <li>To improve repository functionality and user experience</li>
                  <li>To generate usage statistics and reports (anonymized)</li>
                </ul>
                <h5>Data Protection</h5>
                <ul>
                  <li>Personal information is stored securely and encrypted</li>
                  <li>We do not share personal information with third parties without consent</li>
                  <li>Users can request access to or deletion of their personal information</li>
                  <li>We comply with all applicable data protection regulations</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>

          <Col md={12} className="mb-4">
            <Card className="policy-card">
              <Card.Header className="d-flex align-items-center">
                <FontAwesomeIcon icon={faLock} className="me-2" />
                <h3 className="mb-0">Access and Usage Policy</h3>
              </Card.Header>
              <Card.Body>
                <p>
                  The repository provides different levels of access to materials based on author 
                  preferences and institutional policies.
                </p>
                <h5>Access Levels</h5>
                <ul>
                  <li><strong>Public Access:</strong> Freely available to anyone visiting the repository, including non-authenticated users</li>
                  <li><strong>Restricted Access:</strong> Only available to logged-in, authorized users including students, faculty, and researchers</li>
                </ul>
                <h5>Authorized Users</h5>
                <ul>
                  <li>Students currently enrolled at Samara University</li>
                  <li>Faculty and staff members of Samara University</li>
                  <li>Researchers affiliated with Samara University</li>
                  <li>Alumni with active accounts (subject to institutional policies)</li>
                </ul>
                <h5>Usage Guidelines</h5>
                <ul>
                  <li>Materials are provided for educational and research purposes</li>
                  <li>Users must respect copyright and intellectual property rights</li>
                  <li>Users must properly cite and attribute works used in their research</li>
                  <li>Commercial use of repository materials requires explicit permission from copyright holders</li>
                  <li>Users may not attempt to circumvent access restrictions or security measures</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TermsPoliciesPage;

