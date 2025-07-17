import { projectId, publicAnonKey } from './info';
import { isSupabaseConfigured } from './client';

export interface OnboardingData {
  name: string;
  postcode: string;
  homeType: 'apartment' | 'house' | 'shared';
  energySource: 'grid' | 'renewable' | 'mixed';
  transport: 'car' | 'public' | 'bike' | 'walk' | 'mixed';
  carType?: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  rooms: number;
  people: number;
  monthlySpend: number;
  goals: string[];
}

export interface OnboardingRecord {
  onboardingData: OnboardingData;
  timestamp: string;
  type: 'onboarding';
}

/**
 * Save onboarding data to Supabase
 */
export const saveOnboardingData = async (data: OnboardingData): Promise<string | null> => {
  try {
    // Check if Supabase is configured before trying to save
    if (!isSupabaseConfigured()) {
      console.log('ℹ️ Supabase not configured - skipping data save (demo mode)');
      return null;
    }
    
    const sessionId = `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eebb7b0c/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        sessionId,
        data,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Onboarding data saved successfully:', result);
    
    return sessionId;
  } catch (error) {
    console.warn('⚠️ Failed to save onboarding data:', error);
    return null;
  }
};

/**
 * Get onboarding data from Supabase
 */
export const getOnboardingData = async (sessionId: string): Promise<OnboardingRecord | null> => {
  try {
    // Check if Supabase is configured before trying to fetch
    if (!isSupabaseConfigured()) {
      console.log('ℹ️ Supabase not configured - cannot retrieve data (demo mode)');
      return null;
    }
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eebb7b0c/onboarding/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.warn('⚠️ Failed to retrieve onboarding data:', error);
    return null;
  }
};

/**
 * Calculate carbon footprint based on onboarding data
 */
export const calculateCarbonFootprint = (data: OnboardingData): number => {
  let totalCO2 = 0;

  // Home energy (kg CO2 per year)
  const homeMultiplier = data.homeType === 'house' ? 1.2 : data.homeType === 'apartment' ? 0.8 : 1.0;
  const energyMultiplier = data.energySource === 'renewable' ? 0.1 : data.energySource === 'mixed' ? 0.6 : 1.0;
  const homeCO2 = (data.rooms * 500 * homeMultiplier * energyMultiplier) / data.people;
  totalCO2 += homeCO2;

  // Transport (kg CO2 per year)
  switch (data.transport) {
    case 'car':
      const carMultiplier = data.carType === 'electric' ? 0.1 : 
                           data.carType === 'hybrid' ? 0.6 : 
                           data.carType === 'diesel' ? 1.2 : 1.0;
      totalCO2 += 2000 * carMultiplier;
      break;
    case 'public':
      totalCO2 += 800;
      break;
    case 'bike':
      totalCO2 += 50;
      break;
    case 'walk':
      totalCO2 += 20;
      break;
    case 'mixed':
      totalCO2 += 1200;
      break;
  }

  // Consumption (rough estimate based on spending)
  const consumptionCO2 = (data.monthlySpend * 12) * 0.5; // £1 ≈ 0.5kg CO2
  totalCO2 += consumptionCO2;

  return Math.round(totalCO2);
};

/**
 * Get carbon savings potential based on goals
 */
export const calculateSavingsPotential = (data: OnboardingData): { carbon: number; money: number } => {
  const currentFootprint = calculateCarbonFootprint(data);
  let carbonSavings = 0;
  let moneySavings = 0;

  data.goals.forEach(goal => {
    switch (goal) {
      case 'use less energy':
        carbonSavings += currentFootprint * 0.15;
        moneySavings += data.monthlySpend * 0.1 * 12;
        break;
      case 'walk more':
      case 'cycle more':
        carbonSavings += 500;
        moneySavings += 600;
        break;
      case 'use public transport':
        carbonSavings += 800;
        moneySavings += 1200;
        break;
      case 'reduce waste':
        carbonSavings += currentFootprint * 0.1;
        moneySavings += data.monthlySpend * 0.05 * 12;
        break;
      case 'buy local':
        carbonSavings += currentFootprint * 0.08;
        break;
      case 'repair instead of buy':
        carbonSavings += currentFootprint * 0.12;
        moneySavings += data.monthlySpend * 0.15 * 12;
        break;
    }
  });

  return {
    carbon: Math.round(carbonSavings),
    money: Math.round(moneySavings)
  };
};