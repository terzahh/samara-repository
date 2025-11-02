import { supabase } from './supabase';

export const loginUser = async (email, password) => {
  try {
    console.log('Attempting login for:', email);
    const overallStart = Date.now();
    
    // Fast-fail if offline
    if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) {
      throw new Error('You appear to be offline. Please check your internet connection and try again.');
    }

    // Quick connectivity probe to Supabase Auth endpoint (health first, then settings with anon key)
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      let probe = await fetch(`${supabaseUrl}/auth/v1/health`, {
        method: 'GET',
        headers: {
          apikey: supabaseAnonKey || ''
        },
        signal: controller.signal
      });
      if (probe.status === 404 || probe.status === 401 || probe.status === 403) {
        // Fallback to settings with anon key header; some regions require apikey
        probe = await fetch(`${supabaseUrl}/auth/v1/settings`, {
          method: 'GET',
          headers: {
            apikey: supabaseAnonKey || ''
          },
          signal: controller.signal
        });
      }
      clearTimeout(timeoutId);
      // Treat 2xx, 3xx, 401, 403, 404 as "reachable"; only warn on 5xx
      if (probe.status >= 500) {
        console.warn('Supabase auth probe returned server error status:', probe.status);
      }
    } catch (probeError) {
      console.error('Unable to reach Supabase Auth endpoint:', probeError);
      throw new Error('Cannot reach authentication server. Check REACT_APP_SUPABASE_URL and your network/firewall.');
    }

    // Attempt sign in (let the SDK handle its own timeouts/errors)
    
    let data, error;
    try {
      const signInStart = Date.now();
      ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
      console.log('signInWithPassword response after', Date.now() - signInStart, 'ms:', data, error);
    } catch (sdkError) {
      console.error('signInWithPassword exception:', sdkError);
      throw sdkError;
    }
    
    if (error) {
      console.error('Supabase auth error:', error);
      throw error;
    }
    
    console.log('Auth successful, fetching user data...');
    
    // Get user role from database
    if (data.user) {
      // By default, skip profile fetch to avoid blocking login. Enable by setting
      // REACT_APP_ENABLE_PROFILE_FETCH=true in your environment.
      if (process.env.REACT_APP_ENABLE_PROFILE_FETCH !== 'true') {
        return {
          ...data.user,
          role: 'user',
          displayName: data.user.user_metadata?.display_name || data.user.email
        };
      }
      const profileStart = Date.now();
      const userProfilePromise = supabase
        .from('users')
        .select(`
          id, 
          email, 
          display_name, 
          role_id,
          roles(name)
        `)
        .eq('id', data.user.id)
        .single();

      let userData, userError;
      try {
        ({ data: userData, error: userError } = await Promise.race([
          userProfilePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Fetching user profile timed out after 15 seconds.')), 15000))
        ]));
      } catch (profileErr) {
        console.warn('User profile fetch exception or timeout after', Date.now() - profileStart, 'ms:', profileErr);
        console.warn('Proceeding with minimal user data to avoid blocking login.');
        return {
          ...data.user,
          role: 'user',
          displayName: data.user.user_metadata?.display_name || data.user.email
        };
      }
      
      if (userError) {
        console.warn('Error fetching user role:', userError);
        console.warn('Attempting to auto-create user profile...');

        // Try to create a minimal user profile so login can proceed next time
        try {
          // Get role id for 'user' (best-effort with timeout)
          const getRole = supabase
            .from('roles')
            .select('id')
            .eq('name', 'user')
            .single();
          let roleId = null;
          try {
            const roleRes = await Promise.race([
              getRole,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Role lookup timed out.')), 7000))
            ]);
            roleId = roleRes?.data?.id || null;
          } catch (e) {
            console.warn('Role lookup failed, proceeding without role id:', e?.message || e);
          }

          const insertProfile = supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              display_name: data.user.user_metadata?.display_name || null,
              role_id: roleId
            }, { onConflict: 'id' });

          await Promise.race([
            insertProfile,
            new Promise((_, reject) => setTimeout(() => reject(new Error('User profile upsert timed out.')), 7000))
          ]);

          // Try to refetch profile quickly (best-effort)
          try {
            const refetch = await Promise.race([
              supabase
                .from('users')
                .select(`id, email, display_name, role_id, roles(name)`).eq('id', data.user.id).single(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Refetch timed out.')), 7000))
            ]);
            if (refetch?.data) {
              console.log('Created and fetched user profile.');
              return {
                ...data.user,
                role: refetch.data.roles?.name || 'user',
                displayName: refetch.data.display_name || data.user.user_metadata?.display_name || data.user.email
              };
            }
          } catch (e) {
            console.warn('Refetch after upsert failed:', e?.message || e);
          }
        } catch (createErr) {
          console.warn('Auto-create user profile failed:', createErr?.message || createErr);
        }

        // As a final fallback, proceed with minimal user object
        console.warn('Proceeding with minimal user data to avoid blocking login.');
        return {
          ...data.user,
          role: 'user',
          displayName: data.user.user_metadata?.display_name || data.user.email
        };
      }
      
      console.log('User data fetched successfully after', Date.now() - profileStart, 'ms:', userData);
      
      return {
        ...data.user,
        role: userData.roles.name,
        displayName: userData.display_name
      };
    }
    
    console.log('Login flow completed in', Date.now() - overallStart, 'ms');
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (email, password, displayName, role = 'user') => {
  try {
    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });
    
    if (error) throw error;
    
    // Get role ID from database
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();
    
    if (roleError) throw roleError;
    
    // Create user record in database
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          display_name: displayName,
          role_id: roleData.id
        });
      
      if (insertError) throw insertError;
    }
    
    return {
      ...data.user,
      role,
      displayName
    };
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return true;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // If profile fetch is disabled (same flag as login), return minimal user
    if (process.env.REACT_APP_ENABLE_PROFILE_FETCH !== 'true') {
      return {
        ...user,
        role: 'user',
        displayName: user.user_metadata?.display_name || user.email
      };
    }

    // Get user role from database with timeout and graceful fallback
    const profilePromise = supabase
      .from('users')
      .select(`
        id, 
        email, 
        display_name, 
        role_id,
        department_id,
        roles(name),
        departments(name)
      `)
      .eq('id', user.id)
      .single();

    let userData, userError;
    try {
      ({ data: userData, error: userError } = await Promise.race([
        profilePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Fetching current user profile timed out after 15 seconds.')), 15000))
      ]));
    } catch (e) {
      // Fallback minimal user
      return {
        ...user,
        role: 'user',
        displayName: user.user_metadata?.display_name || user.email
      };
    }

    if (userError) {
      return {
        ...user,
        role: 'user',
        displayName: user.user_metadata?.display_name || user.email
      };
    }

    return {
      ...user,
      role: userData.roles.name,
      displayName: userData.display_name,
      departmentId: userData.department_id,
      departmentName: userData.departments?.name
    };
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    throw error;
  }
};