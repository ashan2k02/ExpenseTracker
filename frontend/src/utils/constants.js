/**
 * Application constants
 */

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    PASSWORD: '/auth/password',
  },
  EXPENSES: '/expenses',
  CATEGORIES: '/categories',
  BUDGETS: '/budgets',
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    MONTHLY: '/reports/monthly',
    WEEKLY: '/reports/weekly',
    YEARLY: '/reports/yearly',
  },
};

// Default categories with icons and colors
export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍕', color: '#ef4444' },
  { name: 'Transportation', icon: '🚗', color: '#f97316' },
  { name: 'Shopping', icon: '🛒', color: '#eab308' },
  { name: 'Entertainment', icon: '🎬', color: '#22c55e' },
  { name: 'Bills & Utilities', icon: '💡', color: '#3b82f6' },
  { name: 'Healthcare', icon: '🏥', color: '#8b5cf6' },
  { name: 'Education', icon: '📚', color: '#ec4899' },
  { name: 'Travel', icon: '✈️', color: '#06b6d4' },
  { name: 'Other', icon: '📦', color: '#6b7280' },
];

// Available colors for categories
export const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#6b7280',
];

// Available icons for categories
export const CATEGORY_ICONS = [
  '🍕', '🚗', '🛒', '🎬', '💡', '🏥', '📚', '✈️', '🏠', '💳', 
  '🎮', '👕', '💪', '📦', '🎁', '☕', '🍷', '🎵', '📱', '💻',
];

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
};

// Date format options
export const DATE_FORMATS = {
  SHORT: { month: 'short', day: 'numeric' },
  MEDIUM: { month: 'short', day: 'numeric', year: 'numeric' },
  LONG: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#6366f1',
  SUCCESS: '#22c55e',
  WARNING: '#eab308',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
};
