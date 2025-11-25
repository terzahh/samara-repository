import {
  addResearch,
  updateResearch,
  deleteResearch,
  addComment
} from '../supabase/database';
import { uploadFile, updateFile, deleteFile, createSignedUrl } from '../supabase/storage';
import { supabase } from '../supabase/supabase';

// Import duplicate detection but make it optional
let checkForDuplicates = null;
try {
  const duplicateDetection = require('../utils/duplicateDetection');
  checkForDuplicates = duplicateDetection.checkForDuplicates;
} catch (error) {
  console.warn('Duplicate detection not available:', error.message);
}

export const createResearch = async (researchData, file) => {
  try {
    let fileUrl = '';
    let filePath = '';

    // OPTIONAL: Perform duplicate detection if available and file is provided
    if (file && checkForDuplicates) {
      try {
        console.log('Starting duplicate detection...');
        const duplicateCheck = await checkForDuplicates(
          file,
          researchData.title,
          researchData.abstract
        );

        // If duplicate is detected, throw error with detailed message
        if (duplicateCheck.isDuplicate) {
          const error = new Error(duplicateCheck.reason);
          error.duplicateInfo = {
            matchedResearch: duplicateCheck.matchedResearch,
            detectionMethod: duplicateCheck.detectionMethod,
            similarityScore: duplicateCheck.similarityScore
          };
          throw error;
        }

        // Store hash values and text content for database (if columns exist)
        const fileHash = duplicateCheck.fileHash || '';
        const textHash = duplicateCheck.textHash || '';
        const textContent = duplicateCheck.textContent || '';

        // Only add these fields if they have values
        if (fileHash) researchData.file_hash = fileHash;
        if (textHash) researchData.text_hash = textHash;
        if (textContent) researchData.text_content = textContent;

        console.log('No duplicates found. Proceeding with upload...');
      } catch (dupError) {
        // If it's a duplicate detection error, re-throw it
        if (dupError.duplicateInfo) {
          throw dupError;
        }
        // Otherwise, log and continue (don't block upload due to detection errors)
        console.warn('Duplicate detection failed, continuing with upload:', dupError.message);
      }
    }

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

    // Sanitize payload: remove unsupported 'level' column to avoid schema errors
    const payload = { ...researchData };
    const level = payload.level;
    if (level) {
      // append level tag to keywords so we keep the information searchable
      const existingKeywords = payload.keywords || '';
      const levelTag = `level:${level}`;
      // avoid duplicating tag
      if (!existingKeywords.includes(levelTag)) {
        payload.keywords = existingKeywords ? `${existingKeywords}, ${levelTag}` : levelTag;
      }
      delete payload.level;
    }

    const result = await addResearch(payload);
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

    // Sanitize payload: remove unsupported 'level' column to avoid schema errors
    const payload = { ...researchData };
    const level = payload.level;
    if (level) {
      const existingKeywords = payload.keywords || '';
      const levelTag = `level:${level}`;
      if (!existingKeywords.includes(levelTag)) {
        payload.keywords = existingKeywords ? `${existingKeywords}, ${levelTag}` : levelTag;
      }
      delete payload.level;
    }

    const result = await updateResearch(id, payload);
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
