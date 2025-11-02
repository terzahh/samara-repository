import { supabase } from './supabase';

// Research operations
export const addResearch = async (researchData) => {
  try {
    const { data, error } = await supabase
      .from('research')
      .insert(researchData)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    throw error;
  }
};

export const updateResearch = async (id, researchData) => {
  try {
    const { data, error } = await supabase
      .from('research')
      .update(researchData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    throw error;
  }
};

export const deleteResearch = async (id) => {
  try {
    const { error } = await supabase
      .from('research')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    throw error;
  }
};

export const getComments = async (researchId) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users(display_name)
      `)
      .eq('research_id', researchId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
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
    
    // Convert to key-value object
    const settings = {};
    data.forEach(setting => {
      settings[setting.key] = setting.value;
    });
    
    return settings;
  } catch (error) {
    throw error;
  }
};

export const updateSystemSetting = async (key, value) => {
  try {
    const { error } = await supabase
      .from('system_settings')
      .update({ value })
      .eq('key', key);
    
    if (error) throw error;
    return true;
  } catch (error) {
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
      restrictedResearchCount: 0
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
      }
    });
    
    return stats;
  } catch (error) {
    throw error;
  }
};