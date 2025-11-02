import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Alert, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import { useResearch } from '../../../hooks/useResearch';
import { useAuth } from '../../../hooks/useAuth';
import { formatDate, getResearchTypeLabel } from '../../../utils/helpers';
import { ACCESS_LEVELS } from '../../../utils/constants';
import { getDownloadUrl } from '../../../services/researchService';
import CommentSection from '../CommentSection/CommentSection';
import Loading from '../../common/Loading/Loading';
import './ResearchDetail.css';

const ResearchDetail = () => {
  const { id } = useParams();
  const { currentResearch, loading, fetchResearchById, fetchComments } = useResearch();
  const { isAuthenticated, role } = useAuth();
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchResearchById(id)
        .then(() => {
          fetchComments(id);
        })
        .catch(error => {
          console.error('Error fetching research:', error);
          setError('Failed to load research. Please try again.');
        });
    }
  }, [id, fetchResearchById, fetchComments]);
  
  const getAccessLevelBadgeVariant = (accessLevel) => {
    return accessLevel === ACCESS_LEVELS.PUBLIC ? 'success' : 'warning';
  };
  
  const getAccessLevelText = (accessLevel) => {
    return accessLevel === ACCESS_LEVELS.PUBLIC ? 'Public' : 'Restricted';
  };
  
  const canAccess = () => {
    if (!currentResearch) return false;
    
    // Public research can be accessed by anyone
    if (currentResearch.access_level === ACCESS_LEVELS.PUBLIC) return true;
    
    // Restricted research requires authentication
    return isAuthenticated;
  };
  
  const canComment = () => {
    if (!isAuthenticated) return false;
    
    // Public research allows comments from all authenticated users
    if (currentResearch.access_level === ACCESS_LEVELS.PUBLIC) return true;
    
    // Restricted research allows comments from all authenticated users
    return true;
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentResearch.title,
        text: currentResearch.abstract,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  const handleDownload = async () => {
    if (!currentResearch.file_url) return;
    
    setDownloading(true);
    
    try {
      const downloadUrl = await getDownloadUrl(currentResearch);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = currentResearch.file_name || 'research.pdf';
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
  
  if (loading) {
    return <Loading message="Loading research details..." />;
  }
  
  if (error || !currentResearch) {
    return (
      <Alert variant="danger">
        {error || 'Research not found.'}
      </Alert>
    );
  }
  
  if (!canAccess()) {
    return (
      <Alert variant="warning">
        This research is restricted. Please <a href="/login">log in</a> to access it.
      </Alert>
    );
  }
  
  return (
    <div className="research-detail">
      <Card className="research-detail-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <Badge bg="info" className="type-badge me-2">
              {getResearchTypeLabel(currentResearch.type)}
            </Badge>
            <Badge bg={getAccessLevelBadgeVariant(currentResearch.access_level)}>
              {getAccessLevelText(currentResearch.access_level)}
            </Badge>
          </div>
          
          <div className="research-actions">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleShare}
              className="me-2"
            >
              <FontAwesomeIcon icon={faShare} className="me-1" />
              Share
            </Button>
            
            {currentResearch.file_url && (
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
        </Card.Header>
        
        <Card.Body>
          <Card.Title as="h1" className="research-title">
            {currentResearch.title}
          </Card.Title>
          
          <Card.Subtitle className="mb-3 research-author">
            By {currentResearch.author}
          </Card.Subtitle>
          
          <Row className="research-meta mb-4">
            <Col md={6}>
              <p><strong>Department:</strong> {currentResearch.departments?.name}</p>
              <p><strong>Year:</strong> {currentResearch.year}</p>
            </Col>
            <Col md={6}>
              <p><strong>Submitted:</strong> {formatDate(currentResearch.created_at)}</p>
              <p><strong>Keywords:</strong> {currentResearch.keywords}</p>
            </Col>
          </Row>
          
          <div className="research-abstract">
            <h4>Abstract</h4>
            <p>{currentResearch.abstract}</p>
          </div>
        </Card.Body>
        
        <Card.Footer className="d-flex justify-content-between align-items-center">
          <div>
            {canComment() && (
              <Button 
                variant="outline-primary" 
                onClick={() => setShowComments(!showComments)}
              >
                <FontAwesomeIcon icon={faComment} className="me-2" />
                {showComments ? 'Hide' : 'Show'} Comments
              </Button>
            )}
          </div>
          
          <small className="text-muted">
            Last updated: {formatDate(currentResearch.updated_at)}
          </small>
        </Card.Footer>
      </Card>
      
      {showComments && canComment() && (
        <div className="mt-4">
          <CommentSection researchId={currentResearch.id} />
        </div>
      )}
    </div>
  );
};

export default ResearchDetail;