import { 
  addResearch, 
  updateResearch, 
  deleteResearch, 
  addComment 
} from '../supabase/database';
import { uploadFile, updateFile, deleteFile, createSignedUrl } from '../supabase/storage';
import { supabase } from '../supabase/supabase';

export const createResearch = async (researchData, file) => {
  try {
    let fileUrl = '';
    let filePath = '';
    
    // Upload file if provided
    if (file) {
      filePath = `research/${Date.now()}_${file.name}`;
      const fileData = await uploadFile(file, filePath);
      
      // Get signed URL for restricted files
      if (researchData.access_level === 'restricted') {
        fileUrl = await createSignedUrl(filePath, 31536000); // 1 year expiry
      } else {
        // For public files, use the public URL
        const { data } = supabase.storage.from('research-files').getPublicUrl(filePath);
        fileUrl = data.publicUrl;
      }
      
      researchData.file_url = fileUrl;
      researchData.file_name = file.name;
      researchData.file_path = filePath;
    }
    
    const result = await addResearch(researchData);
    return result;
  } catch (error) {
    throw error;
  }
};

export const editResearch = async (id, researchData, file) => {
  try {
    let fileUrl = researchData.file_url || '';
    let filePath = researchData.file_path || '';
    
    // Upload new file if provided
    if (file) {
      // Delete old file if exists
      if (researchData.file_path) {
        await deleteFile(researchData.file_path);
      }
      
      filePath = `research/${Date.now()}_${file.name}`;
      const fileData = await updateFile(file, filePath);
      
      // Get signed URL for restricted files
      if (researchData.access_level === 'restricted') {
        fileUrl = await createSignedUrl(filePath, 31536000); // 1 year expiry
      } else {
        // For public files, use the public URL
        const { data } = supabase.storage.from('research-files').getPublicUrl(filePath);
        fileUrl = data.publicUrl;
      }
      
      researchData.file_url = fileUrl;
      researchData.file_name = file.name;
      researchData.file_path = filePath;
    }
    
    const result = await updateResearch(id, researchData);
    return result;
  } catch (error) {
    throw error;
  }
};

export const removeResearch = async (research) => {
  try {
    // Delete file if exists
    if (research.file_path) {
      await deleteFile(research.file_path);
    }
    
    await deleteResearch(research.id);
    return research.id;
  } catch (error) {
    throw error;
  }
};

export const createComment = async (researchId, commentData) => {
  try {
    const result = await addComment(commentData);
    return result;
  } catch (error) {
    throw error;
  }
};

export const getDownloadUrl = async (research) => {
  try {
    if (research.access_level === 'public') {
      // For public files, return the public URL
      const { data } = supabase.storage.from('research-files').getPublicUrl(research.file_path);
      return data.publicUrl;
    } else {
      // For restricted files, create a new signed URL
      return await createSignedUrl(research.file_path, 3600); // 1 hour expiry
    }
  } catch (error) {
    throw error;
  }
};
