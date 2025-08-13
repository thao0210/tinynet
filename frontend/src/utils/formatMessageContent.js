import DOMPurify from 'dompurify';

export const formatMessageContent = (content) => {
  if (!content) return '';

  let safeContent = DOMPurify.sanitize(content);

  // 1. Link
  safeContent = safeContent.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );

  // 2. Email (xử lý trước @username)
  safeContent = safeContent.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    (email) => `<a href="mailto:${email}">${email}</a>`
  );

  // 3. Tag @username
  safeContent = safeContent.replace(/(^|\s)@(\w+)/g, '$1<a href="/profile/$2">@$2</a>');

  // 4. Hashtag (chú ý chỉnh lại regex để lấy đúng text sau #)
  safeContent = safeContent.replace(/(^|\s)#(\w+)/g, '$1<a href="/list?search=$2">#$2</a>');

  // 5. Newline
  safeContent = safeContent.replace(/\n/g, '<br />');
  return safeContent;
};
