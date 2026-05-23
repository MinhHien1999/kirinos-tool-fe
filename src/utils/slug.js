// Utility function to generate slug from text
export const generateSlug = (text) => {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove accents and diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Generate random slug with timestamp
export const generateRandomSlug = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix ? prefix + '-' : ''}${timestamp}-${random}`;
};
