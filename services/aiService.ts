// Zero Zero AI Service - Direct OpenAI Integration for Zai Chat
// Simplified approach with personalized sustainability tips

import { OnboardingData } from '../components/onboarding/OnboardingFlow';

interface ZaiResponse {
  content: string;
  conversationId?: string;
  error?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

class ZeroZeroAIService {
  private apiKey: string;
  private openai: any = null;
  private isConfigured: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    console.log('🤖 Initializing Zero Zero AI Service...');
    
    // Debug environment variables
    console.log('🔍 Environment check:', {
      hasImportMeta: typeof import.meta !== 'undefined',
      hasImportMetaEnv: typeof import.meta !== 'undefined' && !!import.meta.env,
      hasProcess: typeof process !== 'undefined',
      hasProcessEnv: typeof process !== 'undefined' && !!process.env,
      hasWindow: typeof window !== 'undefined'
    });
    
    // Get OpenAI API key from environment with multiple fallbacks
    this.apiKey = this.getEnvVar('VITE_OPENAI_API_KEY') || 
                 this.getEnvVar('OPENAI_API_KEY') || 
                 '';
    
    console.log('🔑 API Key search result:', {
      found: !!this.apiKey,
      isValid: this.apiKey.startsWith('sk-'),
      length: this.apiKey.length,
      prefix: this.apiKey ? this.apiKey.substring(0, 7) + '...' : 'none'
    });
    
    if (this.apiKey && this.apiKey.startsWith('sk-')) {
      this.isConfigured = true;
      console.log('✅ OpenAI API key configured successfully');
      this.initializeOpenAI();
    } else {
      console.log('📱 OpenAI API key not configured - using mock responses');
      console.log('   To enable AI features: Add VITE_OPENAI_API_KEY to your .env file');
      console.log('   Expected format: sk-proj-...');
    }
  }

  private getEnvVar(key: string): string {
    try {
      // Try Vite environment first (import.meta.env)
      if (typeof window !== 'undefined' && (window as any).__vite__ && (window as any).__vite__.env) {
        const value = (window as any).__vite__.env[key];
        if (value && value !== 'undefined') {
          console.log(`✅ Found ${key} in Vite environment`);
          return value;
        }
      }

      // Try import.meta.env (build time)
      try {
        if (import.meta && import.meta.env) {
          const value = import.meta.env[key];
          if (value && value !== 'undefined') {
            console.log(`✅ Found ${key} in import.meta.env`);
            return value;
          }
        }
      } catch (importError) {
        // import.meta not available, continue with other methods
      }
      
      // Try process.env as fallback (for Node.js environments)
      if (typeof process !== 'undefined' && process.env) {
        const value = process.env[key];
        if (value && value !== 'undefined') {
          console.log(`✅ Found ${key} in process.env`);
          return value;
        }
      }
      
      // Try window environment variables (for runtime)
      if (typeof window !== 'undefined' && (window as any).__env__) {
        const value = (window as any).__env__[key];
        if (value && value !== 'undefined') {
          console.log(`✅ Found ${key} in window.__env__`);
          return value;
        }
      }
      
      return '';
    } catch (error) {
      console.log(`Could not access environment variable ${key}`);
      return '';
    }
  }

  private async initializeOpenAI() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        console.log('🔗 Initializing OpenAI client...');
        
        // Dynamic import of OpenAI to avoid SSR issues
        const { default: OpenAI } = await import('openai');
        
        this.openai = new OpenAI({
          apiKey: this.apiKey,
          dangerouslyAllowBrowser: true,
        });
        
        // Test the connection with a simple request
        console.log('🧪 Testing OpenAI connection...');
        
