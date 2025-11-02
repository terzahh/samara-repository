import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../hooks/useAuth';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, role, isAdmin, isDepartmentHead, isUser } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm)}`);
    }
  };
  
  const getDashboardLink = () => {
    if (isAdmin()) return '/admin';
    if (isDepartmentHead()) return '/department';
    if (isUser()) return '/user';
    return '/browse';
  };
  
  const handleLogout = async () => {
    const { logout } = await import('../../../services/authService');
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <header className="header">
      <Navbar bg="white" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <div className="logo-container me-2">
              <div className="logo-circle">
                <span className="logo-text">SU</span>
              </div>
            </div>
            <span className="brand-text">Samara Repository</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/browse">Browse</Nav.Link>
              {isAuthenticated && (
                <Nav.Link as={Link} to={getDashboardLink()}>Dashboard</Nav.Link>
              )}
            </Nav>
            
            <Form className="d-flex me-3" onSubmit={handleSearch}>
              <Form.Control
                type="search"
                placeholder="Search research..."
                className="me-2 search-input"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-primary" type="submit" className="search-btn">
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </Form>
            
            <Nav>
              {isAuthenticated ? (
                <NavDropdown title={
                  <span>
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    {user?.user_metadata?.display_name || user?.email || 'User'}
                  </span>
                } id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;