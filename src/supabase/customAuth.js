import { supabase } from './supabase';

// Generate simple JWT-like token
const generateToken = (userId) => {
  const payload = { userId, timestamp: Date.now() };
  return btoa(JSON.stringify(payload));
};

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

// Store session in localStorage
const setSession = (user, token) => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const getSession = () => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  return token && user ? { token, user: JSON.parse(user) } : null;
};

const clearSession = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const loginUser = async (email, password) => {
  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        password_hash,
        display_name,
        role_id,
        department_id,
        roles(name),
        departments(name)
      `)
      .eq('email', email)
      .single();

    if (error || !user) throw new Error('Invalid credentials');

    // Verify password - direct comparison for now
    // TODO: Implement bcrypt hashing
    if (user.password_hash !== password) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.id);

    // Prepare user object
    const userObj = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.roles?.name || 'user',
      departmentId: user.department_id,
      departmentName: user.departments?.name
    };

    // Store session
    setSession(userObj, token);

    return userObj;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (email, password, displayName, role = 'user') => {
  try {
    // Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError) throw roleError;

    // Store password as-is for now
    // TODO: Implement bcrypt.hash(password, 10)
    const passwordHash = password;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Insert user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        display_name: displayName,
        role_id: roleData.id
      })
      .select(`
        id,
        email,
        display_name,
        role_id,
        department_id,
        roles(name),
        departments(name)
      `)
      .single();

    if (error) throw error;

    // Generate token
    const token = generateToken(newUser.id);

    const userObj = {
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.display_name,
      role: newUser.roles?.name || 'user',
      departmentId: newUser.department_id,
      departmentName: newUser.departments?.name
    };

    setSession(userObj, token);

    return userObj;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  clearSession();
  return true;
};

export const resetPassword = async (email) => {
  try {
    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // TODO: Generate reset token and send email
    // For now, just return success
    return true;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  const session = getSession();
  if (!session) return null;

  // Validate token
  const decoded = decodeToken(session.token);
  if (!decoded) {
    clearSession();
    return null;
  }

  // Refresh user data from database
  const { data: user, error } = await supabase
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
    .eq('id', decoded.userId)
    .single();

  if (error) {
    clearSession();
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.roles?.name || 'user',
    departmentId: user.department_id,
    departmentName: user.departments?.name
  };
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

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

// Get stored token
export const getToken = () => {
  return localStorage.getItem('auth_token');
};
