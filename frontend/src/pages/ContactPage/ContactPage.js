import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
  faPaperPlane,
  faGlobe,
  faShareAlt
} from '@fortawesome/free-solid-svg-icons';
import './ContactPage.css';
import { addContactMessage } from '../../supabase/database';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      // Persist the message
      await addContactMessage({
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        subject: formData.subject,
        message: formData.message
      });

      setSuccess('Thank you for contacting us! Your message has been sent.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <Container className="py-5">
        <Row>
          <Col md={12}>
            <div className="page-header text-center mb-5">
              <h1 className="page-title">Contact Us</h1>
              <p className="page-subtitle">
                Get in touch with the repository team
              </p>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={8} className="mb-4">
            <Card className="contact-form-card">
              <Card.Header as="h4">Send us a Message</Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Subject of your message"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Your message here..."
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" disabled={loading}>
                    <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="contact-info-card">
              <Card.Header as="h4">Contact Information</Card.Header>
              <Card.Body>
                <div className="contact-info-item mb-4">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
                  <div>
                    <h5>Repository Office</h5>
                    <p className="mb-0">
                      Samara University<br />
                      College of Engineering and Technology<br />
                      Department of Computer Science<br />
                      Samara, Ethiopia
                    </p>
                  </div>
                </div>

                <div className="contact-info-item mb-4">
                  <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                  <div>
                    <h5>Email</h5>
                    <p className="mb-0">
                      <a href="mailto:repository@su.edu.et">repository@su.edu.et</a>
                    </p>
                  </div>
                </div>

                <div className="contact-info-item mb-4">
                  <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                  <div>
                    <h5>Phone</h5>
                    <p className="mb-0">+251-XXX-XXX-XXXX</p>
                  </div>
                </div>

                <div className="social-media mt-4">
                  <h5>Follow Us</h5>
                  <div className="social-icons">
                    <a href="#" className="social-icon" aria-label="Facebook">
                      <FontAwesomeIcon icon={faShareAlt} />
                    </a>
                    <a href="#" className="social-icon" aria-label="Twitter">
                      <FontAwesomeIcon icon={faGlobe} />
                    </a>
                    <a href="#" className="social-icon" aria-label="LinkedIn">
                      <FontAwesomeIcon icon={faShareAlt} />
                    </a>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactPage;

