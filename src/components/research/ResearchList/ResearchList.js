import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Button, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'react-router-dom';
import ResearchCard from '../ResearchCard/ResearchCard';
import SearchBar from '../SearchBar/SearchBar';
import FilterPanel from '../FilterPanel/FilterPanel';
import { useResearch } from '../../../hooks/useResearch';
import { usePagination } from '../../../hooks/usePagination';
import { useAuth } from '../../../hooks/useAuth';
import { ACCESS_LEVELS } from '../../../utils/constants';
import Loading from '../../common/Loading/Loading';
import './ResearchList.css';

const ResearchList = () => {
  const { 
    researchList, 
    loading, 
    searchTerm, 
    filters, 
    totalPages,
    fetchResearchList, 
    setSearchTerm, 
    setFilters 
  } = useResearch();
  
  const { isAuthenticated } = useAuth();
  const { currentPage, goToPage } = usePagination(1, 10);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams] = useSearchParams();
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  
  // Filter research based on authentication status
  // Guests can only see public files, authenticated users can see all
  const filteredResearch = isAuthenticated 
    ? researchList 
    : researchList.filter(r => r.access_level === ACCESS_LEVELS.PUBLIC);
  
  // Read department parameter from URL and set filter
  useEffect(() => {
    const departmentParam = searchParams.get('department');
    if (departmentParam && departmentParam !== filters.department) {
      setFilters({ department: departmentParam });
    }
    // Mark filters as initialized after applying URL param (or confirming none)
    setFiltersInitialized(true);
  }, [searchParams, setFilters, filters.department]);
  
  useEffect(() => {
    if (!filtersInitialized) return;
    fetchResearchList(currentPage, true);
  }, [filtersInitialized, currentPage, searchTerm, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark search as completed when loading flips to false
  useEffect(() => {
    if (!loading) {
      setHasSearched(true);
    }
  }, [loading]);
  
  const handleSearch = (term) => {
    setSearchTerm(term);
    goToPage(1); // Reset to first page when searching
  };
  
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    goToPage(1); // Reset to first page when filtering
  };
  
  const handlePageChange = (page) => {
    goToPage(page);
  };
  
  return (
    <div className="research-list">
      <div className="search-section mb-4">
        <Row>
          <Col md={showFilters ? 8 : 12}>
            <SearchBar 
              onSearch={handleSearch} 
              initialValue={searchTerm}
              placeholder="Search research by title, author, keywords..."
            />
          </Col>
          <Col md={4} className="d-flex align-items-center justify-content-end">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowFilters(!showFilters)}
              className="filter-toggle-btn"
            >
              <FontAwesomeIcon icon={loading ? faSpinner : faFilter} className="me-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </Col>
        </Row>
        
        {showFilters && (
          <div className="mt-3">
            <FilterPanel onFilter={handleFilter} initialFilters={filters} />
          </div>
        )}
      </div>
      
      {loading && !hasSearched ? (
        <Loading message="Loading research..." />
      ) : filteredResearch.length === 0 && hasSearched ? (
        <Alert variant="info" className="text-center">
          <FontAwesomeIcon icon={faSearch} className="me-2" />
          {!isAuthenticated 
            ? 'No public research found. Please log in to access restricted research.'
            : 'No research found matching your criteria.'}
        </Alert>
      ) : (
        <>
          <Row className="research-cards">
            {filteredResearch.map(research => (
              <Col key={research.id} md={4} className="mb-4">
                <ResearchCard research={research} />
              </Col>
            ))}
          </Row>
          
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResearchList;