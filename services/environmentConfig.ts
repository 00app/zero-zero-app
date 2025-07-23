/**
 * Zero Zero Environment Configuration
 * Centralized environment variable management with validation
 */

export interface EnvironmentConfig {
  // Core Services
  supabase: {
    url: string;
    anonKey: string;
    isConfigured: boolean;
  };
  
  // AI Services
  openai: {
    apiKey: string;
    isConfigured: boolean;
  };
  
  // Location Services
  googleMaps: {
    apiKey: string;
    isConfigured: boolean;
  };
  
  // Optional Services
  twilioSms: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    isConfigured: boolean;
  };
  
  airQuality: {
    apiKey: string;
    isConfigured: boolean;
  };
  
  // App Configuration
  app: {
    name: string;
    aiAssistantName: string;
    environment: string;
  };
}

/**
 * Validates and returns environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  // Helper to safely get environment variables
  const getEnvVar = (key: string): string => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || '';
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || '';
    }
    return '';
  };

  // Core Services
  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
  const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
  const openaiApiKey = getEnvVar('VITE_OPENAI_API_KEY');
  const googleMapsApiKey = getEnvVar('VITE_GOOGLE_MAPS_API_KEY');
  
  // Optional Services
  const twilioAccountSid = getEnvVar('VITE_TWILIO_ACCOUNT_SID');
  const twilioAuthToken = getEnvVar('VITE_TWILIO_AUTH_TOKEN');
  const twilioPhone = getEnvVar('VITE_TWILIO_PHONE');
  const airQualityApiKey = getEnvVar('VITE_AIR_QUALITY_API_KEY');
  
  // App Configuration
  const appName = getEnvVar('VITE_APP_NAME') || 'zero zero';
  const aiAssistantName = getEnvVar('VITE_AI_ASSISTANT_NAME') || 'zai';
  const nodeEnv = getEnvVar('NODE_ENV') || 'development';

  return {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      isConfigured: !!(supabaseUrl && supabaseAnonKey && 
                      supabaseUrl.includes('supabase.co') && 
                      supabaseAnonKey.startsWith('eyJ'))
    },
    
    openai: {
      apiKey: openaiApiKey,
      isConfigured: !!(openaiApiKey && openaiApiKey.startsWith('sk-'))
    },
    
    googleMaps: {
      apiKey: googleMapsApiKey,
      isConfigured: !!(googleMapsApiKey && googleMapsApiKey.startsWith('AIza'))
    },
    
    twilioSms: {
      accountSid: twilioAccountSid,
      authToken: twilioAuthToken,
      phoneNumber: twilioPhone,
      isConfigured: !!(twilioAccountSid && twilioAuthToken && twilioPhone &&
                       twilioAccountSid.startsWith('AC') && 
                       twilioPhone.startsWith('+'))
    },
    
    airQuality: {
      apiKey: airQualityApiKey,
      isConfigured: !!airQualityApiKey
    },
    
    app: {
      name: appName,
      aiAssistantName: aiAssistantName,
      environment: nodeEnv
    }
  };
}

/**
 * Returns a status report of all environment configurations
 */
export function getEnvironmentStatus() {
  const config = getEnvironmentConfig();
  
  return {
    core: {
      supabase: config.supabase.isConfigured ? '✅ connected' : '❌ not configured',
      openai: config.openai.isConfigured ? '✅ connected' : '❌ not configured',
      googleMaps: config.googleMaps.isConfigured ? '✅ connected' : '❌ not configured'
    },
    optional: {
      twilioSms: config.twilioSms.isConfigured ? '✅ connected' : '⚠️ optional',
      airQuality: config.airQuality.isConfigured ? '✅ connected' : '⚠️ optional'
    },
    app: {
      name: config.app.name,
      assistant: config.app.aiAssistantName,
      environment: config.app.environment
    },
    isFullyConfigured: config.supabase.isConfigured && 
                      config.openai.isConfigured && 
                      config.googleMaps.isConfigured
  };
}

/**
 * Logs environment status to console (development only)
 */
export function logEnvironmentStatus() {
  const config = getEnvironmentConfig();
  
  if (config.app.environment === 'development') {
    console.log('🔧 Zero Zero Environment Configuration:');
    console.log('=====================================');
    
    const status = getEnvironmentStatus();
    
    console.log('\n📊 Core Services:');
    Object.entries(status.core).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n🔧 Optional Services:');
    Object.entries(status.optional).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n🎯 App Configuration:');
    console.log(`   name: ${status.app.name}`);
    console.log(`   assistant: ${status.app.assistant}`);
    console.log(`   environment: ${status.app.environment}`);
    
    console.log(`\n${status.isFullyConfigured ? '✅' : '⚠️'} Overall Status: ${
      status.isFullyConfigured ? 'Fully Configured' : 'Partial Configuration'
    }`);
    
    if (!status.isFullyConfigured) {
      console.log('\n💡 To enable all features, add missing environment variables to .env');
    }
    
    console.log('=====================================\n');
  }
}

export default {
  getEnvironmentConfig,
  getEnvironmentStatus,
  logEnvironmentStatus
};