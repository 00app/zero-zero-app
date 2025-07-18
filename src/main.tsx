import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Environment validation in development
if (import.meta.env.MODE === 'development') {
  console.log('🔧 Zero Zero Development Mode');
  console.log('Environment Variables:');
  console.log('- SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ configured' : '❌ missing');
  console.log('- SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ configured' : '❌ missing');
  console.log('- OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? '✅ configured' : '❌ missing');
  console.log('- GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ configured' : '❌ missing');
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);