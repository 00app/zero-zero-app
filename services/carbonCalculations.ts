
import { OnboardingData } from '../components/onboarding/OnboardingFlow';

// Essential carbon calculation functions for Zero Zero app

export interface CarbonFootprint {
  total: number;
  breakdown: {
    home: number;
    transport: number;
    spending: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  comparison: {
    national: number;
    reduction: number;
  };
}

// Calculate carbon footprint from user data
export function calculateCarbonFootprint(data: OnboardingData): CarbonFootprint {
  // Home emissions (tonnes CO2/year)
  let homeEmissions = 0;
  
  // Base emissions by home type
  const homeTypeMultiplier = {
    house: 1.2,
    apartment: 0.8,
    shared: 0.6 // shared accommodation
  };
  
  // Energy source multiplier
  const energyMultiplier = {
    grid: 2.1, // standard grid electricity
    renewable: 0.8, // renewable energy
    mixed: 1.4 // mix of grid and renewable
  };
  
  homeEmissions = (data.rooms * 0.8) * homeTypeMultiplier[data.homeType] * energyMultiplier[data.energySource];
  
  // Transport emissions (tonnes CO2/year)
  let transportEmissions = 0;
  
  if (data.transport === 'car' && data.carType) {
    const carEmissions = {
      petrol: 2.3,
      diesel: 2.7,
      hybrid: 1.4,
      electric: 0.6
    };
    transportEmissions = carEmissions[data.carType];
  } else if (data.transport === 'public') {
    transportEmissions = 0.8;
  } else if (data.transport === 'mixed') {
    transportEmissions = 1.2; // mix of transport methods
  } else {
    transportEmissions = 0.2; // bike/walk
  }
  
  // Spending emissions (rough estimate)
  let spendingEmissions = (data.monthlySpend * 12) * 0.0004; // £1 = ~0.4kg CO2
  
  const total = homeEmissions + transportEmissions + spendingEmissions;
  
  // Calculate grade
  const grade = total < 6 ? 'A' : total < 8 ? 'B' : total < 12 ? 'C' : total < 16 ? 'D' : 'E';
  
  return {
    total,
    breakdown: {
      home: homeEmissions,
      transport: transportEmissions,
      spending: spendingEmissions
    },
    grade,
    comparison: {
      national: 12.7, // UK average
      reduction: Math.max(0, 12.7 - total)
    }
  };
}
