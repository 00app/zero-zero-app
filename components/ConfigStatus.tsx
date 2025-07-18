import { useState, useEffect } from 'react';
import aiService from '../services/aiService';

interface ConfigStatusState {
  supabase: boolean;
  openai: boolean;
  mode: string;
  message: string;
  details: {
    supabaseUrl: boolean;
    supabaseKey: boolean;
    openaiKey: boolean;
  };
}

export function ConfigStatus() {
  const [config, setConfig] = useState<ConfigStatusState>({
    supabase: false,
    openai: false,
    mode: 'checking',
    message: 'checking configuration...',
    details: {
      supabaseUrl: false,
      supabaseKey: false,
      openaiKey: false
    }
  });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        // Check AI service status
        const aiStatus = aiService.getConnectionStatus();
        
        // Check Supabase status
        let supabaseConfigured = false;
        let supabaseUrl = false;
        let supabaseKey = false;
        
        try {
          const { getSupabaseStatus } = await import('../services/supabase');
          const supabaseStatus = getSupabaseStatus();
          supabaseConfigured = supabaseStatus.isConfigured;
          
          // Check individual components
          supabaseUrl = !!import.meta.env?.VITE_SUPABASE_URL;
          supabaseKey = !!import.meta.env?.VITE_SUPABASE_ANON_KEY;
        } catch (error) {
          console.log('supabase service not available');
        }
        
        // Check OpenAI configuration
        const openaiKey = !!import.meta.env?.VITE_OPENAI_API_KEY;
        
        setConfig({
          supabase: supabaseConfigured,
          openai: aiStatus.isReady,
          mode: aiStatus.mode,
          message: aiStatus.message,
          details: {
            supabaseUrl,
            supabaseKey,
            openaiKey
          }
        });

        // Auto-hide after 8 seconds if everything is working
        if (supabaseConfigured && aiStatus.isReady) {
          setTimeout(() => setIsVisible(false), 8000);
        }
      } catch (error) {
        console.error('configuration check failed:', error);
        setConfig({
          supabase: false,
          openai: false,
          mode: 'error',
          message: 'configuration check failed',
          details: {
            supabaseUrl: false,
            supabaseKey: false,
            openaiKey: false
          }
        });
      }
    };

    checkConfiguration();
    
    // Check again after a delay to ensure services are loaded
    const timer = setTimeout(checkConfiguration, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const getStatusSymbol = (isConfigured: boolean) => {
    return isConfigured ? '✓' : '×';
  };

  const getStatusColor = () => {
    if (config.supabase && config.openai) return 'var(--zz-accent)'; // Green
    if (config.supabase && !config.openai) return 'var(--zz-grey)'; // Orange
    return 'var(--zz-text)'; // Default
  };

  const getDetailedStatus = () => {
    const issues = [];
    if (!config.details.supabaseUrl) issues.push('supabase_url');
    if (!config.details.supabaseKey) issues.push('supabase_key');
    if (!config.details.openaiKey) issues.push('openai_key');
    
    if (issues.length === 0) {
      return 'all environment variables configured';
    }
    
    return `missing: ${issues.join(', ')}`;
  };

  return (
    <div 
      className="fixed top-4 right-4 z-40 p-4 max-w-sm"
      style={{
        background: 'var(--zz-card)',
        border: '2px solid var(--zz-border)',
        borderRadius: '0',
        color: 'var(--zz-text)',
        fontSize: '12px',
        fontFamily: 'Roboto, sans-serif',
        lineHeight: 1.3
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="zz-small" style={{ fontWeight: 'var(--font-medium)' }}>
          zero zero config
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-current opacity-60 hover:opacity-100"
          style={{ 
            fontSize: '16px', 
            lineHeight: 1,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>supabase database</span>
          <span style={{ fontWeight: 'var(--font-medium)' }}>
            {getStatusSymbol(config.supabase)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>openai (zai chat)</span>
          <span style={{ fontWeight: 'var(--font-medium)' }}>
            {getStatusSymbol(config.openai)}
          </span>
        </div>
        
        <div 
          className="pt-2 border-t opacity-80"
          style={{ borderColor: 'var(--zz-border)' }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2"
              style={{ 
                background: getStatusColor(),
                borderRadius: '0'
              }}
            />
            <span style={{ textTransform: 'lowercase' }}>
              {config.mode} mode
            </span>
          </div>
          <div className="mt-1 text-xs opacity-70">
            {config.message}
          </div>
        </div>

        {/* Detailed status */}
        <div 
          className="pt-2 border-t text-xs opacity-60"
          style={{ borderColor: 'var(--zz-border)' }}
        >
          <div>environment status:</div>
          <div className="mt-1" style={{ fontSize: '10px' }}>
            {getDetailedStatus()}
          </div>
        </div>
      </div>

      {(!config.supabase || !config.openai) && (
        <div className="mt-3 pt-2 border-t" style={{ borderColor: 'var(--zz-border)' }}>
          <div className="text-xs opacity-70">
            run <code>npm run validate</code> to check configuration
          </div>
        </div>
      )}
    </div>
  );
}