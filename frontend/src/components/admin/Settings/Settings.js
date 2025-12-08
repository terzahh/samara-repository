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
          
          // Map snake_case keys to camelCase and filter out duplicates
          // IMPORTANT: Prefer snake_case from database (this is what we save now)
          const mappedSettings = {};
          const keyMapping = {
            'system_name': 'systemName',
            'allow_public_registration': 'allowPublicRegistration',
            'require_approval_for_public': 'requireApprovalForPublic',
            'max_file_size': 'maxFileSize',
            'allowed_file_types': 'allowedFileTypes',
            'maintenance_mode': 'maintenanceMode',
            'maintenance_message': 'maintenanceMessage',
            'allow_guest_comments': 'allowGuestComments'
          };
          
          // First pass: map snake_case to camelCase (these take priority - what we save now)
          for (const [key, value] of Object.entries(systemSettings)) {
            if (keyMapping[key]) {
              const camelKey = keyMapping[key];
              mappedSettings[camelKey] = value;
            }
          }
          
          // Second pass: add any remaining camelCase keys (legacy, only if snake_case doesn't exist)
          for (const [key, value] of Object.entries(systemSettings)) {
            if (!key.includes('_') && !(key in mappedSettings)) {
              // Already camelCase and not already mapped, use it directly
              mappedSettings[key] = value;
            }
          }
          
          // Ensure all settings have default values if not present
          setSettings(prev => {
            // Start with defaults, then override with database values
            const merged = {
              systemName: 'Samara University Institutional Repository',
              allowPublicRegistration: true,
              requireApprovalForPublic: true,
              maxFileSize: 10,
              allowedFileTypes: ['pdf', 'doc', 'docx'],
              maintenanceMode: false,
              maintenanceMessage: 'System is under maintenance. Please try again later.',
              allowGuestComments: false,
              ...mappedSettings  // Database values override defaults
            };
            
            // Helper function to safely convert to boolean
            const toBoolean = (val) => {
              if (val === undefined || val === null) return false;
              if (typeof val === 'boolean') return val;
              if (typeof val === 'string') {
                const lower = val.toLowerCase().trim();
                return lower === 'true' || lower === '1';
              }
              return false; // Default to false for any other type
            };
            
            // Ensure boolean settings are explicitly boolean
            merged.maintenanceMode = toBoolean(merged.maintenanceMode);
            merged.allowPublicRegistration = toBoolean(merged.allowPublicRegistration);
            merged.requireApprovalForPublic = toBoolean(merged.requireApprovalForPublic);
            merged.allowGuestComments = toBoolean(merged.allowGuestComments);
            
            return merged;
          });
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
    const newValue = type === 'checkbox' ? checked : value;
    
    // For maintenanceMode checkbox, ensure it's a boolean
    if (name === 'maintenanceMode' && type === 'checkbox') {
      setSettings(prev => ({
        ...prev,
        [name]: checked === true  // Explicitly ensure boolean true/false
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
  };
  
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
                             try {
         // Define the valid camelCase keys we want to save (exclude snake_case duplicates)
        const validKeys = [
          'systemName',
          'allowPublicRegistration',
          'requireApprovalForPublic',
          'maxFileSize',
          'allowedFileTypes',
          'maintenanceMode',
          'maintenanceMessage',
          'allowGuestComments'
        ];
        
        // Update each setting - only save valid camelCase keys
        for (const key of validKeys) {
          if (!(key in settings)) continue;
          
          let value = settings[key];
          
          // Ensure boolean values are actual booleans before saving
          if (key === 'maintenanceMode' || key === 'allowPublicRegistration' || 
              key === 'requireApprovalForPublic' || key === 'allowGuestComments') {
            // Convert to strict boolean - only true if explicitly true
            if (typeof value !== 'boolean') {
              if (typeof value === 'string') {
                value = value.toLowerCase().trim() === 'true' || value.trim() === '1';
              } else {
                value = false; // Default to false for any other type
              }
            }
          }
          
          try {
            // allowedFileTypes is already an array, pass it directly
            // boolean values will be converted to strings in updateSystemSetting
            await updateSystemSetting(key, value);
          } catch (err) {
            console.error(`Error saving ${key}:`, err);
            throw err;
          }
        }
       
               setSuccess('Settings saved successfully!');
        
        // Small delay to ensure database write is complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Reload settings to ensure UI is in sync (using same mapping logic as initial load)
        const systemSettings = await getSystemSettings();
        
        // Apply same mapping logic as in useEffect
        const mappedSettings = {};
        const keyMapping = {
          'system_name': 'systemName',
          'allow_public_registration': 'allowPublicRegistration',
          'require_approval_for_public': 'requireApprovalForPublic',
          'max_file_size': 'maxFileSize',
          'allowed_file_types': 'allowedFileTypes',
          'maintenance_mode': 'maintenanceMode',
          'maintenance_message': 'maintenanceMessage',
          'allow_guest_comments': 'allowGuestComments'
        };
        
        // First pass: map snake_case to camelCase (these take priority - what we save now)
        for (const [key, value] of Object.entries(systemSettings)) {
          if (keyMapping[key]) {
            const camelKey = keyMapping[key];
            mappedSettings[camelKey] = value;
          }
        }
        
        // Second pass: add any remaining camelCase keys (legacy, only if snake_case doesn't exist)
        for (const [key, value] of Object.entries(systemSettings)) {
          if (!key.includes('_') && !(key in mappedSettings)) {
            // Already camelCase and not already mapped, use it directly
            mappedSettings[key] = value;
          }
        }
        
        // Helper function to safely convert to boolean
        const toBoolean = (val) => {
          if (val === undefined || val === null) return false;
          if (typeof val === 'boolean') return val;
          if (typeof val === 'string') {
            const lower = val.toLowerCase().trim();
            return lower === 'true' || lower === '1';
          }
          return false; // Default to false for any other type
        };
        
        setSettings(prev => {
          // Start with current state, then override with fresh database values
          const updated = {
            ...prev,
            ...mappedSettings
          };
          
          // Ensure boolean settings are explicitly boolean
          updated.maintenanceMode = toBoolean(updated.maintenanceMode);
          updated.allowPublicRegistration = toBoolean(updated.allowPublicRegistration);
          updated.requireApprovalForPublic = toBoolean(updated.requireApprovalForPublic);
          updated.allowGuestComments = toBoolean(updated.allowGuestComments);
          
          return updated;
        });

        // Dispatch custom event to notify other components that maintenance mode may have changed
        if (validKeys.includes('maintenanceMode')) {
          window.dispatchEvent(new CustomEvent('maintenanceModeChanged'));
        }
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
                id="maintenanceModeCheckbox"
                name="maintenanceMode"
                label="Enable Maintenance Mode"
                checked={settings.maintenanceMode === true}
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