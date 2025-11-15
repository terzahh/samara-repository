import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { createResearch } from '../../../services/researchService';
import { RESEARCH_TYPES, ACCESS_LEVELS } from '../../../utils/constants';
import { validateResearchForm } from '../../../utils/validators';
import { getAllDepartments } from '../../../supabase/database';
import { useAuth } from '../../../hooks/useAuth';
import './UploadResearch.css';

const UploadResearch = ({ show, onHide, onUploadSuccess, departmentId }) => {
  const { user } = useAuth();
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
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
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
    
    // Load draft from localStorage
    const draftKey = `research_draft_${user?.id || 'anonymous'}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [user?.id]);
  
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
  
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Save draft to localStorage
      const draftKey = `research_draft_${user?.id || 'anonymous'}`;
      localStorage.setItem(draftKey, JSON.stringify(formData));
      
      setSuccessMessage('Draft saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Failed to save draft. Please try again.');
    } finally {
      setSavingDraft(false);
    }
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
    setSuccessMessage('');
    
    try {
      const researchData = {
        ...formData,
        uploaded_by: user?.id || null,
        approved: true // Auto-approve for now (can be changed based on role)
      };
      
      await createResearch(researchData, file);
      
      // Clear draft from localStorage
      const draftKey = `research_draft_${user?.id || 'anonymous'}`;
      localStorage.removeItem(draftKey);
      
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
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="outline-secondary" 
          onClick={handleSaveDraft} 
          disabled={savingDraft}
          className="me-2"
        >
          {savingDraft ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Research'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadResearch;