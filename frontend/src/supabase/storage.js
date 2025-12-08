import { supabase, supabaseForCustomAuth } from './supabase';

export const uploadFile = async (file, path) => {
  try {
    // Use custom auth client for storage operations to avoid RLS issues
    const { data, error } = await supabaseForCustomAuth.storage
      .from('research-files')
      .upload(path, file);
    
    if (error) {
      console.error('Error uploading file:', error);
      if (error.message?.includes('row-level security') || error.message?.includes('permission denied')) {
        throw new Error('Storage permission denied. Please check Storage Bucket policies for research-files. See RESEARCH_RLS_FIX.md for instructions.');
      }
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateFile = async (file, path) => {
  try {
    // Use custom auth client for storage operations to avoid RLS issues
    const { data, error } = await supabaseForCustomAuth.storage
      .from('research-files')
      .update(path, file);
    
    if (error) {
      console.error('Error updating file:', error);
      if (error.message?.includes('row-level security') || error.message?.includes('permission denied')) {
        throw new Error('Storage permission denied. Please check Storage Bucket policies for research-files.');
      }
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteFile = async (path) => {
  try {
    // Use custom auth client for storage operations to avoid RLS issues
    const { error } = await supabaseForCustomAuth.storage
      .from('research-files')
      .remove([path]);
    
    if (error) {
      console.error('Error deleting file:', error);
      if (error.message?.includes('row-level security') || error.message?.includes('permission denied')) {
        throw new Error('Storage permission denied. Please check Storage Bucket policies for research-files.');
      }
      throw error;
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const getPublicUrl = (path) => {
  try {
    const { data } = supabase.storage
      .from('research-files')
      .getPublicUrl(path);
    
    return data.publicUrl;
  } catch (error) {
    throw error;
  }
};

export const createSignedUrl = async (path, expiresIn = 60) => {
  try {
    const { data, error } = await supabase.storage
      .from('research-files')
      .createSignedUrl(path, expiresIn);
    
    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    throw error;
  }
};