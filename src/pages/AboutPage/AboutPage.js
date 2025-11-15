import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullseye, 
  faEye, 
  faArchive,
  faLock,
  faUsers,
  faFileAlt,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <Container className="py-5">
        <Row>
          <Col md={12}>
            <div className="page-header text-center mb-5">
              <h1 className="page-title">About the Repository</h1>
              <p className="page-subtitle">
                Learn about our mission, vision, and commitment to preserving academic research
              </p>
            </div>
          </Col>
        </Row>

        {/* Mission & Vision Section */}
        <Row className="mb-5">
          <Col md={6} className="mb-4">
            <Card className="mission-vision-card h-100">
              <Card.Body>
                <div className="icon-wrapper mb-3">
                  <FontAwesomeIcon icon={faBullseye} />
                </div>
                <Card.Title as="h3">Mission</Card.Title>
                <Card.Text>
                  The Samara University Institutional Repository is committed to collecting, preserving, 
                  and providing open access to the intellectual and scholarly output of our academic 
                  community. We strive to enhance the visibility and impact of research conducted at 
                  Samara University while ensuring long-term preservation and accessibility of scholarly 
                  works for current and future generations of researchers, students, and the broader 
                  academic community.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} className="mb-4">
            <Card className="mission-vision-card h-100">
              <Card.Body>
                <div className="icon-wrapper mb-3">
                  <FontAwesomeIcon icon={faEye} />
                </div>
                <Card.Title as="h3">Vision</Card.Title>
                <Card.Text>
                  To become a leading institutional repository in Ethiopia that serves as a trusted 
                  digital archive for scholarly works, promotes open access to research, and facilitates 
                  knowledge sharing and collaboration within and beyond the academic community. We envision 
                  a repository that not only preserves the intellectual legacy of Samara University but 
                  also contributes significantly to the global knowledge base and advances in research 
                  and education.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Objectives Section */}
        <Row className="mb-5">
          <Col md={12}>
            <Card className="objectives-card">
              <Card.Header as="h2">Objectives</Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4} className="mb-4">
                    <div className="objective-item">
                      <div className="objective-icon mb-3">
                        <FontAwesomeIcon icon={faArchive} />
                      </div>
                      <h4>Preserve Academic Research</h4>
                      <p>
                        To create a permanent digital archive that preserves the intellectual output 
                        of Samara University, including theses, dissertations, research papers, and 
                        project reports, ensuring their long-term accessibility and preventing loss 
                        of valuable scholarly content.
                      </p>
                    </div>
                  </Col>
                  
                  <Col md={4} className="mb-4">
                    <div className="objective-item">
                      <div className="objective-icon mb-3">
                        <FontAwesomeIcon icon={faLock} />
                      </div>
                      <h4>Provide Open Access</h4>
                      <p>
                        To promote open access to research by providing free, unrestricted access to 
                        scholarly works while respecting copyright and intellectual property rights. 
                        We aim to remove barriers to knowledge and facilitate the dissemination of 
                        research findings to a global audience.
                      </p>
                    </div>
                  </Col>
                  
                  <Col md={4} className="mb-4">
                    <div className="objective-item">
                      <div className="objective-icon mb-3">
                        <FontAwesomeIcon icon={faFileAlt} />
                      </div>
                      <h4>Promote Research Visibility</h4>
                      <p>
                        To enhance the visibility and impact of research conducted at Samara University 
                        by providing a centralized platform for discovery and access. We aim to increase 
                        citations, collaboration opportunities, and recognition for our researchers and 
                        their scholarly contributions.
                      </p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Repository Policies Section */}
        <Row className="mb-5">
          <Col md={12}>
            <Card className="policies-card">
              <Card.Header as="h2">Repository Policies</Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-4">
                    <h4>Submission Policy</h4>
                    <p>
                      All submissions to the repository must be original works created by students, 
                      faculty, or researchers affiliated with Samara University. Submissions must meet 
                      quality standards and be approved by the relevant department head or academic 
                      supervisor. Only final, approved versions of theses, dissertations, and research 
                      papers are accepted for inclusion in the repository.
                    </p>
                  </Col>
                  
                  <Col md={6} className="mb-4">
                    <h4>Copyright Policy</h4>
                    <p>
                      The repository respects intellectual property rights and copyright laws. Authors 
                      retain copyright to their works while granting the repository a non-exclusive 
                      license to preserve and provide access to their materials. For restricted works, 
                      access is limited to authorized users as specified by the author or department. 
                      All users must comply with copyright restrictions when using materials from the 
                      repository.
                    </p>
                  </Col>
                  
                  <Col md={6} className="mb-4">
                    <h4>Access Policy</h4>
                    <p>
                      The repository provides different levels of access to materials based on author 
                      preferences and institutional policies. Public works are freely accessible to all 
                      users, while restricted works require authentication and authorization. Access to 
                      restricted materials is granted to authorized users including students, faculty, 
                      and researchers as determined by the submitting department.
                    </p>
                  </Col>
                  
                  <Col md={6} className="mb-4">
                    <h4>Data Privacy Policy</h4>
                    <p>
                      We are committed to protecting the privacy of our users and contributors. Personal 
                      information collected through the repository is used solely for administrative 
                      purposes and is not shared with third parties without consent. All user data is 
                      stored securely and in compliance with applicable data protection regulations.
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Team Section */}
        <Row className="mb-5">
          <Col md={12}>
            <Card className="team-card">
              <Card.Header as="h2">Repository Management Team</Card.Header>
              <Card.Body>
                <p className="team-intro mb-4">
                  The Samara University Institutional Repository is managed by a dedicated team of 
                  professionals from the Information and Communication Technology (ICT) department 
                  and academic administration. Our team works collaboratively to ensure the smooth 
                  operation, maintenance, and continuous improvement of the repository.
                </p>
                
                <Row>
                  <Col md={4} className="mb-3">
                    <div className="team-role">
                      <h5>Repository Administrators</h5>
                      <p>
                        Responsible for overall system administration, user management, content 
                        moderation, and policy enforcement.
                      </p>
                    </div>
                  </Col>
                  
                  <Col md={4} className="mb-3">
                    <div className="team-role">
                      <h5>ICT Support Staff</h5>
                      <p>
                        Provide technical support, system maintenance, backup and recovery, and 
                        infrastructure management for the repository platform.
                      </p>
                    </div>
                  </Col>
                  
                  <Col md={4} className="mb-3">
                    <div className="team-role">
                      <h5>Department Heads</h5>
                      <p>
                        Review and approve research submissions from their respective departments, 
                        ensuring quality and compliance with academic standards.
                      </p>
                    </div>
                  </Col>
                </Row>
                
                <div className="contact-info mt-4 p-3 bg-light rounded">
                  <h5 className="mb-3">
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Contact the Team
                  </h5>
                  <p className="mb-1">
                    <strong>Email:</strong> repository@su.edu.et
                  </p>
                  <p className="mb-1">
                    <strong>Office:</strong> College of Engineering and Technology, Department of Computer Science
                  </p>
                  <p className="mb-0">
                    <strong>Location:</strong> Samara University, Samara, Ethiopia
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Additional Information */}
        <Row>
          <Col md={12}>
            <Card className="info-card">
              <Card.Body>
                <h4>
                  <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                  Quality Assurance
                </h4>
                <p>
                  All materials submitted to the repository undergo a rigorous review process to ensure 
                  quality, accuracy, and compliance with institutional standards. Department heads and 
                  academic supervisors review all submissions before they are made available to the 
                  public. The repository maintains high standards for metadata quality, file formats, 
                  and content organization to ensure optimal discoverability and usability.
                </p>
                
                <h4 className="mt-4">
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Contribution Guidelines
                </h4>
                <p>
                  We welcome contributions from all members of the Samara University academic community. 
                  To submit your research, please ensure that you have obtained necessary approvals from 
                  your department head or academic supervisor. All submissions must include complete 
                  metadata, abstracts, and keywords to facilitate discovery. For detailed submission 
                  guidelines, please refer to our <a href="/help">Help & FAQ</a> section or contact 
                  your department head.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutPage;

