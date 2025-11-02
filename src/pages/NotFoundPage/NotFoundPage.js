import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <Header />
      
      <main className="not-found-main">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} className="text-center">
              <div className="not-found-content">
                <FontAwesomeIcon icon={faExclamationTriangle} className="not-found-icon" />
                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">Page Not Found</h2>
                <p className="not-found-description">
                  The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Button as={Link} to="/" variant="primary" size="lg">
                  Go to Homepage
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFoundPage;