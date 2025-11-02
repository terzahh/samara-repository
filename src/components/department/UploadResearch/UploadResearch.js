import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { createResearch } from '../../../services/researchService';
import { RESEARCH_TYPES, ACCESS_LEVELS } from '../../../utils/constants';
import { validateResearchForm } from '../../../utils/validators';
import { getAllDepartments } from '../../../supabase/database';
import './UploadResearch.css';

const UploadResearch = ({ show, onHide, onUploadSuccess, departmentId }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    department_id: departmentId || '',
    type: RESEARCH_TYPES.THESIS,
    year: new Date().getFullYear(),
    abstract: '',
    keywords: '',
    access_level: ACCESS_LEVELS.PUBLIC
  });
  const [departments, setDepartments] = useState([]);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsData = await getAllDepartments();
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);
  
  useEffect(() => {
    if (departmentId) {
      setFormData(prev => ({ ...prev, department_id: departmentId }));
    }
  }, [departmentId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  const validateForm = () => {
    const { isValid, errors } = validateResearchForm(formData);
    setErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const researchData = {
        ...formData,
        uploaded_by: 'currentUserId', // This would come from auth context
        approved: false // Department heads can upload without approval
      };
      
      await createResearch(researchData, file);
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        department_id: departmentId || '',
        type: RESEARCH_TYPES.THESIS,
        year: new Date().getFullYear(),
        abstract: '',
        keywords: '',
        access_level: ACCESS_LEVELS.PUBLIC
      });
      setFile(null);
      
      // Close modal and notify parent
      onHide();
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error uploading research:', error);
      setError(error.message || 'Failed to upload research. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Upload Research</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter research title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="author">
            <Form.Label>Author</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter author name"
              name="author"
              value={formData.author}
              onChange={handleChange}
              isInvalid={!!errors.author}
            />
            <Form.Control.Feedback type="invalid">
              {errors.author}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="department_id">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  isInvalid={!!errors.department}
                  disabled={!!departmentId}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.department}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="type">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  isInvalid={!!errors.type}
                >
                  <option value={RESEARCH_TYPES.THESIS}>Thesis</option>
                  <option value={RESEARCH_TYPES.DISSERTATION}>Dissertation</option>
                  <option value={RESEARCH_TYPES.RESEARCH_PAPER}>Research Paper</option>
                  <option value={RESEARCH_TYPES.CONFERENCE_PAPER}>Conference Paper</option>
                  <option value={RESEARCH_TYPES.PROJECT_REPORT}>Project Report</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.type}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="year">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  isInvalid={!!errors.year}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.year}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="access_level">
                <Form.Label>Access Level</Form.Label>
                <Form.Select
                  name="access_level"
                  value={formData.access_level}
                  onChange={handleChange}
                >
                  <option value={ACCESS_LEVELS.PUBLIC}>Public</option>
                  <option value={ACCESS_LEVELS.RESTRICTED}>Restricted</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3" controlId="abstract">
            <Form.Label>Abstract</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter research abstract"
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              isInvalid={!!errors.abstract}
            />
            <Form.Control.Feedback type="invalid">
              {errors.abstract}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="keywords">
            <Form.Label>Keywords</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter keywords (comma-separated)"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              isInvalid={!!errors.keywords}
            />
            <Form.Control.Feedback type="invalid">
              {errors.keywords}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Separate keywords with commas
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="file">
            <Form.Label>Research File</Form.Label>
            <Form.Control
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.doc,.docx"
            />
            <Form.Text className="text-muted">
              Accepted formats: PDF, DOC, DOCX (Max size: 10MB)
            </Form.Text>
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Research'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Research'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadResearch;