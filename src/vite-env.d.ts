/// <reference types="vite/client" />

// --- define your VITE_ env keys for strong typing ---
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly MODE: 'development' | 'production' | 'test'
  // add other VITE_… vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// patch missing module
declare module 'react-dom/client'
