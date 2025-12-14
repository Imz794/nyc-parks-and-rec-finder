import xss from 'xss';

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return xss(str.trim());
};
