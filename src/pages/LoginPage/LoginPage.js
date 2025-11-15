import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm/LoginForm';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="login-page">
      
      <section className="login-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <div className="login-container">
                <div className="text-center mb-4">
                  <h2 className="login-title">Welcome Back</h2>
                  <p className="login-subtitle">Sign in to access the repository</p>
                </div>
                
                <LoginForm />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      
    </div>
  );
};

export default LoginPage;