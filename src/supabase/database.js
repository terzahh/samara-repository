import { supabase, supabaseForCustomAuth } from './supabase';

// Research operations
export const addResearch = async (researchData) => {
  try {
    // Use custom auth client for research operations to avoid RLS issues
    const { data, error } = await supabaseForCustomAuth
      .from('research')
      .insert(researchData)
      .select();
    
    if (error) {
      console.error('Error adding research:', error);
      // If it's a 401, it's likely an RLS policy issue
      if (error.code === 'PGRST301' || error.message?.includes('permission denied') || error.message?.includes('401') || error.message?.includes('row-level security')) {
        throw new Error('Permission denied. Please check Row Level Security policies for the research table. See RESEARCH_RLS_FIX.md for instructions.');
      }
      throw error;
    }
    return data[0];
  } catch (error) {
    throw error;
  }
};

export const updateResearch = async (id, researchData) => {
  try {
    // Use custom auth client for research operations to avoid RLS issues
    const { data, error } = await supabaseForCustomAuth
      .from('research')
      .update(researchData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating research:', error);
      if (error.code === 'PGRST301' || error.message?.includes('permission denied') || error.message?.includes('401') || error.message?.includes('row-level security')) {
        throw new Error('Permission denied. Please check Row Level Security policies for the research table.');
      }
      throw error;
    }
    return data[0];
  } catch (error) {
    throw error;
  }
};

export const deleteResearch = async (id) => {
  try {
    // Use custom auth client for research operations to avoid RLS issues
    const { error } = await supabaseForCustomAuth
      .from('research')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting research:', error);
      if (error.code === 'PGRST301' || error.message?.includes('permission denied') || error.message?.includes('401') || error.message?.includes('row-level security')) {
        throw new Error('Permission denied. Please check Row Level Security policies for the research table.');
      }
      throw error;
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const getResearchById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('research')
      .select(`
        *,
        departments(name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllResearch = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    let query = supabase
      .from('research')
      .select(`
        *,
        departments(name)
      `, { count: 'exact' });
    
    // Apply filters
    if (filters.department) {
      query = query.eq('department_id', filters.department);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.year) {
      query = query.eq('year', filters.year);
    }
    
    if (filters.accessLevel && filters.accessLevel !== 'all') {
      query = query.eq('access_level', filters.accessLevel);
    }
    
    // Apply search
    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,author.ilike.%${filters.searchTerm}%,abstract.ilike.%${filters.searchTerm}%,keywords.ilike.%${filters.searchTerm}%`);
    }
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      research: data,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    throw error;
  }
};

