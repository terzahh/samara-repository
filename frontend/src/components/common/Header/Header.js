import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Form, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../hooks/useAuth';
import { getUserProfile } from '../../../supabase/database';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, role, isAdmin, isDepartmentHead, isUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const loadUserAvatar = async () => {
      if (user?.id && isDepartmentHead()) {
        try {
          const profile = await getUserProfile(user.id);
          if (profile?.avatar_url) {
            // Ensure the URL is accessible
            const img = new Image();
            img.onload = () => {
              setAvatarUrl(profile.avatar_url);
            };
            img.onerror = () => {
              console.warn('Avatar image failed to load:', profile.avatar_url);
              setAvatarUrl('');
            };
            img.src = profile.avatar_url;
          }
        } catch (error) {
          console.error('Error loading avatar:', error);
        }
      }
    };
    
    loadUserAvatar();
  }, [user?.id, isDepartmentHead]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
      window.location.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const isActive = (path) => location.pathname === path;

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
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
              <Nav.Link as={Link} to="/" className={isActive('/') ? 'active' : ''}>Home</Nav.Link>
              <Nav.Link as={Link} to="/browse" className={isActive('/browse') ? 'active' : ''}>Browse</Nav.Link>
              <Nav.Link as={Link} to="/colleges" className={isActive('/colleges') ? 'active' : ''}>Colleges</Nav.Link>
              <Nav.Link as={Link} to="/about" className={isActive('/about') ? 'active' : ''}>About</Nav.Link>
              <Nav.Link as={Link} to="/help" className={isActive('/help') ? 'active' : ''}>Help</Nav.Link>
              {isAuthenticated && (
                <Nav.Link as={Link} to={getDashboardLink()} className={isActive(getDashboardLink()) ? 'active' : ''}>Dashboard</Nav.Link>
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
                  <span className="d-flex align-items-center">
                    {isDepartmentHead() && avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profile" 
                        className="user-avatar me-2"
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="me-1" />
                    )}
                    {user?.displayName || user?.email || 'User'}
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