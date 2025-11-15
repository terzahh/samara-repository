import JSZip from 'jszip';
import { supabaseForCustomAuth } from './supabase';
import { getAllResearch } from './database';

// Export all data from Supabase tables
const exportTableData = async (tableName) => {
  try {
    const { data, error } = await supabaseForCustomAuth
      .from(tableName)
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error exporting ${tableName}:`, error);
    return [];
  }
};

// Create backup file
export const createBackup = async (progressCallback) => {
  const zip = new JSZip();
  const metadata = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    tables: []
  };
  
  const tables = [
    'users',
    'research',
    'departments',
    'roles',
    'comments',
    'bookmarks',
    'downloads',
    'contact_messages',
    'user_profiles',
    'system_settings'
  ];
  
  let progress = 0;
  const totalSteps = tables.length + 1; // +1 for metadata
  
  // Export each table
  for (let i = 0; i < tables.length; i++) {
    const tableName = tables[i];
    progressCallback(Math.round((i / totalSteps) * 100));
    
    try {
      const data = await exportTableData(tableName);
      if (data.length > 0) {
        zip.file(`${tableName}.json`, JSON.stringify(data, null, 2));
        metadata.tables.push({
          name: tableName,
          count: data.length
        });
      }
    } catch (error) {
      console.error(`Error exporting ${tableName}:`, error);
    }
  }
  
  // Add metadata
  progressCallback(Math.round(((tables.length) / totalSteps) * 100));
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));
  
  // Generate ZIP file
  progressCallback(100);
  const blob = await zip.generateAsync({ type: 'blob' });
  
  return blob;
};

// Restore backup from file
export const restoreBackup = async (file, progressCallback) => {
  const zip = new JSZip();
  const zipData = await zip.loadAsync(file);
  
  // Read metadata
  const metadataFile = zipData.file('metadata.json');
  if (!metadataFile) {
    throw new Error('Invalid backup file: metadata.json not found');
  }
  
  const metadata = JSON.parse(await metadataFile.async('string'));
  progressCallback(10);
  
  // Validate backup version
  if (metadata.version !== '1.0') {
    throw new Error(`Unsupported backup version: ${metadata.version}`);
  }
  
  // Get list of table files
  const tableFiles = Object.keys(zipData.files).filter(
    name => name.endsWith('.json') && name !== 'metadata.json'
  );
  
  const totalSteps = tableFiles.length;
  let currentStep = 0;
  
  // Restore each table
  for (const fileName of tableFiles) {
    const tableName = fileName.replace('.json', '');
    currentStep++;
    
    try {
      const fileContent = await zipData.file(fileName).async('string');
      const data = JSON.parse(fileContent);
      
      if (data.length === 0) {
        progressCallback(Math.round((currentStep / totalSteps) * 90) + 10);
        continue;
      }
      
      // Insert data in batches to avoid timeout
      const batchSize = 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        // Keep id for upsert to work properly
        const { error } = await supabaseForCustomAuth
          .from(tableName)
          .upsert(batch, { onConflict: 'id' });
        
        if (error) {
          console.error(`Error restoring ${tableName} batch:`, error);
          // Continue with next batch instead of failing completely
        }
      }
      
      progressCallback(Math.round((currentStep / totalSteps) * 90) + 10);
    } catch (error) {
      console.error(`Error restoring ${tableName}:`, error);
      throw new Error(`Failed to restore ${tableName}: ${error.message}`);
    }
  }
  
  progressCallback(100);
};

