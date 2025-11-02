import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import { RESEARCH_TYPES } from '../../../utils/constants';
import { getAllDepartments } from '../../../supabase/database';
import './FilterPanel.css';

const FilterPanel = ({ onFilter, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    department: initialFilters.department || '',
    type: initialFilters.type || '',
    year: initialFilters.year || '',
    accessLevel: initialFilters.accessLevel || 'all'
  });
  const [departments, setDepartments] = useState([]);
  
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleApplyFilters = () => {
    if (onFilter) {
      onFilter(filters);
    }
  };
  
  const handleResetFilters = () => {
    const resetFilters = {
      department: '',
      type: '',
      year: '',
      accessLevel: 'all'
    };
    setFilters(resetFilters);
    if (onFilter) {
      onFilter(resetFilters);
    }
  };
  
  // Generate year options (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i <= 10; i++) {
    yearOptions.push(currentYear - i);
  }
  
  return (
    <Card className="filter-panel">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faFilter} className="me-2" />
          Filters
        </h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6} className="mb-3">
            <Form.Group controlId="department">
              <Form.Label>Department</Form.Label>
              <Form.Select
                name="department"
                value={filters.department}
                onChange={handleChange}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={6} className="mb-3">
            <Form.Group controlId="type">
              <Form.Label>Research Type</Form.Label>
              <Form.Select
                name="type"
                value={filters.type}
                onChange={handleChange}
              >
                <option value="">All Types</option>
                <option value={RESEARCH_TYPES.THESIS}>Thesis</option>
                <option value={RESEARCH_TYPES.DISSERTATION}>Dissertation</option>
                <option value={RESEARCH_TYPES.RESEARCH_PAPER}>Research Paper</option>
                <option value={RESEARCH_TYPES.CONFERENCE_PAPER}>Conference Paper</option>
                <option value={RESEARCH_TYPES.PROJECT_REPORT}>Project Report</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={6} className="mb-3">
            <Form.Group controlId="year">
              <Form.Label>Year</Form.Label>
              <Form.Select
                name="year"
                value={filters.year}
                onChange={handleChange}
              >
                <option value="">All Years</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={6} className="mb-3">
            <Form.Group controlId="accessLevel">
              <Form.Label>Access Level</Form.Label>
              <Form.Select
                name="accessLevel"
                value={filters.accessLevel}
                onChange={handleChange}
              >
                <option value="all">All Levels</option>
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <div className="d-flex justify-content-end">
          <Button 
            variant="outline-secondary" 
            onClick={handleResetFilters}
            className="me-2"
          >
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Reset
          </Button>
          <Button variant="primary" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FilterPanel;