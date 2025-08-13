require('dotenv').config(); // để đọc file .env

module.exports = {
  apps: [
    {
      name: "tinynet-backend",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        JWT_SECRET: process.env.JWT_SECRET,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
        VITE_FE_URL: process.env.VITE_FE_URL,
        SMTP_HOST1: process.env.SMTP_HOST1,
        SMTP_PORT1: process.env.SMTP_PORT1,
        SMTP_USER1: process.env.SMTP_USER1,
        SMTP_PASS1: process.env.SMTP_PASS1,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
        FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        S3_BASE_URL: process.env.S3_BASE_URL,
        PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
        PAYPAL_SECRET: process.env.PAYPAL_SECRET,
        PAYPAL_API: process.env.PAYPAL_API,
        R2_API_TOKEN: process.env.R2_API_TOKEN,
        R2_UPLOAD_URL: process.env.R2_UPLOAD_URL
      }
    }
  ]
};
