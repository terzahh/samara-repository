import { supabaseForCustomAuth } from './supabase';

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
    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log(`Attempting login for email: ${normalizedEmail}`);
    
    // Use the dedicated custom auth client (no JWT tokens, uses anon key only)
    // Get user from database with optional relationships
    // Note: approved column may not exist in older database schemas
    const { data: user, error } = await supabaseForCustomAuth
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
      .eq('email', normalizedEmail)
      .maybeSingle(); // Use maybeSingle() instead of single() - returns null if no rows instead of error

    console.log('Query result:', { user: user ? 'found' : 'not found', error });

    // Check for Supabase errors (RLS, network, etc.)
    if (error) {
      console.error('Supabase query error:', error);
      
      // PGRST303 = JWT expired - this shouldn't happen with custom auth client
      // but if it does, it means there's a stale token somewhere
      if (error.code === 'PGRST303' || error.message?.includes('JWT expired') || error.message?.includes('expired')) {
        console.warn('JWT expired error detected. This may indicate an RLS policy issue or invalid anon key.');
        throw new Error('Authentication error. Please check your Supabase configuration and RLS policies.');
      }
      
      // If it's a 401 or 403, it's likely an RLS policy issue
      if (error.code === 'PGRST301' || error.message?.includes('permission denied') || error.message?.includes('401')) {
        throw new Error('Database access denied. Please check Row Level Security policies for the users table.');
      }
      
      throw new Error(error.message || 'Database error occurred');
    }

    // Check if user was found
    if (!user) {
      console.warn(`No user found with email: ${normalizedEmail}`);
      throw new Error('Invalid credentials');
    }

    console.log('User found:', { 
      id: user.id, 
      email: user.email, 
      hasPassword: !!user.password_hash,
      hasRole: !!user.roles,
      hasDepartment: !!user.departments
    });

    // Verify password - direct comparison for now
    // TODO: Implement bcrypt hashing
    if (user.password_hash !== password) {
      console.warn('Password mismatch for user:', user.email);
      throw new Error('Invalid credentials');
    }

    // Check if user is approved (required for department heads)
    // Try to check approved status, but handle gracefully if column doesn't exist
    let approved = true; // Default to true if column doesn't exist
    if (user && user.roles?.name === 'department_head') {
      try {
        const { data: userApproved, error: approvedError } = await supabaseForCustomAuth
          .from('users')
          .select('approved')
          .eq('id', user.id)
          .maybeSingle();
        
        // Check if error is due to column not existing (code 42703 = undefined_column)
        if (approvedError && approvedError.code === '42703') {
          console.log('approved column does not exist, defaulting to approved = true');
          approved = true;
        } else if (!approvedError && userApproved) {
          approved = userApproved.approved !== false; // Default to true if null/undefined
        }
      } catch (e) {
        // Column doesn't exist or other error, use default approved = true
        console.log('Could not check approved status, defaulting to approved = true');
        approved = true;
      }
      
      // Only block login if approved is explicitly false
      if (approved === false) {
        throw new Error('Your account is pending admin approval. Please wait for approval before logging in.');
      }
    }

    // If relationships weren't loaded (due to RLS), try to fetch them separately
    let roleName = user.roles?.name || 'user';
    let departmentName = user.departments?.name || null;

    if (!user.roles && user.role_id) {
      console.log('Role not loaded via join, fetching separately...');
      const { data: roleData } = await supabaseForCustomAuth
        .from('roles')
        .select('name')
        .eq('id', user.role_id)
        .maybeSingle();
      if (roleData) {
        roleName = roleData.name;
      }
    }

    if (!user.departments && user.department_id) {
      console.log('Department not loaded via join, fetching separately...');
      const { data: deptData } = await supabaseForCustomAuth
        .from('departments')
        .select('name')
        .eq('id', user.department_id)
        .maybeSingle();
      if (deptData) {
        departmentName = deptData.name;
      }
    }

    // Generate token
    const token = generateToken(user.id);

    // Prepare user object
    const userObj = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: roleName,
      departmentId: user.department_id,
      departmentName: departmentName
    };

    console.log('Login successful for user:', userObj.email, 'role:', userObj.role);

    // Store session
    setSession(userObj, token);

    return userObj;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (email, password, displayName, role = 'user', departmentId = null, pendingApproval = false) => {
  try {
    // Get role ID
    const { data: roleData, error: roleError } = await supabaseForCustomAuth
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError) throw roleError;

    // Store password as-is for now
    // TODO: Implement bcrypt.hash(password, 10)
    const passwordHash = password;

    // Check if user already exists
    const { data: existingUser } = await supabaseForCustomAuth
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Prepare user data - DO NOT include approved column
    // The approved column may not exist in the database
    // If it exists, it will use its default value (true)
    const userData = {
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      display_name: displayName,
      role_id: roleData.id,
      department_id: departmentId || null
    };
    
    // NOTE: We intentionally do NOT include the 'approved' field
    // because it may not exist in the database schema.
    // If the column exists, it will use its default value.
    // If the column doesn't exist, the insert will succeed without it.
    
    console.log('Registering user with data:', { ...userData, password_hash: '***' });

    // Insert user without approved column
    // This will work whether or not the approved column exists
    const { data: newUser, error } = await supabaseForCustomAuth
      .from('users')
      .insert(userData)
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

    if (error) {
      console.error('Error registering user:', error);
      
      // If error mentions approved column, provide helpful message
      if (error.message && error.message.includes('approved')) {
        console.warn('⚠️ Error related to approved column. The column may not exist in your database.');
        console.warn('ℹ️ To fix this, run ADD_APPROVED_COLUMN.sql in your Supabase SQL Editor.');
        console.warn('ℹ️ Alternatively, the error might be due to RLS policies or other database constraints.');
      }
      
      throw error;
    }

    if (!newUser) {
      throw new Error('Failed to create user. No data returned.');
    }
    
    console.log('✅ User registered successfully:', newUser.email);

    // Prepare user object
    const userObj = {
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.display_name,
      role: newUser.roles?.name || 'user',
      departmentId: newUser.department_id,
      departmentName: newUser.departments?.name
    };

    // For department heads, check if they need approval
    if (pendingApproval && newUser.roles?.name === 'department_head') {
      try {
        // Attempt to explicitly set approved = false
        const { error: updateApprovalError } = await supabaseForCustomAuth
          .from('users')
          .update({ approved: false })
          .eq('id', newUser.id);

        if (updateApprovalError && updateApprovalError.code === '42703') {
          console.warn('approved column does not exist. Department head approval workflow requires ADD_APPROVED_COLUMN.sql');
          // Return as pending without creating a session to avoid auto-approval behavior
          return {
            ...userObj,
            approved: false,
            pendingApproval: true
          };
        }

        // Successfully marked as pending
        return {
          ...userObj,
          approved: false,
          pendingApproval: true
        };
      } catch (e) {
        console.warn('Could not mark department head as pending:', e?.message || e);
        // As a safe default, do NOT auto-login. Require admin to resolve.
        return {
          ...userObj,
          approved: false,
          pendingApproval: true
        };
      }
    }

    // Regular users or approved department heads - set session
    const token = generateToken(newUser.id);
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
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🔍 Checking for user with email:', normalizedEmail);
    
    // Check if user exists
    const { data: user, error: userError } = await supabaseForCustomAuth
      .from('users')
      .select('id, email, display_name')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (userError) {
      console.error('❌ Error checking for user:', userError);
      // Check if it's an RLS error
      if (userError.code === 'PGRST301' || userError.message?.includes('permission denied')) {
        throw new Error('Database access denied. Please contact administrator.');
      }
      throw new Error('An error occurred while processing your request.');
    }

    // Don't reveal if user exists or not for security reasons
    // Always return success message, but only process if user exists
    let resetToken = null;
    let resetLink = null;
    let expiresAt = null;
    
    if (user) {
      console.log('✅ User found:', user.email, 'ID:', user.id);
      
      // Generate a secure reset token
      resetToken = btoa(JSON.stringify({
        userId: user.id,
        email: normalizedEmail,
        timestamp: Date.now(),
        random: Math.random().toString(36).substring(2, 15)
      })).replace(/[+/=]/g, ''); // Remove special characters for URL safety
      
      // Set expiration to 1 hour from now
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
      
      console.log('🔑 Generated reset token and link');
      console.log('🔗 Reset Link:', resetLink);
      
      // Store reset token in database (try to, but don't fail if table doesn't exist)
      try {
        const { error: insertError } = await supabaseForCustomAuth
          .from('password_resets')
          .insert({
            email: normalizedEmail,
            token: resetToken,
            expires_at: expiresAt.toISOString(),
            user_id: user.id,
            used: false
          });

        if (insertError) {
          console.error('⚠️ Error storing password reset token:', insertError);
          // If table doesn't exist, log warning but continue
          if (insertError.code === '42P01') {
            console.warn('⚠️ password_resets table does not exist. Please run CREATE_PASSWORD_RESET_TABLE.sql');
            console.warn('⚠️ The reset link will still work, but token validation may fail. Run the SQL migration for full functionality.');
          } else {
            console.error('⚠️ Failed to store token in database, but reset link is still generated.');
          }
        } else {
          console.log('✅ Reset token stored successfully in database');
        }
      } catch (dbError) {
        console.warn('⚠️ Database error (non-fatal):', dbError);
        // Continue even if database insert fails
      }
      
      // ALWAYS log to console with prominent formatting
      console.log('%c════════════════════════════════════════════════════════════════════════════════════', 'color: #2D7BA8; font-weight: bold; font-size: 14px;');
      console.log('%c🔐 PASSWORD RESET LINK GENERATED', 'color: #2D7BA8; font-weight: bold; font-size: 18px;');
      console.log('%c════════════════════════════════════════════════════════════════════════════════════', 'color: #2D7BA8; font-weight: bold; font-size: 14px;');
      console.log('📧 Email:', normalizedEmail);
      console.log('🔗 Reset Link:', resetLink);
      console.log('⏰ Expires at:', expiresAt.toLocaleString());
      console.log('%c════════════════════════════════════════════════════════════════════════════════════', 'color: #2D7BA8; font-weight: bold; font-size: 14px;');
      console.log('%c👉 COPY THE LINK ABOVE AND OPEN IT IN YOUR BROWSER TO RESET YOUR PASSWORD', 'color: #28a745; font-weight: bold; font-size: 14px;');
      console.log('%c════════════════════════════════════════════════════════════════════════════════════', 'color: #2D7BA8; font-weight: bold; font-size: 14px;');
      
      // Also log the link as a separate, easy-to-copy line
      console.log('');
      console.log('🔗 RESET LINK (copy this):', resetLink);
      console.log('');
      
      // TODO: Send email with reset link
      // In production, integrate with email service (SendGrid, AWS SES, Supabase Email, etc.)
      // Example: await sendPasswordResetEmail(normalizedEmail, user.display_name, resetLink);
    } else {
      console.log('⚠️ No user found with email:', normalizedEmail);
      console.log('ℹ️ For security reasons, we do not reveal if an account exists.');
      console.log('ℹ️ If this email is registered, a reset link would have been generated.');
    }
    
    // Always return success (security best practice - don't reveal if user exists)
    const response = {
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.'
    };
    
    // ALWAYS include reset link in response if it was generated (for development/testing)
    // In production, remove this and send email instead
    if (resetLink) {
      response.resetLink = resetLink;
      response.devMode = true;
      response.email = normalizedEmail;
      response.expiresAt = expiresAt.toISOString();
      console.log('✅ Reset link included in response:', resetLink);
    } else {
      console.log('ℹ️ No reset link generated (user may not exist)');
    }
    
    console.log('📤 Returning response:', response);
    return response;
  } catch (error) {
    console.error('❌ Password reset error:', error);
    throw error;
  }
};

