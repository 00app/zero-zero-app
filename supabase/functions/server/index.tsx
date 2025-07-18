import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { cors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import OpenAIService from './openai-service.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize OpenAI service
const openAIService = new OpenAIService();

// Initialize database schema
async function initializeDatabase() {
  console.log('🔧 Initializing Zero Zero database schema...');

  try {
    // Create user_profiles table
    const { error: profileError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          postcode TEXT,
          transport_mode TEXT,
          home_type TEXT,
          spend_amount INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Allow anonymous access for prototyping
        CREATE POLICY IF NOT EXISTS "Allow anonymous access to user_profiles" 
        ON user_profiles FOR ALL USING (true);
      `
    });

    if (profileError) {
      console.error('❌ Error creating user_profiles table:', profileError);
    } else {
      console.log('✅ user_profiles table ready');
    }

    // Create card_interactions table
    const { error: interactionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS card_interactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
          card_id TEXT NOT NULL,
          card_category TEXT NOT NULL,
          action_taken TEXT NOT NULL CHECK (action_taken IN ('accept', 'reject', 'input_submitted', 'expanded', 'link_clicked')),
          action_data JSONB,
          points_earned INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security
        ALTER TABLE card_interactions ENABLE ROW LEVEL SECURITY;
        
        -- Allow anonymous access for prototyping
        CREATE POLICY IF NOT EXISTS "Allow anonymous access to card_interactions" 
        ON card_interactions FOR ALL USING (true);
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_card_interactions_user_id ON card_interactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_card_interactions_created_at ON card_interactions(created_at DESC);
      `
    });

    if (interactionError) {
      console.error('❌ Error creating card_interactions table:', interactionError);
    } else {
      console.log('✅ card_interactions table ready');
    }

    // Create user_rewards table
    const { error: rewardsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_rewards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
          total_points INTEGER DEFAULT 0,
          carbon_saved_kg DECIMAL(10,2) DEFAULT 0,
          money_saved_pounds DECIMAL(10,2) DEFAULT 0,
          actions_completed INTEGER DEFAULT 0,
          streak_days INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security
        ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
        
        -- Allow anonymous access for prototyping
        CREATE POLICY IF NOT EXISTS "Allow anonymous access to user_rewards" 
        ON user_rewards FOR ALL USING (true);
      `
    });

    if (rewardsError) {
      console.error('❌ Error creating user_rewards table:', rewardsError);
    } else {
      console.log('✅ user_rewards table ready');
    }

    // Create zai_tips table
    const { error: tipsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS zai_tips (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          card_category TEXT NOT NULL,
          tip_text TEXT NOT NULL,
          context_data JSONB,
          effectiveness_score DECIMAL(3,1) DEFAULT 5.0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security
        ALTER TABLE zai_tips ENABLE ROW LEVEL SECURITY;
        
        -- Allow anonymous access for prototyping
        CREATE POLICY IF NOT EXISTS "Allow anonymous access to zai_tips" 
        ON zai_tips FOR ALL USING (true);
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_zai_tips_category ON zai_tips(card_category);
        CREATE INDEX IF NOT EXISTS idx_zai_tips_effectiveness ON zai_tips(effectiveness_score DESC);
      `
    });

    if (tipsError) {
      console.error('❌ Error creating zai_tips table:', tipsError);
    } else {
      console.log('✅ zai_tips table ready');
    }

    // Create zai_conversations table for chat history
    const { error: chatError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS zai_conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
          message_role TEXT NOT NULL CHECK (message_role IN ('user', 'assistant')),
          message_content TEXT NOT NULL,
          message_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          conversation_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security
        ALTER TABLE zai_conversations ENABLE ROW LEVEL SECURITY;
        
        -- Allow anonymous access for prototyping
        CREATE POLICY IF NOT EXISTS "Allow anonymous access to zai_conversations" 
        ON zai_conversations FOR ALL USING (true);
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_zai_conversations_user_id ON zai_conversations(user_id);
        CREATE INDEX IF NOT EXISTS idx_zai_conversations_conversation_id ON zai_conversations(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_zai_conversations_timestamp ON zai_conversations(message_timestamp DESC);
      `
    });

    if (chatError) {
      console.error('❌ Error creating zai_conversations table:', chatError);
    } else {
      console.log('✅ zai_conversations table ready');
    }

    // Insert sample Zai tips
    const { error: seedError } = await supabase
      .from('zai_tips')
      .upsert([
        {
          card_category: 'travel',
          tip_text: 'using the bus 2x/week instead of driving could save 54kg co₂ annually',
          effectiveness_score: 8.5
        },
        {
          card_category: 'food',
          tip_text: 'switching to lentils 3x/week saves 2,100l water and reduces carbon by 40%',
          effectiveness_score: 9.2
        },
        {
          card_category: 'devices',
          tip_text: 'your gaming setup adds ~700kg co₂/year — unplug when not in use',
          effectiveness_score: 7.8
        },
        {
          card_category: 'shopping', 
          tip_text: 'buying second-hand can cut your fashion impact by 60%',
          effectiveness_score: 8.9
        },
        {
          card_category: 'water',
          tip_text: 'a low-flow showerhead saves 9l/min without reducing pressure',
          effectiveness_score: 8.1
        }
      ], { 
        onConflict: 'tip_text',
        ignoreDuplicates: true 
      });

    if (seedError) {
      console.error('❌ Error seeding zai_tips:', seedError);
    } else {
      console.log('✅ zai_tips seeded with sample data');
    }

    console.log('🎉 Zero Zero database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// API Routes
const app = {
  async fetch(req: Request): Promise<Response> {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/make-server-33e19f99', '');

    console.log(`📝 ${req.method} ${path}`);

    try {
      // Initialize database on startup
      if (path === '/init') {
        await initializeDatabase();
        return new Response(
          JSON.stringify({ success: true, message: 'Database initialized successfully' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // Get Zai conversation starter
      if (path.startsWith('/zai/starter/') && req.method === 'GET') {
        const userId = path.split('/')[3];
        
        // Get user profile and rewards for context
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        const { data: rewards } = await supabase
          .from('user_rewards')
          .select('*')
          .eq('user_id', userId)
          .single();

        const userContext = {
          ...profile,
          ...rewards
        };

        const starter = openAIService.getConversationStarter(userContext);

        return new Response(
          JSON.stringify({ message: starter }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // Chat with Zai
      if (path === '/zai/chat' && req.method === 'POST') {
        const { userId, message, conversationId } = await req.json();
        
        if (!userId || !message) {
          return new Response(
            JSON.stringify({ error: 'Missing userId or message' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        // Get user profile and rewards for context
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        const { data: rewards } = await supabase
          .from('user_rewards')
          .select('*')
          .eq('user_id', userId)
          .single();

        const userContext = {
          ...profile,
          ...rewards
        };

        // Get recent conversation history
        const { data: chatHistory } = await supabase
          .from('zai_conversations')
          .select('*')
          .eq('user_id', userId)
          .eq('conversation_id', conversationId || 'default')
          .order('message_timestamp', { ascending: true })
          .limit(10);

        // Format chat history for OpenAI
        const messages = (chatHistory || []).map(msg => ({
          role: msg.message_role as 'user' | 'assistant',
          content: msg.message_content,
          timestamp: msg.message_timestamp
        }));

        // Add current user message
        messages.push({
          role: 'user' as const,
          content: message,
          timestamp: new Date().toISOString()
        });

        // Generate AI response
        const aiResponse = await openAIService.generateResponse(messages, userContext);

        // Save conversation to database
        const conversationIdToUse = conversationId || crypto.randomUUID();
        
        await supabase
          .from('zai_conversations')
          .insert([
            {
              user_id: userId,
              message_role: 'user',
              message_content: message,
              conversation_id: conversationIdToUse
            },
            {
              user_id: userId,
              message_role: 'assistant',
              message_content: aiResponse,
              conversation_id: conversationIdToUse
            }
          ]);

        return new Response(
          JSON.stringify({ 
            message: aiResponse,
            conversationId: conversationIdToUse
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // Get conversation history
      if (path.startsWith('/zai/history/') && req.method === 'GET') {
        const userId = path.split('/')[3];
        const conversationId = url.searchParams.get('conversationId') || 'default';
        
        const { data, error } = await supabase
          .from('zai_conversations')
          .select('*')
          .eq('user_id', userId)
          .eq('conversation_id', conversationId)
          .order('message_timestamp', { ascending: true });

        if (error) {
          console.error('❌ Error fetching conversation history:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        return new Response(
          JSON.stringify(data || []),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // Create user profile
      if (path === '/users' && req.method === 'POST') {
        const userData = await req.json();
        
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([{
            email: userData.email || `${userData.name}@temp.com`,
            name: userData.name,
            postcode: userData.postcode,
            transport_mode: userData.transportMode,
            home_type: userData.homeType,
            spend_amount: userData.spendAmount
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating user:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        // Initialize user rewards
        await supabase
          .from('user_rewards')
          .insert([{
            user_id: data.id,
            total_points: 0,
            carbon_saved_kg: 0,
            money_saved_pounds: 0,
            actions_completed: 0,
            streak_days: 0
          }]);

        return new Response(
          JSON.stringify(data),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201 
          }
        );
      }

      // Log card interaction
      if (path === '/interactions' && req.method === 'POST') {
        const interactionData = await req.json();
        
        const { data, error } = await supabase
          .from('card_interactions')
          .insert([interactionData])
          .select()
          .single();

        if (error) {
          console.error('❌ Error logging interaction:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        return new Response(
          JSON.stringify(data),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201 
          }
        );
      }

      // Update user rewards
      if (path.startsWith('/rewards/') && req.method === 'PUT') {
        const userId = path.split('/')[2];
        const updates = await req.json();
        
        const { data, error } = await supabase
          .from('user_rewards')
          .upsert([{
            user_id: userId,
            ...updates,
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating rewards:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        return new Response(
          JSON.stringify(data),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // Get user rewards
      if (path.startsWith('/rewards/') && req.method === 'GET') {
        const userId = path.split('/')[2];
        
        const { data, error } = await supabase
          .from('user_rewards')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error fetching rewards:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        return new Response(
          JSON.stringify(data || null),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // Get Zai tips for category
      if (path.startsWith('/tips/') && req.method === 'GET') {
        const category = path.split('/')[2];
        const limit = parseInt(url.searchParams.get('limit') || '5');
        
        const { data, error } = await supabase
          .from('zai_tips')
          .select('*')
          .eq('card_category', category)
          .order('effectiveness_score', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('❌ Error fetching tips:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        return new Response(
          JSON.stringify(data || []),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // Health check
      if (path === '/health') {
        const openAIConfigured = openAIService.isConfigured();
        
        return new Response(
          JSON.stringify({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            service: 'zero-zero-api',
            openai_configured: openAIConfigured,
            features: {
              database: true,
              supabase: true,
              openai: openAIConfigured,
              zai_chat: openAIConfigured
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // 404 for unmatched routes
      return new Response(
        JSON.stringify({ error: 'Route not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );

    } catch (error) {
      console.error('❌ Server error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
  }
};

// Start the server
serve(app.fetch, { port: 8000 });

console.log('🚀 Zero Zero API server running on port 8000');
console.log('🤖 OpenAI configured:', openAIService.isConfigured());
console.log('📊 Routes available:');
console.log('  POST /make-server-33e19f99/init - Initialize database');
console.log('  POST /make-server-33e19f99/users - Create user profile');
console.log('  POST /make-server-33e19f99/interactions - Log card interaction');
console.log('  PUT  /make-server-33e19f99/rewards/:userId - Update user rewards');
console.log('  GET  /make-server-33e19f99/rewards/:userId - Get user rewards');
console.log('  GET  /make-server-33e19f99/tips/:category - Get Zai tips for category');
console.log('  GET  /make-server-33e19f99/zai/starter/:userId - Get conversation starter');
console.log('  POST /make-server-33e19f99/zai/chat - Chat with Zai');
console.log('  GET  /make-server-33e19f99/zai/history/:userId - Get conversation history');
console.log('  GET  /make-server-33e19f99/health - Health check');