// Centralized API URL Management
// Production Backend

// Production server URL (Railway deployment)
const PRODUCTION_URL = 'https://asli-stud-back-production.up.railway.app';

// Local development URL (for reference)
const LOCAL_URL = 'http://localhost:5000';

// Use production URL by default
// VITE_API_URL environment variable can override this
// However, in production (Vercel):
// - Ignore localhost URLs (will cause connection errors)
// - Force HTTP URLs to HTTPS (to prevent mixed content errors)
const envUrl = import.meta.env.VITE_API_URL;
// Check if we're running on localhost (development)
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === ''
);
const isProduction = import.meta.env.PROD && !isLocalhost;
const isLocalhostUrl = envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'));
const isHttpUrl = envUrl && envUrl.startsWith('http://') && !envUrl.includes('localhost');

const allowHttpApi = import.meta.env.VITE_ALLOW_HTTP === 'true';

const isIpAddress = (url?: string) => {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  } catch {
    return false;
  }
};

// Use Railway URL by default, allow override via VITE_API_URL
// In production: ignore localhost URLs, force HTTPS for HTTP domains
// In development: use Railway URL unless VITE_API_URL is explicitly set to localhost
let finalUrl: string;
if (envUrl) {
  // Environment variable is set
  if (isLocalhostUrl && isProduction) {
    finalUrl = PRODUCTION_URL; // Ignore localhost in production
  } else if (isHttpUrl && !allowHttpApi && !isIpAddress(envUrl) && isProduction) {
    finalUrl = envUrl.replace('http://', 'https://'); // Force HTTPS for domains in production
  } else {
    finalUrl = envUrl; // Use the env URL as specified
  }
} else {
  // No environment variable - use Railway URL by default
  finalUrl = PRODUCTION_URL;
}

export const API_BASE_URL = finalUrl;

// Log current configuration
const envLabel = API_BASE_URL.includes('localhost')
  ? 'LOCAL'
  : isIpAddress(API_BASE_URL)
    ? 'DIRECT_IP'
    : 'PRODUCTION';
console.log(`🔌 API Base URL: ${API_BASE_URL} (${envLabel})`);
console.log(`🔍 Environment: isProduction=${isProduction}, isLocalhost=${isLocalhost}, envUrl=${envUrl || 'not set'}`);
console.log(`⚠️ If you see api.aslilearn.ai, clear browser cache and restart dev server!`);

// Helper function for making API calls
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {}),
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
};

export default API_BASE_URL;
