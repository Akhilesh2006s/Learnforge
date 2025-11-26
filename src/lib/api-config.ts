// Centralized API URL Management
// Production Backend

// Production server URL (using HTTPS for Vercel deployment)
// Point to the public API domain (served via Nginx proxy on the droplet)
const PRODUCTION_URL = 'https://api.aslilearn.ai';

// Local development URL (for reference)
const LOCAL_URL = 'http://localhost:5000';

// Use production URL by default
// VITE_API_URL environment variable can override this
// However, in production (Vercel):
// - Ignore localhost URLs (will cause connection errors)
// - Force HTTP URLs to HTTPS (to prevent mixed content errors)
const envUrl = import.meta.env.VITE_API_URL;
const isProduction = import.meta.env.PROD || (typeof window !== 'undefined' && !window.location.hostname.includes('localhost'));
const isLocalhostUrl = envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'));
const isHttpUrl = envUrl && envUrl.startsWith('http://') && !envUrl.includes('localhost');

// In production: ignore localhost, convert HTTP to HTTPS, otherwise use envUrl or default
let finalUrl = envUrl || PRODUCTION_URL;
if (isProduction) {
  if (isLocalhostUrl) {
    finalUrl = PRODUCTION_URL; // Ignore localhost in production
  } else if (isHttpUrl) {
    finalUrl = envUrl.replace('http://', 'https://'); // Force HTTPS in production
  }
}

export const API_BASE_URL = finalUrl;

// Log current configuration
console.log(`🔌 API Base URL: ${API_BASE_URL} (${API_BASE_URL.includes('localhost') ? 'LOCAL' : 'RAILWAY'})`);

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
