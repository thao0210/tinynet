export const isLanguagesContentValid = (data) => {
  const allLangs = [data.language, ...(data.translations?.map(t => t.lang) || [])].filter(Boolean);
  return allLangs.every(lang => {
    const item = lang === data.language ? data : data.translations?.find(t => t.lang === lang);
    return !!item?.text && item.text.trim().length >= 30;
  });
};

export const isCardTitleValid = (data) => {
  const langs = Object.keys(data.cardTextContent || {});
    return langs.every(lang => {
      const title = data.cardMeta?.[lang]?.title;
      return !!title && title.trim().length >= 4;
    });
}

export const isAllLanguagesValid = (data) => {
  const allLangs = [data.language, ...(data.translations?.map(t => t.lang) || [])].filter(Boolean);
  return allLangs.every(lang => {
    const item = lang === data.language ? data : data.translations?.find(t => t.lang === lang);
    return !!item?.text && item.text.trim().length >= 30 && !!item?.title && item.title.trim().length >= 4;
  });
};

export const getGeneralError = (data) => {
  if (
    data.privacy === 'share' &&
    (!Array.isArray(data.shareWith) || data.shareWith.length === 0)
  ) {
    return 'Please select at least one user to share with.';
  }

  if (data.isFriendlyUrl && !data.slug) {
    return 'A slug is required for friendly URL.';
  }

  if (
    data.restrictedAccess &&
    (!data.password && !data.sendOtp)
  ) {
    return 'Password or OTP is required for restricted access.';
  }

  if (
    data.isPromoted &&
    (!data.promoteDuration && !data.promoteEnd)
  ) {
    return 'Promotion duration or end date is required.';
  }

  return null; // tức là pass hết
};

export const getSaveError = (type, data, curItemId) => {
  // Check general first
  const generalError = getGeneralError(data);
  if (generalError) return generalError;

  // Check title
  if (!data.title || data.title.trim().length < 4) {
    return 'Title must be at least 4 characters long.';
  }

  if (type === 'story' && !isAllLanguagesValid(data)) {
    return 'Title (at least 4 characters long) is required in every language.';
  }

  if (type === 'card' && !isCardTitleValid(data)) {
    return 'Title (at least 4 characters long) is required in every language.';
  }

  if (type === 'shareUrl' && !data.preview) {
    return 'A valid URL preview is required.';
  }

  if (type === 'draco' && (!curItemId && !data.base64)) {
    return 'A drawing/coloring image is required.';
  }

  if (
    type === 'vote' &&
    !data.deadline
  ) {
    return 'Vote deadline is required.';
  }
  return null;
};
export const isSaveDisabled = (type, data, curItemId) =>
  !!getSaveError(type, data, curItemId);

// utils/validateTranslation.js
const validateTranslation = (obj) => {
  if (!obj || typeof obj !== 'object') return false;

  const languages = Object.keys(obj);
  if (languages.length === 0) return false;

  // Gom tất cả id từ mọi ngôn ngữ
  const allIds = new Set();
  for (const lang of languages) {
    Object.keys(obj[lang] || {}).forEach(id => allIds.add(id));
  }

  // Kiểm tra từng language có đủ id không
  for (const lang of languages) {
    for (const id of allIds) {
      if (!obj[lang] || !(id in obj[lang]) || !obj[lang][id]?.trim()) {
        return false;
      }
    }
  }

  return true;
}

const nextValidationRules = {
  story: (data) => {
    if (!data.text || data.text.trim().length < 30) {
      return 'At least 30 characters are required for the post content.';
    }
    if (!isLanguagesContentValid(data)) {
      return 'At least 30 characters are required for the every language content.';
    }
    return null;
  },
  card: (data) =>
    !(data.cardTextContent && validateTranslation(data.cardTextContent)) ?
    'Text is required for card.' : null,
  collection: (data) =>
    !data.items || data.items.length === 0
      ? 'At least one item is required in the collection.'
      : null,
  shareUrl: (data) =>
    !data.url || !data.url.includes('http') || !data.preview
      ? 'A valid URL is required.'
      : null,
  draco: (data, curItemId) => 
    !curItemId && (!data.base64 || data.base64.trim().length === 0)
    ? 'Drawing/coloring image is required.'
    : null,
  vote: (data) =>
    !data.items || data.items.length < 2
      ? 'At least two vote items are required.'
      : null,
};

// Check if Next is disabled and return error message
export const getNextError = (type, data, curItemId) => {
  const validator = nextValidationRules[type];
  return validator ? validator(data, curItemId) : null;
};
export const isNextDisabled = (type, data, curItemId) => !!getNextError(type, data, curItemId);