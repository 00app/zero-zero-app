// Production configuration for Zero Zero app
export const config = {
  // API Configuration
  waterQuality: {
    baseUrl: import.meta.env?.VITE_WATER_API_URL || 'https://www.waterqualitydata.us/data/Result/search',
    timeout: 10000,
    retries: 3
  },
  
  // App Configuration
  app: {
    name: 'Zero Zero',
    version: '1.0.0',
    environment: import.meta.env?.MODE || 'production',
    isDevelopment: import.meta.env?.MODE === 'development'
  },
  
  // Theme Configuration
  theme: {
    defaultTheme: 'dark',
    storageKey: 'zz-theme'
  },
  
  // User Data Configuration
  userData: {
    storageKey: 'zz-user-data',
    expirationDays: 30
  },
  
  // Animation Configuration
  animations: {
    defaultDuration: 300,
    glitchDuration: 2000,
    rsvpWordDuration: 300,
    transitionDuration: 400
  },
  
  // Carbon Calculation Constants
  carbon: {
    // Emission factors (kg CO2e per unit)
    electricity: {
      grid: 0.233, // kg CO2e per kWh (UK average)
      renewable: 0.041, // kg CO2e per kWh
      mixed: 0.150 // kg CO2e per kWh (mixed sources)
    },
    transport: {
      petrol: 2.31, // kg CO2e per liter
      diesel: 2.68, // kg CO2e per liter
      hybrid: 1.85, // kg CO2e per liter equivalent
      electric: 0.047, // kg CO2e per km (UK average)
      public: 0.089, // kg CO2e per km
      walking: 0, // kg CO2e per km
      cycling: 0 // kg CO2e per km
    },
    housing: {
      apartment: 0.8, // multiplier for smaller space
      house: 1.0, // baseline
      shared: 0.6 // multiplier for shared resources
    }
  },
  
  // Feature Flags
  features: {
    supabaseIntegration: true,
    waterQualityData: true,
    aiChat: true,
    carbonTracking: true,
    themeToggle: true,
    gestureNavigation: true
  }
} as const;

// Type definitions
export type Config = typeof config;
export type Environment = 'development' | 'production' | 'test';
export type Theme = 'light' | 'dark';

// Utility functions
export const isProduction = () => config.app.environment === 'production';
export const isDevelopment = () => config.app.isDevelopment;

// Get configuration value with type safety
export function getConfig<T extends keyof Config>(key: T): Config[T] {
  return config[key];
}

// Validate required environment variables
export function validateEnvironment(): boolean {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missing = requiredVars.filter(
    varName => !import.meta.env?.[varName]
  );
  
  if (missing.length > 0 && isProduction()) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
}

// Initialize configuration validation
if (isProduction()) {
  validateEnvironment();
}