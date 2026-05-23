/**
 * Formats a number as Indian Rupee (INR) currency.
 * @param {number|string} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹ 0';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return '₹ 0';

  return `₹ ${num.toLocaleString('en-IN')}`;
};

/**
 * Returns the correct full URL for images, supporting local uploads.
 * @param {string} path - The image path from the database.
 * @returns {string} The full URL or empty if none.
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
};
