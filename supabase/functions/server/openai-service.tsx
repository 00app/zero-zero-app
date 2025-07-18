// OpenAI Service for Zai Chat Assistant
// Handles all OpenAI API interactions with personalized context

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface UserContext {
  id: string;
  name: string;
  postcode: string;
  transport_mode?: string;
  home_type?: string;
  spend_amount?: number;
  carbon_saved_kg?: number;
  money_saved_pounds?: number;
  total_points?: number;
  actions_completed?: number;
  streak_days?: number;
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // Try multiple environment variable names for OpenAI API key
    this.apiKey = Deno.env.get('OPENAI_API_KEY') || 
                 Deno.env.get('VITE_OPENAI_API_KEY') || 
                 '';
    
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API key not found in environment variables');
      console.log('   Checked: OPENAI_API_KEY, VITE_OPENAI_API_KEY');
    } else {
      console.log('✅ OpenAI API key configured');
    }
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0 && this.apiKey.startsWith('sk-');
  }

  createSystemPrompt(userContext: UserContext): string {
    const region = this.extractRegionFromPostcode(userContext.postcode);
    
    return `You are Zai, a friendly, knowledgeable, and conversational AI assistant for the Zero Zero app, which helps users reduce their carbon footprint and live more sustainably.

Your personality:
- Warm, supportive, and encouraging (never judgmental)
- Use lowercase text to match the app's brutal design aesthetic
- Keep responses concise but meaningful (2-3 sentences max)
- Focus on actionable, personalized advice
- Celebrate progress and motivate continued action

User context:
- Name: ${userContext.name}
- Location: ${region}
- Transport: ${userContext.transport_mode || 'not specified'}
- Home: ${userContext.home_type || 'not specified'}
- Weekly spend: £${userContext.spend_amount || 'not specified'}
- Carbon saved: ${userContext.carbon_saved_kg || 0}kg co₂
- Money saved: £${userContext.money_saved_pounds || 0}
- Points earned: ${userContext.total_points || 0}
- Actions completed: ${userContext.actions_completed || 0}
- Current streak: ${userContext.streak_days || 0} days

Your mission:
- Suggest personalized sustainability actions based on their profile
- Explain carbon footprint impacts in simple terms
- Motivate continued eco-friendly habits
- Help them save money through sustainable choices
- Answer questions about their progress and lifestyle impacts

Topics to discuss:
- transport alternatives (based on their current mode)
- diet and food choices for carbon reduction
- home energy efficiency (based on their home type)
- money-saving sustainability tips (relevant to their spending)
- celebrating their achievements and progress
- practical tips for their location/region

Always respond in lowercase and keep the brutal, minimal aesthetic. Be encouraging about their ${userContext.actions_completed || 0} completed actions and ${userContext.streak_days || 0}-day streak.

If asked about something outside sustainability/lifestyle, gently redirect to zero zero topics.`;
  }

  createConversationStarter(userContext: UserContext): string {
    const region = this.extractRegionFromPostcode(userContext.postcode);
    const achievements = this.getAchievementContext(userContext);
    
    return `hi ${userContext.name}! 👋

${achievements}

based on your profile in ${region}, i have some personalized tips that could help you save money and reduce your carbon footprint today.

what would you like to chat about? your transport, home energy, diet choices, or maybe celebrating your progress?`;
  }

  private extractRegionFromPostcode(postcode: string): string {
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

  private getAchievementContext(userContext: UserContext): string {
    const points = userContext.total_points || 0;
    const streak = userContext.streak_days || 0;
    const carbonSaved = userContext.carbon_saved_kg || 0;
    const moneySaved = userContext.money_saved_pounds || 0;

    if (points === 0) {
      return "you're just getting started with zero zero - exciting!";
    }

    const achievements = [];
    
    if (streak > 0) {
      achievements.push(`${streak}-day streak going strong`);
    }
    
    if (carbonSaved > 0) {
      achievements.push(`${carbonSaved}kg co₂ saved`);
    }
    
    if (moneySaved > 0) {
      achievements.push(`£${moneySaved} saved`);
    }

    if (achievements.length > 0) {
      return `great progress! ${achievements.join(', ')}.`;
    }

    return `${points} points earned so far - you're making a difference!`;
  }

  async generateResponse(messages: ChatMessage[], userContext: UserContext): Promise<string> {
    if (!this.isConfigured()) {
      console.log('🤖 OpenAI not configured, using mock response');
      return this.getMockResponse(messages[messages.length - 1]?.content || '');
    }

    try {
      console.log('🤖 Generating OpenAI response...');
      
      // Prepare conversation with system prompt
      const systemPrompt = this.createSystemPrompt(userContext);
      const conversationMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.slice(-10) // Keep last 10 messages for context
      ];

      const requestBody = {
        model: 'gpt-4o-mini',
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 200,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      };

      console.log('📡 Making OpenAI API request...');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`;
        console.error('❌', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'sorry, i had trouble generating a response. please try again.';
      
      console.log('✅ OpenAI response generated successfully');
      return aiResponse.trim();
    } catch (error) {
      console.error('❌ OpenAI API error:', error.message);
      return this.getErrorResponse(error.message);
    }
  }

  private getMockResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
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
    
    if (lowerMessage.includes('progress') || lowerMessage.includes('points')) {
      return "you're doing amazing! every small action counts towards a more sustainable future. keep up the momentum and watch your impact grow!";
    }

    return "that's an interesting question! i'm here to help you reduce your carbon footprint and save money. what aspects of sustainable living would you like to explore?";
  }

  private getErrorResponse(errorMessage: string): string {
    if (errorMessage.includes('API key')) {
      return "i'm having trouble connecting right now. please check that your openai api key is set up correctly.";
    }
    
    if (errorMessage.includes('rate limit')) {
      return "lots of people are chatting with me right now! please try again in a moment.";
    }
    
    return "sorry, i'm having a brief technical issue. please try asking again - i'm here to help with your sustainability journey!";
  }

  getConversationStarter(userContext: UserContext): string {
    return this.createConversationStarter(userContext);
  }
}

export default OpenAIService;