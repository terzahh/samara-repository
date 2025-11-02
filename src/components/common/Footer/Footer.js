import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer bg-#e9ecef mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-primary">Samara University Repository</h5>
            <p className="text-muted">
              A centralized platform for managing and disseminating academic and research outputs.
            </p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-primary">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/browse" className="text-muted text-decoration-none">Browse</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none">About</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-muted text-decoration-none">Contact</Link>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5 className="text-primary">Contact Info</h5>
            <address className="text-muted">
              <p>Samara University</p>
              <p>College of Engineering and Technology</p>
              <p>Department of Computer Science</p>
              <p>Samara, Ethiopia</p>
            </address>
          </Col>
        </Row>
        <hr className="my-4" />
        <Row>
          <Col className="text-center">
            <p className="text-muted mb-0">
              &copy; {new Date().getFullYear()} Samara University. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;