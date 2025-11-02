import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './SearchBar.css';

const SearchBar = ({ onSearch, initialValue = '', placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };
  
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <Form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-container">
        <Form.Control
          type="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          className="search-input"
        />
        <Button variant="primary" type="submit" className="search-button">
          <FontAwesomeIcon icon={faSearch} />
        </Button>
      </div>
    </Form>
  );
};

export default SearchBar;