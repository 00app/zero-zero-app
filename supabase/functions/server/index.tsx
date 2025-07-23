import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Hono } from "npm:hono@3.11.7";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import * as kv from './kv_store.tsx';

// Initialize Hono app
const app = new Hono();

// Middleware
app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Zero Zero server is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize database tables
app.post('/init', async (c) => {
  try {
    console.log('🔧 Initializing Zero Zero database...');
    
    // Create tables if they don't exist
    const tables = [
      {
        name: 'user_profiles',
        sql: `
          CREATE TABLE IF NOT EXISTS user_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE,
            name TEXT NOT NULL,
            postcode TEXT,
            transport_mode TEXT,
            home_type TEXT,
            rooms INTEGER,
            people INTEGER,
            energy_source TEXT,
            spend_amount NUMERIC,
            goals JSONB,
            preferences JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'card_interactions',
        sql: `
          CREATE TABLE IF NOT EXISTS card_interactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            card_id TEXT NOT NULL,
            card_category TEXT NOT NULL,
            action_taken TEXT NOT NULL,
            action_data JSONB,
            points_earned INTEGER DEFAULT 0,
            carbon_saved NUMERIC DEFAULT 0,
            money_saved NUMERIC DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_rewards',
        sql: `
          CREATE TABLE IF NOT EXISTS user_rewards (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
            total_points INTEGER DEFAULT 0,
            carbon_saved_kg NUMERIC DEFAULT 0,
            money_saved_pounds NUMERIC DEFAULT 0,
            actions_completed INTEGER DEFAULT 0,
            streak_days INTEGER DEFAULT 0,
            last_activity TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'zai_tips',
        sql: `
          CREATE TABLE IF NOT EXISTS zai_tips (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            card_category TEXT NOT NULL,
            tip_text TEXT NOT NULL,
            context_data JSONB,
            effectiveness_score NUMERIC DEFAULT 5.0,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'chat_messages',
        sql: `
          CREATE TABLE IF NOT EXISTS chat_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            response TEXT,
            context JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      }
    ];

    // Execute table creation
    for (const table of tables) {
      try {
        const { error } = await supabase.rpc('exec', { sql: table.sql });
        if (error) {
          console.error(`Error creating table ${table.name}:`, error);
        } else {
          console.log(`✅ Table ${table.name} ready`);
        }
      } catch (error) {
        console.error(`Failed to create table ${table.name}:`, error);
        // Try using KV store as fallback
        await kv.set(`table_${table.name}_schema`, table.sql);
      }
    }

    // Insert sample Zai tips
    const sampleTips = [
      {
        card_category: 'travel',
        tip_text: 'taking the bus instead of driving 2x per week saves 54kg co₂ annually and £280 in fuel costs',
        effectiveness_score: 8.5
      },
      {
        card_category: 'food',
        tip_text: 'plant-based meals 3x per week reduce your carbon footprint by 40% and save £15 weekly on groceries',
        effectiveness_score: 9.2
      },
      {
        card_category: 'energy',
        tip_text: 'switching to led bulbs throughout your home saves 2,400 kwh yearly - thats £600 off your energy bill',
        effectiveness_score: 8.8
      },
      {
        card_category: 'water',
        tip_text: 'a 4-minute shower instead of 10 minutes saves 15,000l water yearly and £180 on bills',
        effectiveness_score: 8.1
      },
      {
        card_category: 'waste',
        tip_text: 'composting food scraps reduces household waste by 30% and creates free fertilizer for plants',
        effectiveness_score: 7.9
      }
    ];

    // Insert tips using KV store as backup
    for (const tip of sampleTips) {
      try {
        const { error } = await supabase
          .from('zai_tips')
          .insert([tip]);
        
        if (error) {
          // Fallback to KV store
          await kv.set(`tip_${tip.card_category}_${Date.now()}`, tip);
        }
      } catch (error) {
        console.log(`Using KV backup for tip: ${tip.card_category}`);
        await kv.set(`tip_${tip.card_category}_${Date.now()}`, tip);
      }
    }

    console.log('✅ Zero Zero database initialization complete');
    return c.json({ 
      success: true, 
      message: 'Database initialized successfully',
      tables: tables.map(t => t.name)
    });

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// User profile endpoints
app.post('/users', async (c) => {
  try {
    const userData = await c.req.json();
    console.log('Creating user profile:', userData);

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        email: userData.email || `${userData.name}@temp.com`,
        name: userData.name,
        postcode: userData.postcode,
        transport_mode: userData.transportMode,
        home_type: userData.homeType,
        rooms: userData.rooms,
        people: userData.people,
        energy_source: userData.energySource,
        spend_amount: userData.spendAmount,
        goals: userData.goals,
        preferences: userData.preferences
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Fallback to KV store
      const mockProfile = {
        id: `user_${Date.now()}`,
        ...userData,
        created_at: new Date().toISOString()
      };
      await kv.set(`user_${mockProfile.id}`, mockProfile);
      return c.json(mockProfile);
    }

    // Initialize user rewards
    const { error: rewardError } = await supabase
      .from('user_rewards')
      .insert([{
        user_id: profile.id,
        total_points: 0,
        carbon_saved_kg: 0,
        money_saved_pounds: 0,
        actions_completed: 0,
        streak_days: 0
      }]);

    if (rewardError) {
      console.log('Reward initialization error (non-critical):', rewardError);
      // Initialize in KV store as backup
      await kv.set(`rewards_${profile.id}`, {
        user_id: profile.id,
        total_points: 0,
        carbon_saved_kg: 0,
        money_saved_pounds: 0,
        actions_completed: 0,
        streak_days: 0
      });
    }

    return c.json(profile);

  } catch (error) {
    console.error('User creation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Card interaction logging
app.post('/interactions', async (c) => {
  try {
    const interaction = await c.req.json();
    console.log('Logging card interaction:', interaction);

    // Calculate points and savings based on action
    const calculations = {
      'accept': { points: 10, carbon: 0.5, money: 1.0 },
      'reject': { points: 0, carbon: 0, money: 0 },
      'input_submitted': { points: 15, carbon: 1.0, money: 2.0 },
      'expanded': { points: 2, carbon: 0, money: 0 },
      'link_clicked': { points: 5, carbon: 0, money: 0 }
    };

    const calc = calculations[interaction.action_taken as keyof typeof calculations] || calculations.accept;

    // Store interaction
    const { data: interactionData, error: interactionError } = await supabase
      .from('card_interactions')
      .insert([{
        ...interaction,
        points_earned: calc.points,
        carbon_saved: calc.carbon,
        money_saved: calc.money
      }])
      .select()
      .single();

    if (interactionError) {
      console.log('Using KV fallback for interaction');
      const mockInteraction = {
        id: `interaction_${Date.now()}`,
        ...interaction,
        points_earned: calc.points,
        carbon_saved: calc.carbon,
        money_saved: calc.money,
        created_at: new Date().toISOString()
      };
      await kv.set(`interaction_${mockInteraction.id}`, mockInteraction);
      return c.json(mockInteraction);
    }

    // Update user rewards
    if (calc.points > 0 || calc.carbon > 0 || calc.money > 0) {
      const { data: currentRewards } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', interaction.user_id)
        .single();

      const updates = {
        total_points: (currentRewards?.total_points || 0) + calc.points,
        carbon_saved_kg: (currentRewards?.carbon_saved_kg || 0) + calc.carbon,
        money_saved_pounds: (currentRewards?.money_saved_pounds || 0) + calc.money,
        actions_completed: (currentRewards?.actions_completed || 0) + 1,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('user_rewards')
        .update(updates)
        .eq('user_id', interaction.user_id);

      if (updateError) {
        console.log('Updating rewards in KV store');
        await kv.set(`rewards_${interaction.user_id}`, updates);
      }
    }

    return c.json(interactionData);

  } catch (error) {
    console.error('Interaction logging error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user rewards
app.get('/rewards/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Try KV store
      const kvRewards = await kv.get(`rewards_${userId}`);
      if (kvRewards) {
        return c.json(kvRewards);
      }
      
      // Return default rewards
      const defaultRewards = {
        id: `rewards_${userId}`,
        user_id: userId,
        total_points: 0,
        carbon_saved_kg: 0,
        money_saved_pounds: 0,
        actions_completed: 0,
        streak_days: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return c.json(defaultRewards);
    }

    return c.json(data);

  } catch (error) {
    console.error('Rewards fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update user rewards
app.put('/rewards/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const updates = await c.req.json();

    const { data, error } = await supabase
      .from('user_rewards')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      // Update in KV store
      const currentRewards = await kv.get(`rewards_${userId}`) || {};
      const updatedRewards = {
        ...currentRewards,
        ...updates,
        updated_at: new Date().toISOString()
      };
      await kv.set(`rewards_${userId}`, updatedRewards);
      return c.json(updatedRewards);
    }

    return c.json(data);

  } catch (error) {
    console.error('Rewards update error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get Zai tips for category
app.get('/tips/:category', async (c) => {
  try {
    const category = c.req.param('category');
    const limit = parseInt(c.req.query('limit') || '5');

    const { data, error } = await supabase
      .from('zai_tips')
      .select('*')
      .eq('card_category', category)
      .order('effectiveness_score', { ascending: false })
      .limit(limit);

    if (error || !data?.length) {
      // Fallback tips from KV store
      const kvTips = await kv.getByPrefix(`tip_${category}_`);
      if (kvTips.length > 0) {
        return c.json(kvTips.slice(0, limit));
      }

      // Default fallback tips
      const fallbackTips = {
        travel: [{ 
          id: 'fallback_travel', 
          card_category: 'travel', 
          tip_text: 'public transport saves money and reduces emissions', 
          effectiveness_score: 8.0 
        }],
        food: [{ 
          id: 'fallback_food', 
          card_category: 'food', 
          tip_text: 'plant-based meals are better for you and the planet', 
          effectiveness_score: 8.5 
        }],
        energy: [{ 
          id: 'fallback_energy', 
          card_category: 'energy', 
          tip_text: 'switching off devices saves energy and money', 
          effectiveness_score: 7.5 
        }]
      };

      return c.json(fallbackTips[category as keyof typeof fallbackTips] || []);
    }

    return c.json(data);

  } catch (error) {
    console.error('Tips fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Chat message storage
app.post('/chat', async (c) => {
  try {
    const { user_id, message, response, context } = await c.req.json();

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        user_id,
        message,
        response,
        context
      }])
      .select()
      .single();

    if (error) {
      // Store in KV as fallback
      const chatData = {
        id: `chat_${Date.now()}`,
        user_id,
        message,
        response,
        context,
        created_at: new Date().toISOString()
      };
      await kv.set(`chat_${chatData.id}`, chatData);
      return c.json(chatData);
    }

    return c.json(data);

  } catch (error) {
    console.error('Chat storage error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Analytics endpoint
app.get('/analytics', async (c) => {
  try {
    // Get overall stats
    const { data: userCount } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact' });

    const { data: interactionCount } = await supabase
      .from('card_interactions')
      .select('id', { count: 'exact' });

    const { data: totalRewards } = await supabase
      .from('user_rewards')
      .select('total_points, carbon_saved_kg, money_saved_pounds');

    const analytics = {
      total_users: userCount?.length || 0,
      total_interactions: interactionCount?.length || 0,
      total_points: totalRewards?.reduce((sum, r) => sum + (r.total_points || 0), 0) || 0,
      total_carbon_saved: totalRewards?.reduce((sum, r) => sum + (r.carbon_saved_kg || 0), 0) || 0,
      total_money_saved: totalRewards?.reduce((sum, r) => sum + (r.money_saved_pounds || 0), 0) || 0,
      generated_at: new Date().toISOString()
    };

    return c.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    return c.json({ 
      total_users: 0,
      total_interactions: 0,
      total_points: 0,
      total_carbon_saved: 0,
      total_money_saved: 0,
      error: error.message 
    });
  }
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ 
    error: 'Internal server error', 
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ 
    error: 'Endpoint not found',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

console.log('🚀 Zero Zero server starting...');
serve(app.fetch);