const nodemailer = require("nodemailer");
const crypto = require('crypto');
const { otpEmailTemplate } = require("./emailTemplates");
require("dotenv").config();


  // Helper: Gửi email
  const sendEmail = async (to, subject, html, otp, title, text) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  
    const otpTemplate = otpEmailTemplate(otp, title, text);
    const mailOptions = {
      from: `"Tiny Net" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: html ? html : otpTemplate,
    };
  
    await transporter.sendMail(mailOptions);
  };
const generateOtp = () => crypto.randomInt(100000, 999999);
module.exports = {sendEmail, generateOtp}