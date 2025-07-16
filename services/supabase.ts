
import { getSupabaseClient } from '../utils/supabase/client';
import { finalConfig, hasService } from './config';

// Use the singleton Supabase client to avoid multiple instances
export const supabase = finalConfig.supabase.url && finalConfig.supabase.anonKey
  ? getSupabaseClient()
  : null;

// Types for our database
export interface User {
  id: string;
  name: string;
  email?: string;
  postcode: string;
  home_type: string;
  people: number;
  rooms: number;
  energy_source: string;
  transport: string;
  car_type?: string;
  monthly_spend: number;
  goals: string[];
  created_at: string;
  updated_at: string;
}

export interface Tip {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  priority: number;
  carbon_saving: number;
  money_saving: number;
  action: string;
  is_liked: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  postcode: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  sustainability_score: number;
  air_quality_index: number;
  created_at: string;
}

// Helper function to check if Supabase is available
const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check your environment variables.');
  }
  return supabase;
};

// User operations with fallbacks
export const userService = {
  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase user creation failed, using mock:', error);
      // Return mock user data
      return {
        id: `mock-user-${Date.now()}`,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
    }
  },

  async getById(id: string) {
    try {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase user fetch failed:', error);
      throw new Error('User not found');
    }
  },

  async update(id: string, updates: Partial<User>) {
    try {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase user update failed:', error);
      // Return mock updated user
      return { id, ...updates, updated_at: new Date().toISOString() } as User;
    }
  },
};

// Tips operations with fallbacks
export const tipsService = {
  async getForUser(userId: string) {
    try {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('tips')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase tips fetch failed, using mock:', error);
      // Return mock tips
      return [
        {
          id: 'tip-1',
          user_id: userId,
          title: 'Reduce heating by 1°C',
          content: 'Lower your thermostat by 1 degree to save 10% on heating costs',
          category: 'energy',
          priority: 8,
          carbon_saving: 0.5,
          money_saving: 120,
          action: 'Adjust thermostat',
          is_liked: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'tip-2',
          user_id: userId,
          title: 'Switch to LED bulbs',
          content: 'Replace incandescent bulbs with energy-efficient LEDs',
          category: 'energy',
          priority: 7,
          carbon_saving: 0.2,
          money_saving: 50,
          action: 'Replace bulbs',
          is_liked: false,
          created_at: new Date().toISOString(),
        }
      ] as Tip[];
    }
  },

  async create(tip: Omit<Tip, 'id' | 'created_at'>) {
    try {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('tips')
        .insert([tip])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase tip creation failed:', error);
      return {
        id: `tip-${Date.now()}`,
        ...tip,
        created_at: new Date().toISOString(),
      } as Tip;
    }
  },

  async like(id: string, isLiked: boolean) {
    try {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('tips')
        .update({ is_liked: isLiked })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase tip like failed:', error);
      return { id, is_liked: isLiked } as Partial<Tip>;
    }
  },
};

// Location operations with fallbacks
export const locationService = {
  async getByPostcode(postcode: string) {
    try {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('locations')
        .select('*')
        .eq('postcode', postcode)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.warn('Supabase location fetch failed:', error);
      return null;
    }
  },

  async create(location: Omit<Location, 'id' | 'created_at'>) {
    try {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('locations')
        .insert([location])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase location creation failed:', error);
      return {
        id: `location-${Date.now()}`,
        ...location,
        created_at: new Date().toISOString(),
      } as Location;
    }
  },
};

// Real-time subscriptions with error handling
export const subscribeToTips = (userId: string, callback: (tips: Tip[]) => void) => {
  try {
    const client = ensureSupabase();
    return client
      .channel('tips-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tips',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch tips when changes occur
          tipsService.getForUser(userId).then(callback);
        }
      )
      .subscribe();
  } catch (error) {
    console.warn('Supabase subscription failed:', error);
    // Return a mock subscription
    return {
      unsubscribe: () => {},
    };
  }
};
