/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_TWILIO_ACCOUNT_SID: string
  readonly VITE_TWILIO_AUTH_TOKEN: string
  readonly VITE_TWILIO_PHONE: string
  readonly VITE_AIR_QUALITY_API_KEY: string
  readonly VITE_WATER_API_URL: string
  readonly VITE_MONEY_SAVINGS_API: string
  readonly VITE_MONEY_API_KEY: string
  readonly VITE_REGION_UK_API: string
  readonly VITE_REGION_AUS_API: string
  readonly VITE_REGION_USA_API: string
  readonly VITE_REGION_EU_API: string
  readonly VITE_REGION_GHANA_API: string
  readonly VITE_REGION_GHANA_CITY: string
  readonly VITE_APP_NAME: string
  readonly VITE_AI_ASSISTANT_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
