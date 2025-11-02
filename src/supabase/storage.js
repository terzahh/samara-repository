import { supabase } from './supabase';

export const uploadFile = async (file, path) => {
  try {
    const { data, error } = await supabase.storage
      .from('research-files')
      .upload(path, file);
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateFile = async (file, path) => {
  try {
    const { data, error } = await supabase.storage
      .from('research-files')
      .update(path, file);
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteFile = async (path) => {
  try {
    const { error } = await supabase.storage
      .from('research-files')
      .remove([path]);
    
    if (error) throw error;
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