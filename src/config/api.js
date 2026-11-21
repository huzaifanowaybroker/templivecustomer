// Central API configuration for the customer web app.
// The base URL comes from .env (REACT_APP_API_URL). Edit .env, never the components.
// Restart `npm start` after changing .env (Create React App reads it at startup).

const RAW_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

export const api = (path = '') => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
