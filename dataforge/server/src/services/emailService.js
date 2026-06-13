import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"CrawlForge" <${process.env.EMAIL_FROM || 'noreply@crawlforge.com'}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[Email] Failed to send:', error.message);
    return null;
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Reset your CrawlForge password',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 32px; text-align: center;">
          <h1 style="color: white; font-size: 24px; margin: 0;">CrawlForge</h1>
        </div>
        <div style="padding: 32px; background: #fafafa;">
          <h2 style="color: #171717; font-size: 20px;">Password Reset Request</h2>
          <p style="color: #4d4d4d; line-height: 1.6;">Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #171717; color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin: 16px 0;">Reset Password</a>
          <p style="color: #888; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to CrawlForge',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 32px; text-align: center;">
          <h1 style="color: white; font-size: 24px; margin: 0;">CrawlForge</h1>
        </div>
        <div style="padding: 32px; background: #fafafa;">
          <h2 style="color: #171717;">Welcome, ${name}!</h2>
          <p style="color: #4d4d4d; line-height: 1.6;">Start extracting web data in minutes. Create your first scraping project and turn websites into structured data.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: #171717; color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin: 16px 0;">Go to Dashboard</a>
        </div>
      </div>
    `,
  });
};