export const searchResearch = async (searchTerm, filters = {}) => {
  try {
    let query = supabase
      .from('research')
      .select(`
        *,
        departments(name)
      `);
    
    // Apply search
    query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,abstract.ilike.%${searchTerm}%,keywords.ilike.%${searchTerm}%`);
    
    // Apply filters
    if (filters.department) {
      query = query.eq('department_id', filters.department);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.year) {
      query = query.eq('year', filters.year);
    }
    
    if (filters.accessLevel && filters.accessLevel !== 'all') {
      query = query.eq('access_level', filters.accessLevel);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

// Comment operations
export const addComment = async (commentData) => {
  try {
    // Use custom auth client for comment operations to avoid RLS issues
    const { data, error } = await supabaseForCustomAuth
      .from('comments')
      .insert(commentData)
      .select();
    
    if (error) {
      console.error('Error adding comment:', error);
      // If it's a 401, it's likely an RLS policy issue
      if (error.code === 'PGRST301' || error.message?.includes('permission denied') || error.message?.includes('401')) {
        throw new Error('Permission denied. Please check Row Level Security policies for the comments table.');
      }
      throw error;
    }
    return data[0];
  } catch (error) {
    throw error;
  }
};

export const getComments = async (researchId) => {
  try {
    // Use custom auth client to avoid RLS issues
    const { data, error } = await supabaseForCustomAuth
      .from('comments')
      .select(`
        *,
        users(display_name)
      `)
      .eq('research_id', researchId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

// User operations
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        roles(name),
        departments(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUserRole = async (userId, roleId) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role_id: roleId })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    throw error;
  }
};

// Department operations
export const getAllDepartments = async () => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getDepartmentById = async (departmentId) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', departmentId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

// Role operations
export const getAllRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

// System settings operations
export const getSystemSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*');
    
    if (error) throw error;
    
    // Convert to key-value object and parse values appropriately
    const settings = {};
    const booleanKeys = ['allow_public_registration', 'require_approval_for_public', 'maintenance_mode', 'allow_guest_comments', 'allowPublicRegistration', 'requireApprovalForPublic', 'maintenanceMode', 'allowGuestComments'];
    const arrayKeys = ['allowed_file_types', 'allowedFileTypes'];
    const numberKeys = ['max_file_size', 'maxFileSize'];
    
    data.forEach(setting => {
      let value = setting.value;
      let key = setting.key;
      
      // Parse boolean values (handle both snake_case and camelCase)
      if (booleanKeys.includes(key)) {
        // Handle various boolean representations - be strict about conversion
        if (typeof value === 'boolean') {
          // Already a boolean, keep as is
        } else if (typeof value === 'string') {
          // Convert string to boolean - only 'true' or '1' become true
          const lower = value.toLowerCase().trim();
          value = lower === 'true' || lower === '1';
        } else if (value === null || value === undefined) {
          // Default to false for null/undefined
          value = false;
        } else {
          // For any other type (number, object, etc.), default to false
          // This prevents unexpected truthy values from being converted to true
          value = false;
        }
      }
      // Parse array values
      else if (arrayKeys.includes(key)) {
        try {
          value = typeof value === 'string' ? JSON.parse(value) : value;
          if (!Array.isArray(value)) {
            value = value.split(',').map(item => item.trim());
          }
        } catch (e) {
          // If parsing fails, try splitting by comma
          value = typeof value === 'string' ? value.split(',').map(item => item.trim()) : value;
        }
      }
      // Parse number values
      else if (numberKeys.includes(key)) {
        value = typeof value === 'string' ? parseFloat(value) : value;
      }
      
      settings[key] = value;
    });
    
    return settings;
  } catch (error) {
    throw error;
  }
};

export const updateSystemSetting = async (key, value) => {
  try {
    // Convert camelCase key to snake_case for database storage
    const keyMapping = {
      'systemName': 'system_name',
      'allowPublicRegistration': 'allow_public_registration',
      'requireApprovalForPublic': 'require_approval_for_public',
      'maxFileSize': 'max_file_size',
      'allowedFileTypes': 'allowed_file_types',
      'maintenanceMode': 'maintenance_mode',
      'maintenanceMessage': 'maintenance_message',
      'allowGuestComments': 'allow_guest_comments'
    };
    
    // Convert key to snake_case if it's in the mapping, otherwise use as-is
    const dbKey = keyMapping[key] || key;
    
    // Convert value to string for storage
    let stringValue = value;
    if (typeof value === 'boolean') {
      stringValue = value.toString();
    } else if (Array.isArray(value)) {
      stringValue = JSON.stringify(value);
    } else if (typeof value === 'object') {
      stringValue = JSON.stringify(value);
    } else {
      stringValue = String(value);
    }
    
    // Check if setting exists - use maybeSingle to avoid 406 errors
    const { error: checkError } = await supabase
      .from('system_settings')
      .select('key')
      .eq('key', dbKey)
      .maybeSingle();
    
    // If there's an error and it's not "no rows found", throw it
    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`Error checking for existing setting ${dbKey}:`, checkError);
      throw checkError;
    }
    
    // Use upsert to handle both insert and update in one operation
    // This avoids the 406 error and ensures we always update the correct row
    const { error: upsertError } = await supabase
      .from('system_settings')
      .upsert(
        { key: dbKey, value: stringValue },
        { onConflict: 'key' }
      );
    
    if (upsertError) {
      console.error(`Error upserting setting ${dbKey}:`, upsertError);
      throw upsertError;
    }

    // Delete old camelCase key if it exists and is different from dbKey
    if (dbKey !== key) {
      try {
        await supabase
          .from('system_settings')
          .delete()
          .eq('key', key);
      } catch (deleteError) {
        // Ignore deletion errors, as the key might not exist
        console.warn(`Could not delete old key ${key}:`, deleteError);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating system setting ${key}:`, error);
    throw error;
  }
};

