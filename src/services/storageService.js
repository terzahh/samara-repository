import { uploadFile, deleteFile, getPublicUrl, createSignedUrl } from '../supabase/storage';

export const uploadDocument = async (file, path) => {
  return await uploadFile(file, path);
};

export const deleteDocument = async (path) => {
  return await deleteFile(path);
};

export const getDocumentUrl = async (path, isPublic = false) => {
  if (isPublic) {
    return getPublicUrl(path);
  } else {
    return await createSignedUrl(path, 3600); // 1 hour expiry
  }
};