const bcrypt = require('bcrypt');
const { supabaseAdmin } = require('../config/database');
const { createSession } = require('./sessionService');
const { generateDeviceSignature } = require('../utils/fingerprint');
const { logActivity } = require('./auditService');
const { isValidEmail, validatePassword } = require('../utils/validation');
const { sendPasswordResetOTP } = require('./emailService');
const { generateOTP, storeOTP, verifyOTP } = require('./otpService');

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
      approved,
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

    // Check if user is approved (for department heads)
    if (user.approved === false) {
        await logActivity(
            user.id,
            null,
            'login_failed',
            'warning',
            ipAddress,
            userAgent,
            null,
            { reason: 'pending_approval' }
        );
        throw new Error('Your account is pending admin approval. Please wait for approval before logging in.');
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
 * @param {boolean} pendingApproval - Whether user needs admin approval (default: false)
 * @returns {Promise<Object>} { user }
 */
async function registerUser(email, password, displayName, role = 'user', departmentId = null, pendingApproval = false) {
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

    // Create user with approved status
    // If pendingApproval is true (department heads), set approved to false
    // Otherwise, set approved to true (regular users)
    const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
            email: normalizedEmail,
            password_hash: passwordHash,
            display_name: displayName,
            role_id: roleData.id,
            department_id: departmentId,
            approved: !pendingApproval  // Set to false if pending approval, true otherwise
        })
        .select(`
      id,
      email,
      display_name,
      role_id,
      department_id,
      approved,
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

/**
 * Request password reset - send OTP to email
 * @param {string} email - User email
 * @param {string} ipAddress - IP address
 * @returns {Promise<Object>} { success, message }
 */
async function requestPasswordReset(email, ipAddress) {
    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
        throw new Error('Invalid email format');
    }

    // Check if user exists
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, display_name')
        .eq('email', normalizedEmail)
        .single();

    if (error || !user) {
        // Don't reveal if user exists - always return success
        await logActivity(
            null,
            null,
            'password_reset_requested',
            'warning',
            ipAddress,
            null,
            null,
            { email: normalizedEmail, reason: 'user_not_found' }
        );
        return { success: true, message: 'If the email exists, an OTP has been sent' };
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(normalizedEmail, otp, 'password_reset');

    // Send email
    try {
        await sendPasswordResetOTP(normalizedEmail, otp, user.display_name);
        
        await logActivity(
            user.id,
            null,
            'password_reset_requested',
            'info',
            ipAddress,
            null,
            null,
            { email: normalizedEmail }
        );

        return { success: true, message: 'OTP sent to your email' };
    } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        throw new Error('Failed to send reset email. Please try again later.');
    }
}

/**
 * Reset password with OTP
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @param {string} newPassword - New password
 * @param {string} ipAddress - IP address
 * @returns {Promise<Object>} { success }
 */
async function resetPasswordWithOTP(email, otp, newPassword, ipAddress) {
    const normalizedEmail = email.toLowerCase().trim();

    // Validate inputs
    if (!isValidEmail(normalizedEmail)) {
        throw new Error('Invalid email format');
    }

    if (!otp || otp.length !== 6) {
        throw new Error('Invalid OTP format');
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        const error = new Error('Password validation failed');
        error.name = 'ValidationError';
        error.details = passwordValidation.errors;
        throw error;
    }

    // Verify OTP
    const otpVerification = await verifyOTP(normalizedEmail, otp, 'password_reset');
    if (!otpVerification.valid) {
        await logActivity(
            null,
            null,
            'password_reset_failed',
            'warning',
            ipAddress,
            null,
            null,
            { email: normalizedEmail, reason: otpVerification.reason }
        );
        
        if (otpVerification.reason === 'expired') {
            throw new Error('OTP has expired. Please request a new one.');
        }
        throw new Error('Invalid OTP');
    }

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

    if (userError || !user) {
        throw new Error('User not found');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', user.id);

    if (updateError) {
        throw new Error('Failed to update password');
    }

    // Revoke all existing sessions for security
    const { revokeAllUserSessions } = require('./sessionService');
    await revokeAllUserSessions(user.id, 'password_reset');

    await logActivity(
        user.id,
        null,
        'password_reset_success',
        'info',
        ipAddress,
        null,
        null,
        { email: normalizedEmail }
    );

    return { success: true };
}

module.exports = {
    loginUser,
    registerUser,
    adminResetPassword,
    changePassword,
    requestPasswordReset,
    resetPasswordWithOTP
};
