import React, { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { formatDate, truncateText, getResearchTypeLabel } from '../../../utils/helpers';
import { ACCESS_LEVELS } from '../../../utils/constants';
import { getDownloadUrl } from '../../../services/researchService';
import './ResearchCard.css';

const ResearchCard = ({ research }) => {
  const [downloading, setDownloading] = useState(false);
  
  const getAccessLevelBadgeVariant = (accessLevel) => {
    return accessLevel === ACCESS_LEVELS.PUBLIC ? 'success' : 'warning';
  };
  
  const getAccessLevelText = (accessLevel) => {
    return accessLevel === ACCESS_LEVELS.PUBLIC ? 'Public' : 'Restricted';
  };
  
  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    
    try {
      const downloadUrl = await getDownloadUrl(research);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = research.file_name || 'research.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <Card className="research-card h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Badge bg="info" className="type-badge">
          {getResearchTypeLabel(research.type)}
        </Badge>
        <Badge bg={getAccessLevelBadgeVariant(research.access_level)}>
          {getAccessLevelText(research.access_level)}
        </Badge>
      </Card.Header>
      
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h5" className="research-title">
          <Link to={`/research/${research.id}`} className="research-link">
            {truncateText(research.title, 60)}
          </Link>
        </Card.Title>
        
        <Card.Subtitle className="mb-2 text-muted research-author">
          By {research.author}
        </Card.Subtitle>
        
        <Card.Text className="research-abstract flex-grow-1">
          {truncateText(research.abstract, 120)}
        </Card.Text>
        
        <div className="research-meta">
          <small className="text-muted">
            {research.departments?.name} • {research.year}
          </small>
        </div>
      </Card.Body>
      
      <Card.Footer className="d-flex justify-content-between align-items-center">
        <small className="text-muted">
          {formatDate(research.created_at)}
        </small>
        
        <div className="research-actions">
          <Button 
            as={Link} 
            to={`/research/${research.id}`} 
            variant="outline-primary" 
            size="sm"
            disabled={downloading}
          >
            <FontAwesomeIcon icon={faEye} className="me-1" />
            {downloading ? 'Downloading...' : 'View'}
          </Button>
          
          {research.file_url && (
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
            >
              <FontAwesomeIcon icon={faDownload} className="me-1" />
              {downloading ? 'Downloading...' : 'Download'}
            </Button>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ResearchCard;