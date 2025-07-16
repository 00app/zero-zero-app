import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Configure CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Add logger
app.use('*', logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Health check endpoint
app.get('/make-server-eebb7b0c/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Save user preferences
app.post('/make-server-eebb7b0c/user-preferences', async (c) => {
  try {
    const { userData, preferences } = await c.req.json();
    
    if (!userData || !userData.name) {
      return c.json({ error: 'Invalid user data' }, 400);
    }

    // Create a unique key for this user
    const userKey = `user_preferences_${userData.name.toLowerCase().replace(/\s+/g, '_')}_${userData.postcode}`;
    
    // Save to KV store
    await kv.set(userKey, {
      userData,
      preferences,
      timestamp: new Date().toISOString()
    });

    return c.json({ success: true, message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return c.json({ error: 'Failed to save preferences' }, 500);
  }
});

// Get user preferences
app.get('/make-server-eebb7b0c/user-preferences/:userKey', async (c) => {
  try {
    const userKey = c.req.param('userKey');
    
    if (!userKey) {
      return c.json({ error: 'User key is required' }, 400);
    }

    const data = await kv.get(`user_preferences_${userKey}`);
    
    if (!data) {
      return c.json({ error: 'User preferences not found' }, 404);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return c.json({ error: 'Failed to get preferences' }, 500);
  }
});

// Export user data
app.post('/make-server-eebb7b0c/export-data', async (c) => {
  try {
    const { userData } = await c.req.json();
    
    if (!userData || !userData.name) {
      return c.json({ error: 'Invalid user data' }, 400);
    }

    // Create a unique key for this user
    const userKey = `user_preferences_${userData.name.toLowerCase().replace(/\s+/g, '_')}_${userData.postcode}`;
    
    // Get all data for this user
    const preferences = await kv.get(userKey);
    
    const exportData = {
      userData,
      preferences: preferences?.preferences || {},
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    return c.json({ success: true, data: exportData });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return c.json({ error: 'Failed to export data' }, 500);
  }
});

// Delete user data
app.delete('/make-server-eebb7b0c/user-data', async (c) => {
  try {
    const { userData } = await c.req.json();
    
    if (!userData || !userData.name) {
      return c.json({ error: 'Invalid user data' }, 400);
    }

    // Create a unique key for this user
    const userKey = `user_preferences_${userData.name.toLowerCase().replace(/\s+/g, '_')}_${userData.postcode}`;
    
    // Delete from KV store
    await kv.del(userKey);

    return c.json({ success: true, message: 'User data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return c.json({ error: 'Failed to delete data' }, 500);
  }
});

// Chat endpoint for Zai AI
app.post('/make-server-eebb7b0c/chat', async (c) => {
  try {
    const { message, userData, context } = await c.req.json();
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Simple AI response logic (can be enhanced with actual AI service)
    const responses = {
      greeting: [
        "Hello! I'm Zai, your sustainability assistant. How can I help you today?",
        "Hi there! Ready to make some positive changes for the planet?",
        "Welcome! I'm here to help you on your sustainability journey."
      ],
      carbon: [
        "Great question about carbon footprint! Based on your data, I can see some areas where you could reduce emissions.",
        "Let's look at your carbon impact. Your biggest opportunities are in energy and transport.",
        "Carbon reduction is key to fighting climate change. Here are some personalized tips for you."
      ],
      money: [
        "Saving money and the planet often go hand in hand! Here are some cost-effective sustainability tips.",
        "Let's find ways to reduce your environmental impact while keeping more money in your pocket.",
        "Sustainable choices can actually save you money in the long run. Here's how."
      ],
      default: [
        "That's a great question! Based on your profile, here are some suggestions.",
        "I'd love to help you with that. Let me think about your specific situation.",
        "Thanks for asking! Here's what I recommend based on your data."
      ]
    };

    // Simple keyword matching
    let responseType = 'default';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      responseType = 'greeting';
    } else if (lowerMessage.includes('carbon') || lowerMessage.includes('footprint') || lowerMessage.includes('emissions')) {
      responseType = 'carbon';
    } else if (lowerMessage.includes('money') || lowerMessage.includes('save') || lowerMessage.includes('cost')) {
      responseType = 'money';
    }

    const responseArray = responses[responseType as keyof typeof responses];
    const response = responseArray[Math.floor(Math.random() * responseArray.length)];

    return c.json({ success: true, response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return c.json({ error: 'Failed to process chat message' }, 500);
  }
});

// Start the server
Deno.serve(app.fetch);