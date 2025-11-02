import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import LoginForm from '../../components/auth/LoginForm/LoginForm';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="login-page">
      <Header />
      
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
                
                <div className="text-center mt-4">
                  <p>
                    Don't have an account? <Link to="/signup">Sign up</Link>
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

export default LoginPage;