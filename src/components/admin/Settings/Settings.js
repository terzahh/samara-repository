import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { getSystemSettings, updateSystemSetting } from '../../../supabase/database';
import Loading from '../../common/Loading/Loading';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    systemName: 'Samara University Institutional Repository',
    allowPublicRegistration: true,
    requireApprovalForPublic: true,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx'],
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
    allowGuestComments: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const systemSettings = await getSystemSettings();
        setSettings(prev => ({
          ...prev,
          ...systemSettings
        }));
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to fetch settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        await updateSystemSetting(key, value.toString());
      }
      
      setSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <Loading message="Loading settings..." />;
  }
  
  return (
    <div className="settings">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>System Settings</h3>
      </div>
      
      <Card className="settings-card">
        <Card.Header as="h5">General Settings</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSaveSettings}>
            <Form.Group className="mb-3" controlId="systemName">
              <Form.Label>System Name</Form.Label>
              <Form.Control
                type="text"
                name="systemName"
                value={settings.systemName}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="allowPublicRegistration">
              <Form.Check
                type="checkbox"
                name="allowPublicRegistration"
                label="Allow Public Registration"
                checked={settings.allowPublicRegistration}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="requireApprovalForPublic">
              <Form.Check
                type="checkbox"
                name="requireApprovalForPublic"
                label="Require Approval for Public Access"
                checked={settings.requireApprovalForPublic}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="allowGuestComments">
              <Form.Check
                type="checkbox"
                name="allowGuestComments"
                label="Allow Guests to Comment on Public Research"
                checked={settings.allowGuestComments}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="maxFileSize">
              <Form.Label>Maximum File Size (MB)</Form.Label>
              <Form.Control
                type="number"
                name="maxFileSize"
                value={settings.maxFileSize}
                onChange={handleChange}
                min="1"
                max="100"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="allowedFileTypes">
              <Form.Label>Allowed File Types</Form.Label>
              <Form.Control
                type="text"
                name="allowedFileTypes"
                value={Array.isArray(settings.allowedFileTypes) 
                  ? settings.allowedFileTypes.join(', ') 
                  : settings.allowedFileTypes
                }
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  allowedFileTypes: e.target.value.split(',').map(type => type.trim())
                }))}
                placeholder="e.g., pdf, doc, docx"
              />
              <Form.Text className="text-muted">
                Comma-separated list of file extensions
              </Form.Text>
            </Form.Group>
            
            <hr />
            
            <h5 className="mb-3">Maintenance Mode</h5>
            
            <Form.Group className="mb-3" controlId="maintenanceMode">
              <Form.Check
                type="checkbox"
                name="maintenanceMode"
                label="Enable Maintenance Mode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                When enabled, only administrators can access the system.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4" controlId="maintenanceMessage">
              <Form.Label>Maintenance Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Button variant="primary" type="submit" disabled={saving}>
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Settings;