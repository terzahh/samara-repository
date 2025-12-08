import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PasswordReset from '../../components/auth/PasswordReset/PasswordReset';
import './PasswordResetPage.css';

const PasswordResetPage = () => {
  return (
    <div className="password-reset-page">
      <section className="password-reset-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <div className="password-reset-container">
                <PasswordReset />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default PasswordResetPage;

