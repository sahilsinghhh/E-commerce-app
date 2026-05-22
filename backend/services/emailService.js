import nodemailer from 'nodemailer';

// Initialize Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generic send function
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Skipping email send.');
    return;
  }

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'ShopHub'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

// 1. Send Welcome Email
export const sendWelcomeEmail = async (userEmail, userName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h1 style="color: #4CAF50;">Welcome to ShopHub, ${userName}! 🎉</h1>
      <p style="font-size: 16px; color: #333;">Thank you for registering an account with us. We are thrilled to have you on board!</p>
      <p style="font-size: 16px; color: #333;">Explore our latest products and start shopping today.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
      <p style="font-size: 14px; color: #777;">Best regards,<br/>The ShopHub Team</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject: 'Welcome to ShopHub!', html });
};

// 2. Send Password Reset Email
export const sendPasswordResetEmail = async (userEmail, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #f44336;">Password Reset Request</h2>
      <p style="font-size: 16px; color: #333;">We received a request to reset your password. Click the link below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #555;">This link is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
      <p style="font-size: 12px; color: #999;">If the button above does not work, copy and paste this URL into your browser:<br/>${resetUrl}</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject: 'ShopHub - Reset Your Password', html });
};

// 3. Send Order Confirmation Email
export const sendOrderConfirmationEmail = async (userEmail, order) => {
  const itemsList = order.orderItems.map(item => `
    <li style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 15px; color: #333;">
      <strong>${item.product ? item.product.name : 'Product'}</strong> (x${item.quantity}) - $${item.price.toFixed(2)}
    </li>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h1 style="color: #4CAF50; margin-bottom: 5px;">Order Confirmed! 🛍️</h1>
      <p style="color: #777; margin-top: 0; font-size: 14px;">Order ID: #${order._id}</p>
      <p style="font-size: 16px; color: #333;">Thank you for your purchase. Your order has been successfully placed.</p>
      
      <h3 style="border-bottom: 2px solid #4CAF50; padding-bottom: 5px; color: #4CAF50;">Order Summary</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${itemsList}
      </ul>
      
      <div style="margin-top: 20px; font-size: 18px; font-weight: bold; color: #333; text-align: right;">
        Total Amount: $${order.totalPrice.toFixed(2)}
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
      <p style="font-size: 14px; color: #777;">We will notify you once your order has shipped.</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject: `ShopHub - Order Confirmation #${order._id}`, html });
};
