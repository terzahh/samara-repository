const bcrypt = require('bcrypt');
const { supabaseAdmin } = require('../config/database');
const { createSession } = require('./sessionService');
const { generateDeviceSignature } = require('../utils/fingerprint');
const { logActivity } = require('./auditService');
const { isValidEmail, validatePassword } = require('../utils/validation');

const SALT_ROUNDS = 10;

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} userAgent - User-Agent header
 * @param {string} ipAddress - IP address
 * @returns {Promise<Object>} { user, session, refreshToken, csrfToken }
 */
async function loginUser(email, password, userAgent, ipAddress) {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
        throw new Error('Invalid email format');
    }

    // Get user from database
    const { data: user, error } = await supabaseAdmin
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
        .single();

    if (error || !user) {
        // Log failed attempt
        await logActivity(
            null,
            null,
            'login_failed',
            'warning',
            ipAddress,
            userAgent,
            null,
            { email: normalizedEmail, reason: 'user_not_found' }
        );
        throw new Error('Invalid credentials');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
        // Log failed attempt
        await logActivity(
            user.id,
            null,
            'login_failed',
            'warning',
            ipAddress,
            userAgent,
            null,
            { reason: 'invalid_password' }
        );
        throw new Error('Invalid credentials');
    }

    // Generate device signature
    const deviceSignature = generateDeviceSignature(userAgent);

    // Create session
    const { session, refreshToken, csrfToken } = await createSession(
        user.id,
        deviceSignature,
        userAgent,
        ipAddress
    );

    // Log successful login
    await logActivity(
        user.id,
        session.id,
        'login_success',
        'info',
        ipAddress,
        userAgent,
        deviceSignature,
        null
    );

    // Return user data (no password hash)
    return {
        user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            role: user.roles?.name || 'user',
            departmentId: user.department_id,
            departmentName: user.departments?.name
        },
        session,
        refreshToken,
        csrfToken
    };
}

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - Display name
 * @param {string} role - User role (default: 'user')
 * @param {string} departmentId - Department ID (optional)
 * @returns {Promise<Object>} { user }
 */
async function registerUser(email, password, displayName, role = 'user', departmentId = null) {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email
    if (!isValidEmail(normalizedEmail)) {
        throw new Error('Invalid email format');
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        const error = new Error('Password validation failed');
        error.name = 'ValidationError';
        error.details = passwordValidation.errors;
        throw error;
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Get role ID
    let { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', role)
        .maybeSingle();

    if (roleError) {
        console.error('Error checking role:', roleError);
        throw new Error(`Database error: ${roleError.message}`);
    }

    // Self-healing: Create role if it doesn't exist
    if (!roleData) {
        console.log(`Role '${role}' not found, creating it...`);
        const { data: newRole, error: createRoleError } = await supabaseAdmin
            .from('roles')
            .insert({
                name: role,
                description: `Auto-created ${role} role`
            })
            .select('id')
            .single();

        if (createRoleError) {
            console.error('Failed to auto-create role:', createRoleError);
            throw new Error(`Failed to create role: ${createRoleError.message}`);
        }
        roleData = newRole;
    }

    // Create user
    const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
            email: normalizedEmail,
            password_hash: passwordHash,
            display_name: displayName,
            role_id: roleData.id,
            department_id: departmentId
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

    if (insertError) {
        throw insertError;
    }

    // Log registration
    await logActivity(
        newUser.id,
        null,
        'user_registered',
        'info',
        null,
        null,
        null,
        { role }
    );

    return {
        user: {
            id: newUser.id,
            email: newUser.email,
            displayName: newUser.display_name,
            role: newUser.roles?.name || 'user',
            departmentId: newUser.department_id,
            departmentName: newUser.departments?.name
        }
    };
}

/**
 * Reset user password (admin only)
 * @param {string} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} { success }
 */
async function adminResetPassword(userId, newPassword) {
    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        const error = new Error('Password validation failed');
        error.name = 'ValidationError';
        error.details = passwordValidation.errors;
        throw error;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password
    const { error } = await supabaseAdmin
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', userId);

    if (error) {
        throw new Error(`Failed to reset password: ${error.message}`);
    }

    // Log activity
    await logActivity(
        userId,
        null,
        'password_reset_admin',
        'info',
        null,
        null,
        null,
        null
    );

    return { success: true };
}

/**
 * Change user's own password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} { success }
 */
async function changePassword(userId, currentPassword, newPassword) {
    // Get user
    const { data: user, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

    if (fetchError || !user) {
        throw new Error('User not found');
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
        throw new Error('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        const error = new Error('Password validation failed');
        error.name = 'ValidationError';
        error.details = passwordValidation.errors;
        throw error;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', userId);

    if (updateError) {
        throw new Error(`Failed to change password: ${updateError.message}`);
    }

    // Log activity
    await logActivity(
        userId,
        null,
        'password_changed',
        'info',
        null,
        null,
        null,
        null
    );

    return { success: true };
}

module.exports = {
    loginUser,
    registerUser,
    adminResetPassword,
    changePassword
};
