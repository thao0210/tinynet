import api from '@/services/api';
import urls from '@/sharedConstants/urls';

export const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export const convertToFile = (data, filename, mimeType = 'application/octet-stream') => {
  if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      // base64
      const arr = data.split(',');
      const mime = mimeType || arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      return new File([u8arr], filename, { type: mime });
    } else {
      // plain string → convert to file
      return new File([data], filename, { type: mimeType });
    }
  } else if (typeof data === 'object') {
    // JSON object
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    return new File([jsonBlob], filename, { type: 'application/json' });
  }

  throw new Error('Unsupported data format');
}

export function generateSafeFileName(originalName) {
  const randomId = Math.random().toString(36).substring(2, 10);

  // Sanitize tên file (chỉ giữ chữ, số, dấu . _ -)
  const sanitized = originalName
    .replace(/\s+/g, '_')               // khoảng trắng => _
    .replace(/[^a-zA-Z0-9._-]/g, '')    // loại bỏ ký tự đặc biệt khác

  // Chèn randomId trước phần đuôi (giữ phần mở rộng)
  if (sanitized.includes('.')) {
    return sanitized.replace(/(\.[^\.]+)$/, `-${randomId}$1`);
  } else {
    return `${sanitized}-${randomId}`;
  }
}

export function getFileExtensionFromBase64(base64) {
  const match = base64.match(/^data:([^\/]+)\/([^;]+);base64,/);
  if (!match) return 'bin';

  const type = match[1]; // image / video / audio...
  let subtype = match[2]; // svg+xml, png, jpeg...

  // Normalize svg+xml → svg
  if (subtype.includes('+')) {
    subtype = subtype.split('+')[0]; // 'svg+xml' → 'svg'
  }

  // Optional: validate allowed extensions
  const allowedExts = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'mp4', 'webm', 'mp3', 'wav'];
  return allowedExts.includes(subtype) ? subtype : 'bin';
}

export function generateSafeFileNameFromBase64(base64, fallbackName = 'file') {
  const ext = getFileExtensionFromBase64(base64);
  const randomId = Math.random().toString(36).substring(2, 10);
  return `${fallbackName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')}-${randomId}.${ext}`;
}

export const uploadToS3 = async (file, type) => {
    const res = await api.post(urls.S3_SIGN, {
        filename: file.name,
        filetype: file.type,
        type
      });
    
      const { uploadUrl, key } = await res.data;
    
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
    
      const s3BaseUrl = import.meta.env.VITE_S3_BASE_URL;
      const url = `${s3BaseUrl}/${key}`;
      return { url, key };
    };

export const uploadBase64ToS3 = async (base64, index = 0, type) => {
  const file = dataURLtoFile(base64, `image-${Date.now()}-${index}.png`);
  const {url, key} = await uploadToS3(file, type);
  return {url, key};
};

function getExtensionFromBase64(base64) {
  const match = base64.match(/^data:([^\/]+)\/([^;]+);base64,/);
  if (!match) return 'bin';
  let ext = match[2];
  if (ext.includes('+')) ext = ext.split('+')[0]; // svg+xml → svg
  return ext;
}

export const uploadBase64ToR2 = async (base64, index = 0, type, name) => {
  const ext = getExtensionFromBase64(base64);
  const fileName = `media-${Date.now()}-${index}.${ext}`;
  const file = dataURLtoFile(base64, fileName);
  const { url, key, date } = await uploadFileToR2(file, `${type}/${name ? name : fileName}`);
  return { url, key, date };
};

// export async function uploadFileToR2(file, key) {
//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('key', key);
//   formData.append('contentType', file.type);
//   try {
//     const response = await api.post(urls.R2_UPLOAD, formData);

//     if (!response.data) throw new Error('Upload failed');

//     const result = await response.data;
//     return {url: result.url, key, date: result.date}; // Đường dẫn file vừa upload (để bạn lưu vào database)
//   } catch (err) {
//     console.error('Upload error:', err);
//     return null;
//   }
// }
export async function uploadFileToR2(file, key) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', key);
  formData.append('contentType', file.type);

  try {
    const response = await fetch(urls.R2_UPLOAD, {
      method: 'POST',
      body: formData,
      credentials: 'include', // nếu BE cần cookie
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return { url: result.url, key, date: result.date };
  } catch (err) {
    console.error('Upload error:', err);
    return null;
  }
}


export async function deleteFileFromR2(fileKey) {
  try {
    const response = await api.delete(`${urls.R2_DELETE}?key=${encodeURIComponent(fileKey)}`);

    if (!response.data) throw new Error('Delete failed');

    return true;
  } catch (err) {
    console.error('Delete error:', err);
    return false;
  }
}