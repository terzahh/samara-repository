import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SignupForm from '../../components/auth/SignupForm/SignupForm';
import './SignupPage.css';

const SignupPage = () => {
  return (
    <div className="signup-page">
      
      <section className="signup-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <div className="signup-container">
                <div className="text-center mb-4">
                  <h2 className="signup-title">Create Account</h2>
                  <p className="signup-subtitle">Join the Samara University research community</p>
                </div>
                
                <SignupForm />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      
    </div>
  );
};

export default SignupPage;