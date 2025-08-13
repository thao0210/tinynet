const { exportPdf } = require("../utils/pdfUtils");
const nodemailer = require("nodemailer");
require("dotenv").config();
const AWS = require("aws-sdk");
const fetch = require('node-fetch');
const { deleteFromR2 } = require("../utils/deleteFromR2");
const axios = require('axios');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const os = require('os');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const getSignedUrl = async (req, res) => {
  const { filename, filetype, type = "others" } = req.body;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${type}/${Date.now()}-${filename}`,
    ContentType: filetype,
    Expires: 60,
  };

  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

  res.json({ uploadUrl, key: params.Key });
};

const deleteS3File = async (req, res) => {
    const { key } = req.body; // key là chuỗi kiểu "uploads/123-avatar.png"
  
    if (!key) {
      return res.status(400).json({ error: "Missing key" });
    }
  
    const params = {
      Bucket: process.env.S3_BUCKET_NAME, // Tên bucket thực tế
      Key: key,
    };
  
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.error("Error deleting S3 object:", err);
        return res.status(500).json({ error: "Error deleting file" });
      }
      res.status(200).json({ message: "File deleted successfully" });
    });
  }

const generatePdf = async (req, res) => {
  try {
    const { htmlContent } = req.body;
    if (!htmlContent) return res.status(400).json({ error: "Missing HTML content" });

    const pdfBuffer = await exportPdf(htmlContent);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=generated.pdf",
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const sendContactMail = async (req, res) => {
  const { email, content } = req.body;

  if (!email || !content) {
    return res.status(400).json({ message: 'Email và nội dung là bắt buộc.' });
  }

  try {
    // Tạo transporter - dùng Gmail SMTP ở đây, bạn có thể dùng dịch vụ khác
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.SMTP_USER, // email của bạn
        pass: process.env.SMTP_PASS, // mật khẩu ứng dụng (app password)
      },
    });

    const mailOptions = {
      from: email, // email người dùng gửi
      to: process.env.SMTP_USER, // bạn nhận được mail này
      subject: `Contact from User: ${email}`,
      text: content,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Send successfully!' });
  } catch (err) {
    console.error('Sending error, please try again.', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

const r2Upload = async (req, res) => {
  try {
    const { originalname, buffer, mimetype } = req.file;
    const key = req.body.key || originalname;
    const contentType = req.body.contentType || mimetype || 'application/octet-stream';

    let processedBuffer = buffer;

    // Xác định extension dựa trên mimetype
    const extMap = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'audio/webm': '.webm',
      'audio/ogg': '.ogg' 
    };
    const ext = extMap[mimetype] || path.extname(originalname) || '';

    // File tạm có đuôi để ffmpeg nhận diện
    const tempInput = path.join(os.tmpdir(), `input-${Date.now()}${ext}`);
    const tempOutput = path.join(os.tmpdir(), `output-${Date.now()}${ext}`);

    if (mimetype.startsWith('image/')) {
      processedBuffer = await sharp(buffer)
        .resize({ width: 1024, height: 1024, fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer();
    }
    else if (mimetype.startsWith('video/')) {
      fs.writeFileSync(tempInput, buffer);
      await new Promise((resolve, reject) => {
        ffmpeg(tempInput)
          .outputOptions([
            '-vf scale=1280:-1',
            '-b:v 1M',
            '-c:v libx264',
            '-preset veryfast',
            '-c:a aac',
            '-b:a 128k'
          ])
          .save(tempOutput)
          .on('end', resolve)
          .on('error', reject);
      });
      processedBuffer = fs.readFileSync(tempOutput);
    }
    else if (mimetype.startsWith('audio/')) {
      fs.writeFileSync(tempInput, buffer);
      await new Promise((resolve, reject) => {
        ffmpeg(tempInput)
          .audioBitrate('96k')
          .save(tempOutput)
          .on('end', resolve)
          .on('error', reject);
      });
      processedBuffer = fs.readFileSync(tempOutput);
    }

    // Upload lên R2
    const workerUploadURL = `${process.env.R2_UPLOAD_URL}/${key}`;
    const r2Res = await fetch(workerUploadURL, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Authorization': 'Bearer ' + process.env.R2_API_TOKEN
      },
      body: processedBuffer
    });

    console.log('R2 upload response:', r2Res.status, r2Res.statusText);
    if (!r2Res.ok) {
      return res.status(500).json({ error: 'Upload failed', details: await r2Res.text() });
    }

    // Dọn file tạm
    [tempInput, tempOutput].forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });

    const publicURL = `${process.env.R2_UPLOAD_URL}/${key}`;
    const updatedDate = Date.now();
    console.log('File uploaded successfully:', publicURL);

     // Trả về URL và key
    return res.json({ success: true, url: publicURL, date: updatedDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unexpected error' });
  }
};

const r2Delete = async (req, res) => {
  try {
    const key = decodeURIComponent(req.query.key);

    if (!key) {
      return res.status(400).json({ error: 'Missing filename' });
    }
    await deleteFromR2(key);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unexpected error' });
  }
};


module.exports = { generatePdf, getSignedUrl, deleteS3File, sendContactMail, r2Upload, r2Delete };
