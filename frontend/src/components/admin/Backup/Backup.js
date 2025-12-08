import React, { useState } from 'react';
import { Card, Button, Alert, ProgressBar, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUpload, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { createBackup, restoreBackup } from '../../../supabase/backup';
import Loading from '../../common/Loading/Loading';
import './Backup.css';

const Backup = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleCreateBackup = async () => {
    setLoading(true);
    setProgress(0);
    setError('');
    setSuccess('');
    
    try {
      // Create backup with progress callback
      const progressCallback = (progress) => {
        setProgress(progress);
      };
      
      const backupBlob = await createBackup(progressCallback);
      
      // Create download link
      const url = URL.createObjectURL(backupBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `samara-repository-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('Backup created and downloaded successfully!');
    } catch (error) {
      console.error('Error creating backup:', error);
      setError(error.message || 'Failed to create backup. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };
  
  const handleRestoreBackup = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Confirm restore action
    if (!window.confirm('Are you sure you want to restore from this backup? This will replace all current data. This action cannot be undone.')) {
      event.target.value = '';
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setError('');
    setSuccess('');
    
    try {
      // Restore backup with progress callback
      const progressCallback = (progress) => {
        setProgress(progress);
      };
      
      await restoreBackup(file, progressCallback);
      
      setSuccess('Backup restored successfully! The page will reload in 3 seconds.');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('Error restoring backup:', error);
      setError(error.message || 'Failed to restore backup. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
      // Reset the file input
      event.target.value = '';
    }
  };
  
  return (
    <div className="backup">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Backup & Restore</h3>
      </div>
      
      <Card className="backup-card mb-4">
        <Card.Header as="h5">
          <FontAwesomeIcon icon={faDatabase} className="me-2" />
          System Backup
        </Card.Header>
        <Card.Body>
          <p className="mb-4">
            Create a backup of all research documents, user data, and system settings.
            It's recommended to create regular backups to prevent data loss.
          </p>
          
          {loading && progress > 0 && (
            <div className="mb-4">
              <ProgressBar now={progress} label={`${progress}%`} />
            </div>
          )}
          
          <Button 
            variant="primary" 
            onClick={handleCreateBackup}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            {loading ? 'Creating Backup...' : 'Create Backup'}
          </Button>
        </Card.Body>
      </Card>
      
      <Card className="backup-card">
        <Card.Header as="h5">
          <FontAwesomeIcon icon={faUpload} className="me-2" />
          System Restore
        </Card.Header>
        <Card.Body>
          <p className="mb-4">
            Restore the system from a previous backup. This will replace all current data
            with the data from the backup file.
          </p>
          
          <Alert variant="warning">
            <strong>Warning:</strong> Restoring from a backup will permanently replace all current data.
            This action cannot be undone.
          </Alert>
          
          {loading && progress > 0 && (
            <div className="mb-4">
              <ProgressBar now={progress} label={`${progress}%`} />
            </div>
          )}
          
          <div className="mb-3">
            <Form.Group controlId="backupFile">
              <Form.Label>Select Backup File</Form.Label>
              <Form.Control
                type="file"
                accept=".zip"
                onChange={handleRestoreBackup}
                disabled={loading}
              />
            </Form.Group>
          </div>
          
          <Button 
            variant="danger" 
            disabled={loading}
          >
            <FontAwesomeIcon icon={faUpload} className="me-2" />
            {loading ? 'Restoring Backup...' : 'Restore Backup'}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Backup;