// Verify password reset token
export const verifyPasswordResetToken = async (token) => {
  try {
    // Check if token exists and is valid
    const { data: resetRequest, error } = await supabaseForCustomAuth
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !resetRequest) {
      // Check if table doesn't exist
      if (error && error.code === '42P01') {
        throw new Error('Password reset functionality is not available. Please contact administrator.');
      }
      throw new Error('Invalid or expired reset token.');
    }

    // Check if token has expired
    const expiresAt = new Date(resetRequest.expires_at);
    if (expiresAt < new Date()) {
      throw new Error('This reset token has expired. Please request a new one.');
    }

    return {
      valid: true,
      email: resetRequest.email,
      userId: resetRequest.user_id
    };
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
};

// Admin function to reset user password directly (bypasses token)
export const adminResetUserPassword = async (userId, newPassword) => {
  try {
    // Update user password directly
    // Note: In production, hash the password before storing
    const { error: updateError } = await supabaseForCustomAuth
      .from('users')
      .update({ password_hash: newPassword })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to reset password. Please try again.');
    }

    return {
      success: true,
      message: 'Password has been reset successfully.'
    };
  } catch (error) {
    console.error('Admin password reset error:', error);
    throw error;
  }
};

// Admin function to generate reset link for a user
export const adminGenerateResetLink = async (userId) => {
  try {
    // Get user info
    const { data: user, error: userError } = await supabaseForCustomAuth
      .from('users')
      .select('id, email, display_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Generate reset token
    const normalizedEmail = user.email.toLowerCase().trim();
    const resetToken = btoa(JSON.stringify({
      userId: user.id,
      email: normalizedEmail,
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2, 15)
    })).replace(/[+/=]/g, '');

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

    // Store reset token in database
    const { error: insertError } = await supabaseForCustomAuth
      .from('password_resets')
      .insert({
        email: normalizedEmail,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        user_id: user.id,
        used: false
      });

    if (insertError) {
      // If table doesn't exist, still return the link for manual use
      if (insertError.code === '42P01') {
        console.warn('password_resets table does not exist. Reset link generated but not stored.');
      } else {
        throw new Error('Failed to create reset token. Please try again.');
      }
    }

    return {
      success: true,
      resetLink: resetLink,
      email: normalizedEmail,
      expiresAt: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('Admin generate reset link error:', error);
    throw error;
  }
};

// Update password using reset token
export const updatePasswordWithToken = async (token, newPassword) => {
  try {
    // Verify token first
    const tokenData = await verifyPasswordResetToken(token);
    
    if (!tokenData.valid) {
      throw new Error('Invalid reset token.');
    }

    // Update user password
    // Note: In production, hash the password before storing
    const { error: updateError } = await supabaseForCustomAuth
      .from('users')
      .update({ password_hash: newPassword })
      .eq('id', tokenData.userId);

    if (updateError) {
      throw new Error('Failed to update password. Please try again.');
    }

    // Mark token as used
    const { error: markUsedError } = await supabaseForCustomAuth
      .from('password_resets')
      .update({ used: true })
      .eq('token', token);

    if (markUsedError) {
      console.warn('Failed to mark token as used:', markUsedError);
      // Don't throw error - password was updated successfully
    }

    return {
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    };
  } catch (error) {
    console.error('Password update error:', error);
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
  const { data: user, error } = await supabaseForCustomAuth
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
    const { error } = await supabaseForCustomAuth
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