// System stats
export const getSystemStats = async () => {
  try {
    // Get research stats
    const { data: researchData, error: researchError } = await supabase
      .from('research')
      .select('type, access_level');
    
    if (researchError) throw researchError;
    
    // Get user stats
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        roles(name)
      `);
    
    if (userError) throw userError;
    
    // Get comment count - use custom auth client to avoid RLS issues
    let commentCount = 0;
    try {
      const { count, error: commentError } = await supabaseForCustomAuth
        .from('comments')
        .select('*', { count: 'exact', head: true });
      
      if (!commentError && count !== null) {
        commentCount = count;
      }
    } catch (e) {
      // Comments table might not exist, default to 0
      console.warn('Could not fetch comment count:', e);
    }
    
    // Get storage size from research-files bucket
    let storageSizeBytes = 0;
    try {
      const { data: files, error: storageError } = await supabase
        .storage
        .from('research-files')
        .list('research', {
          limit: 10000,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (!storageError && files) {
        // Calculate total size from file metadata
        // Note: Supabase storage list doesn't always return size, so we'll estimate
        // or try to get it from the research table file_path
        const { data: researchWithFiles } = await supabase
          .from('research')
          .select('file_path, file_name')
          .not('file_path', 'is', null);
        
        if (researchWithFiles) {
          // Estimate: average file size ~2MB per research item
          // In production, you'd want to track actual file sizes
          storageSizeBytes = researchWithFiles.length * 2 * 1024 * 1024; // 2MB per file estimate
        }
      }
    } catch (e) {
      console.warn('Could not calculate storage size:', e);
    }
    
    // Calculate stats
    const stats = {
      totalResearch: researchData.length,
      totalUsers: userData.length,
      adminCount: 0,
      departmentHeadCount: 0,
      userCount: 0,
      thesisCount: 0,
      dissertationCount: 0,
      researchPaperCount: 0,
      conferencePaperCount: 0,
      projectReportCount: 0,
      publicResearchCount: 0,
      restrictedResearchCount: 0,
      commentCount: commentCount,
      storageSizeBytes: storageSizeBytes
    };
    
    // Count by research type
    researchData.forEach(item => {
      switch (item.type) {
        case 'thesis':
          stats.thesisCount++;
          break;
        case 'dissertation':
          stats.dissertationCount++;
          break;
        case 'research_paper':
          stats.researchPaperCount++;
          break;
        case 'conference_paper':
          stats.conferencePaperCount++;
          break;
        case 'project_report':
          stats.projectReportCount++;
          break;
        default:
          // Unknown type, ignore
          break;
      }
      
      // Count by access level
      if (item.access_level === 'public') {
        stats.publicResearchCount++;
      } else {
        stats.restrictedResearchCount++;
      }
    });
    
    // Count by user role
    userData.forEach(item => {
      switch (item.roles.name) {
        case 'admin':
          stats.adminCount++;
          break;
        case 'department_head':
          stats.departmentHeadCount++;
          break;
        case 'user':
          stats.userCount++;
          break;
        default:
          // Unknown role, ignore
          break;
      }
    });
    
    return stats;
  } catch (error) {
    throw error;
  }
};

// Download tracking operations
export const trackDownload = async (userId, researchId) => {
  try {
    const { data, error } = await supabase
      .from('downloads')
      .insert({
        user_id: userId,
        research_id: researchId
      })
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    throw error;
  }
};

export const getUserDownloads = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('downloads')
      .select(`
        id,
        downloaded_at,
        research:research_id (
          id,
          title,
          author,
          year,
          type
        )
      `)
      .eq('user_id', userId)
      .order('downloaded_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getDownloadCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    throw error;
  }
};

// Get user's comment count
export const getUserCommentCount = async (userId) => {
  try {
    // Use custom auth client to avoid RLS issues
    const { count, error } = await supabaseForCustomAuth
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    throw error;
  }
};

// Bookmark operations
export const addBookmark = async (userId, researchId) => {
  try {
    // Use custom auth client to avoid RLS issues
    // Check if bookmark already exists
    const { data: existing } = await supabaseForCustomAuth
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('research_id', researchId)
      .maybeSingle();
    
    if (existing) {
      return existing; // Already bookmarked
    }
    
    const { data, error } = await supabaseForCustomAuth
      .from('bookmarks')
      .insert({
        user_id: userId,
        research_id: researchId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const removeBookmark = async (userId, researchId) => {
  try {
    // Use custom auth client to avoid RLS issues
    const { error } = await supabaseForCustomAuth
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('research_id', researchId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    throw error;
  }
};

export const getUserBookmarks = async (userId) => {
  try {
    // Use custom auth client to avoid RLS issues
    const { data, error } = await supabaseForCustomAuth
      .from('bookmarks')
      .select(`
        id,
        created_at,
        research:research_id (
          id,
          title,
          author,
          type,
          year,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

export const isBookmarked = async (userId, researchId) => {
  try {
    // Use custom auth client to avoid RLS issues
    const { data, error } = await supabaseForCustomAuth
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('research_id', researchId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    return false;
  }
};

// Contact messages
export const addContactMessage = async (message) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(message)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getContactMessages = async () => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

// User profiles (extra fields not stored on users table)
export const getUserProfile = async (userId) => {
  try {
    // Use custom auth client to avoid RLS issues
    const { data, error } = await supabaseForCustomAuth
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (error) {
    throw error;
  }
};

export const upsertUserProfile = async (userId, profile) => {
  try {
    const payload = { user_id: userId, ...profile };
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};