        console.log('✅ OpenAI client initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI:', error);
        this.isConfigured = false;
        this.openai = null;
      }
    })();

    return this.initializationPromise;
  }

  isReady(): boolean {
    return this.isConfigured && this.openai !== null;
  }

  getConnectionStatus() {
    return {
      isConfigured: this.isConfigured,
      isReady: this.isReady(),
      mode: this.isReady() ? 'live' : 'mock',
      message: this.isReady() 
        ? 'Connected to OpenAI-powered Zai assistant'
        : 'Running in demo mode - add VITE_OPENAI_API_KEY for AI features',
      openaiConfigured: this.isConfigured
    };
  }

  createSystemPrompt(userData: OnboardingData): string {
    const location = userData.postcode ? this.extractLocationFromPostcode(userData.postcode) : 'the uk';
    
    return `You are Zai, a friendly AI assistant for Zero Zero, helping users live more sustainably while maintaining the app's brutal design aesthetic.

Your personality:
- Warm, encouraging, and supportive (never judgmental)  
- Use lowercase text to match the app's brutal design aesthetic
- Keep responses concise but meaningful (2-3 sentences max)
- Focus on actionable, personalized advice
- Celebrate progress and motivate continued action

User context:
- Name: ${userData.name}
- Location: ${location}
- Transport: ${userData.transport || 'not specified'}
- Home: ${userData.homeType || 'not specified'} 
- Weekly spend: £${userData.spendAmount || 'not specified'}

Your mission:
- Give personalized sustainability tips to save carbon + money
- Explain carbon footprint impacts in simple terms
- Motivate continued eco-friendly habits
- Help them save money through sustainable choices
- Include helpful links where relevant (UK-focused)

Topics to focus on:
- transport alternatives (based on their current mode)
- diet and food choices for carbon reduction  
- home energy efficiency (based on their home type)
- money-saving sustainability tips (relevant to their spending)
- celebrating their achievements and progress

Always respond in lowercase and keep the brutal, minimal aesthetic. Be encouraging and uplifting about their sustainability journey.

If asked about something outside sustainability/lifestyle, gently redirect to zero zero topics.`;
  }

  private extractLocationFromPostcode(postcode: string): string {
    if (!postcode) return 'the uk';
    
    // Extract first part of UK postcode for regional context
    const area = postcode.split(' ')[0]?.substring(0, 2)?.toLowerCase();
    
    const regions: { [key: string]: string } = {
      'sw': 'southwest london',
      'se': 'southeast london', 
      'nw': 'northwest london',
      'ne': 'northeast london',
      'w1': 'west london',
      'ec': 'central london',
      'wc': 'central london',
      'e1': 'east london',
      'n1': 'north london',
      'm1': 'manchester',
      'm2': 'manchester',
      'b1': 'birmingham',
      'b2': 'birmingham',
      'ls': 'leeds',
      'bs': 'bristol',
      'l1': 'liverpool',
      'l2': 'liverpool',
      'g1': 'glasgow',
      'g2': 'glasgow',
      'eh': 'edinburgh'
    };

    return regions[area] || 'the uk';
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isConfigured) {
        return {
          success: false,
          message: 'OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your environment variables.'
        };
      }

      await this.initializeOpenAI();
      
      if (!this.openai) {
        return {
          success: false,
          message: 'Failed to initialize OpenAI client.'
        };
      }

      // Test with a simple request
      const testResponse = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 10,
      });

      return {
        success: true,
        message: 'OpenAI connection successful!'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  async getZaiTip(userData: OnboardingData): Promise<string> {
    if (!this.isReady()) {
      return this.getMockTip(userData);
    }

    try {
      await this.initializeOpenAI();
      
      if (!this.openai) {
        return this.getMockTip(userData);
      }

      const location = userData.postcode ? this.extractLocationFromPostcode(userData.postcode) : 'the uk';
      
      const prompt = `You're Zai, a climate-smart assistant helping ${userData.name} from ${location}.
They mostly ${userData.transport || 'walk'}, live in a ${userData.homeType || 'flat'}, and spend about £${userData.spendAmount || '50'} weekly.
Give them 2 personalised, uplifting tips to save carbon + money this week. Include links where useful.
Keep it lowercase, concise, and actionable. Focus on their specific situation.`;

      console.log('🤖 Generating OpenAI tip...');

      const chat = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      });

      const response = chat.choices[0].message.content || this.getMockTip(userData);
      console.log('✅ OpenAI tip generated successfully');
      return response;
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      return this.getErrorResponse(error.message);
    }
  }

  async sendMessage(message: string, userData: OnboardingData, conversationHistory: ChatMessage[] = []): Promise<ZaiResponse> {
    if (!this.isReady()) {
      return {
        content: this.getMockResponse(message, userData),
        conversationId: 'mock-conversation'
      };
    }

    try {
      await this.initializeOpenAI();
      
      if (!this.openai) {
        return {
          content: this.getMockResponse(message, userData),
          conversationId: 'mock-conversation'
        };
      }

      const systemPrompt = this.createSystemPrompt(userData);
      
      // Build conversation with system prompt and recent history
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.slice(-8).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ];

      console.log('🤖 Sending message to OpenAI...');

      const chat = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 200,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const response = chat.choices[0].message.content || 'sorry, i had trouble generating a response. please try again.';
      
      console.log('✅ OpenAI response generated successfully');
      return {
        content: response.trim(),
        conversationId: `conv_${Date.now()}`
      };
    } catch (error) {
      console.error('❌ OpenAI chat error:', error);
      return {
        content: this.getErrorResponse(error.message),
        error: error.message
      };
    }
  }

  getConversationStarter(userData: OnboardingData): string {
    const location = userData.postcode ? this.extractLocationFromPostcode(userData.postcode) : 'the uk';
    
    return `hi ${userData.name}!

welcome to zero zero! i'm zai, your sustainability assistant.

based on your profile in ${location}, i have some personalized tips that could help you save money and reduce your carbon footprint today.

what would you like to chat about? your transport, home energy, diet choices, or maybe some quick wins to get started?`;
  }

  private getMockTip(userData: OnboardingData): string {
    const location = userData.postcode ? this.extractLocationFromPostcode(userData.postcode) : 'the uk';
    
    if (userData.transport?.includes('car')) {
      return `hey ${userData.name}! switching to public transport 2x this week in ${location} could save you £15 and 12kg co₂. batch your errands into one trip to cut fuel costs by 30%.`;
    }
    
    if (userData.transport?.includes('public')) {
      return `great choice on public transport ${userData.name}! walk or cycle for journeys under 2 miles to save £8 weekly. get a railcard for city travel - saves the average person £200 annually.`;
    }
    
    return `hello ${userData.name}! unplug devices when not in use - your ${userData.homeType || 'home'} could save £85 annually. try meat-free meals 3x this week to save money and reduce carbon by 40%.`;
  }

  private getMockResponse(message: string, userData: OnboardingData): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('travel') || lowerMessage.includes('transport')) {
      return "great question about transport! switching to public transport 2x per week could save you around 54kg co₂ annually. have you considered trying the bus for your regular journeys?";
    }
    
    if (lowerMessage.includes('food') || lowerMessage.includes('diet')) {
      return "food choices make a huge impact! even reducing meat just 3 days per week can save 2,100l of water and cut your carbon footprint by 40%. fancy trying some plant-based recipes?";
    }
    
    if (lowerMessage.includes('energy') || lowerMessage.includes('home')) {
      return "home energy is a great place to start! unplugging devices when not in use can save around £85 per year. your gaming setup alone could be costing you more than you think.";
    }
    
    if (lowerMessage.includes('money') || lowerMessage.includes('save')) {
      return "sustainability saves money too! buying second-hand can cut costs by 60% while reducing your environmental impact. what are you thinking of purchasing?";
    }

    return `that's an interesting question, ${userData.name}! i'm here to help you reduce your carbon footprint and save money. what aspects of sustainable living would you like to explore?`;
  }

  private getErrorResponse(errorMessage: string): string {
    if (errorMessage.includes('API key') || errorMessage.includes('Unauthorized')) {
      return "i'm having trouble connecting right now. please check that your openai api key is set up correctly in your environment variables.";
    }
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return "lots of people are chatting with me right now! please try again in a moment.";
    }
    
    return "sorry, i'm having a brief technical issue. please try asking again - i'm here to help with your sustainability journey!";
  }

  // Utility functions
  formatMessage(content: string, role: 'user' | 'assistant'): ChatMessage {
    return {
      role,
      content,
      timestamp: new Date().toISOString()
    };
  }

  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
export const aiService = new ZeroZeroAIService();

// Export types and service
export type { ZaiResponse, ChatMessage };
export default aiService;