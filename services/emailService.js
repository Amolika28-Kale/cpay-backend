// services/emailService.js
const axios = require("axios");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// services/emailService.js
const sendOtpEmail = async ({ email, otp, type = 'register' }) => {
  try {
    console.log(`📧 Attempting to send email to: ${email}`);
    console.log(`🔐 OTP: ${otp}, Type: ${type}`);
    console.log(`📧 MAIL_FROM_EMAIL: ${process.env.MAIL_FROM_EMAIL}`);
    console.log(`🔑 BREVO_API_KEY exists: ${!!process.env.BREVO_API_KEY}`);

    let subject, message;
    
    if (type === 'forgot-password') {
      subject = "Reset Your Password - CpayLink";
      message = `
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333; margin: 0 0 10px 0;">Password Reset Request</h2>
          <p style="color: #666; font-size: 14px;">Use this OTP to reset your password</p>
          <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); padding: 15px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 48px; font-weight: bold; color: white; letter-spacing: 5px;">${otp}</span>
          </div>
        </div>
      `;
    } else {
      subject = "Email Verification OTP - CpayLink";
      message = `
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333; margin: 0 0 10px 0;">Your OTP Code</h2>
          <div style="background: linear-gradient(135deg, #00F5A0 0%, #00d88c 100%); padding: 15px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 48px; font-weight: bold; color: white; letter-spacing: 5px;">${otp}</span>
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #00F5A0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #00F5A0; font-size: 32px; margin: 0;">CpayLink</h1>
          <p style="color: #666; font-size: 14px;">${type === 'forgot-password' ? 'Password Reset' : 'Email Verification'}</p>
        </div>
        
        ${message}
        
        <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>This code will expire in <strong>10 minutes</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>© ${new Date().getFullYear()} CpayLink. All rights reserved.</p>
        </div>
      </div>
    `;

    console.log("📤 Sending request to Brevo...");
    
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.MAIL_FROM_NAME || "CpayLink",
          email: process.env.MAIL_FROM_EMAIL,
        },
        to: [{ email: email }],
        subject: subject,
        htmlContent: htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log(`✅ OTP sent successfully to ${email} for ${type}`);
    console.log("📨 Brevo response status:", response.status);
    return true;

  } catch (err) {
    console.error("❌ BREVO MAIL ERROR DETAILS:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
      console.error("Headers:", err.response.headers);
    } else if (err.request) {
      console.error("No response received:", err.request);
    } else {
      console.error("Error:", err.message);
    }
    throw err;
  }
};

module.exports = { generateOtp, sendOtpEmail };