const nodemailer = require('nodemailer');

// Email configuration
const EMAIL_CONFIG = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

const FROM_EMAIL = process.env.EMAIL_FROM || 'Samara Repository <noreply@samara.edu>';

// Create transporter
let transporter = null;

function createTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport(EMAIL_CONFIG);
    }
    return transporter;
}

/**
 * Send password reset OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} displayName - User's display name
 */
async function sendPasswordResetOTP(email, otp, displayName) {
    console.log('📧 Sending OTP email to:', email);
    
    const transport = createTransporter();
    
    const mailOptions = {
        from: FROM_EMAIL,
        to: email,
        subject: 'Password Reset - Samara Repository',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hello ${displayName},</p>
                <p>You requested to reset your password for Samara Repository. Use the following OTP to complete the process:</p>
                
                <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                </div>
                
                <p><strong>This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</strong></p>
                
                <p>If you didn't request this password reset, please ignore this email.</p>
                
                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message from Samara Repository. Please do not reply to this email.
                </p>
            </div>
        `
    };

    try {
        const result = await transport.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        throw error;
    }
}

/**
 * Test email configuration
 */
async function testEmailConfig() {
    try {
        const transport = createTransporter();
        await transport.verify();
        console.log('✅ Email configuration verified');
        return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
        console.error('❌ Email configuration error:', error.message);
        return { success: false, message: error.message };
    }
}

module.exports = {
    sendPasswordResetOTP,
    testEmailConfig
};