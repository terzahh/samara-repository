import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import SignupForm from '../../components/auth/SignupForm/SignupForm';
import './SignupPage.css';

const SignupPage = () => {
  return (
    <div className="signup-page">
      <Header />
      
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
                
                <div className="text-center mt-4">
                  <p>
                    Already have an account? <Link to="/login">Login</Link>
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      
      <Footer />
    </div>
  );
};

export default SignupPage;