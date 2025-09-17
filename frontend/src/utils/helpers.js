/**
 * Utility helper functions for the wildlife monitoring system
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return 'Unknown';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format confidence percentage
 */
export const formatConfidence = (confidence, decimals = 1) => {
  if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
    return 'N/A';
  }
  return `${(confidence * 100).toFixed(decimals)}%`;
};

/**
 * Format species name for display
 */
export const formatSpeciesName = (species) => {
  if (!species) return 'Unknown Species';
  return species
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

/**
 * Get confidence level label
 */
export const getConfidenceLevel = (confidence) => {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.7) return 'Medium';
  if (confidence >= 0.6) return 'Low';
  return 'Very Low';
};

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export const formatNumber = (num, decimals = 1) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  
  const units = ['', 'K', 'M', 'B', 'T'];
  const threshold = 1000;
  
  if (Math.abs(num) < threshold) {
    return num.toString();
  }
  
  const unitIndex = Math.floor(Math.log(Math.abs(num)) / Math.log(threshold));
  const scaledNum = num / Math.pow(threshold, unitIndex);
  
  return `${scaledNum.toFixed(decimals)}${units[unitIndex]}`;
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Debounce function execution
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default {
  formatDate,
  formatConfidence,
  formatSpeciesName,
  getConfidenceLevel,
  formatNumber,
  formatPercentage,
  truncateText,
  capitalizeWords,
  isValidEmail,
  debounce
};
