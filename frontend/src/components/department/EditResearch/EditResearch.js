import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { editResearch, removeResearch } from '../../../services/researchService';
import { RESEARCH_TYPES, ACCESS_LEVELS } from '../../../utils/constants';
import { validateResearchForm } from '../../../utils/validators';
import { getAllDepartments } from '../../../supabase/database';
import './EditResearch.css';

const EditResearch = ({ show, onHide, research, onEditSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    department_id: '',
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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
    if (research) {
      setFormData({
        title: research.title || '',
        author: research.author || '',
        department_id: research.department_id || '',
        type: research.type || RESEARCH_TYPES.THESIS,
        year: research.year || new Date().getFullYear(),
        abstract: research.abstract || '',
        keywords: research.keywords || '',
        access_level: research.access_level || ACCESS_LEVELS.PUBLIC
      });
    }
  }, [research]);
  
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
    
    setLoading(true);
    setError('');
    
    try {
      const researchData = {
        ...formData,
        approved: research.approved // Keep the original approval status
      };
      
      await editResearch(research.id, researchData, file);
      
      // Reset form
      setFile(null);
      
      // Close modal and notify parent
      onHide();
      if (onEditSuccess) {
        onEditSuccess();
      }
    } catch (error) {
      console.error('Error updating research:', error);
      setError(error.message || 'Failed to update research. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setLoading(true);
    setError('');
    
    try {
      await removeResearch(research);
      
      // Close modals and notify parent
      setShowDeleteConfirm(false);
      onHide();
      if (onEditSuccess) {
        onEditSuccess();
      }
    } catch (error) {
      console.error('Error deleting research:', error);
      setError('Failed to delete research. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Research</Modal.Title>
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
                Leave empty to keep current file. Accepted formats: PDF, DOC, DOCX (Max size: 10MB)
              </Form.Text>
              {research && research.file_name && (
                <div className="mt-2">
                  <small className="text-muted">Current file: {research.file_name}</small>
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update Research'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this research? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditResearch;