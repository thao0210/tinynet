const fetch = require('node-fetch'); // hoặc dùng global fetch nếu có

const deleteFromR2 = async (key) => {
  if (!key) throw new Error('Missing file key');
  
  const workerURL = `${process.env.R2_UPLOAD_URL}/${key}`;
  
  const response = await fetch(workerURL, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${process.env.R2_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete file: ${errorText}`);
  }

  return true;
};

module.exports = { deleteFromR2 };
