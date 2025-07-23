import { validateConfig } from './config';
import { supabase, userService, tipsService, locationService } from './supabase';
import { CarbonFootprint } from './carbonCalculations';

// Validate configuration on startup
validateConfig();

export interface LocationData {
  postcode: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  regionCode: string;
  sustainability: {
    score: number;
    factors: string[];
  };
}

export interface AirQualityData {
  aqi: number;
  level: string;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
  };
  recommendations: string[];
}

export interface PersonalizedTip {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: number;
  action: string;
  potentialSaving: {
    carbon: number;
    money: number;
  };
  timeframe: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LocalBusiness {
  id: string;
  name: string;
  category: string;
  distance: string;
  sustainability: string;
  savings: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contact: {
    phone?: string;
    website?: string;
    address: string;
  };
}

export interface PartnerOffer {
  id: string;
  partner: string;
  category: string;
  offer: string;
  savings: string;
  validUntil: string;
  code?: string;
  url: string;
}

export interface ZaiResponse {
  message: string;
  tips: PersonalizedTip[];
  actions: string[];
  priority: number;
}

// Import OnboardingData type
interface OnboardingData {
  name: string;
  postcode: string;
  homeType: 'apartment' | 'house' | 'shared';
  energySource: 'gas' | 'electric' | 'renewable' | 'mixed';
  transport: 'car' | 'public' | 'walk' | 'cycle' | 'mixed';
  carType?: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  rooms: number;
  people: number;
  monthlySpend: number;
  goals: string[];
}

class ApiService {
  private baseUrl = 'https://api.zerozero.app'; // Mock API base

  // Configuration helpers
  private hasGoogleMaps() {
    return import.meta.env?.VITE_GOOGLE_MAPS_API_KEY ? true : false;
  }

  private hasOpenAI() {
    return import.meta.env?.VITE_OPENAI_API_KEY ? true : false;
  }

  private hasTwilio() {
    return import.meta.env?.VITE_TWILIO_ACCOUNT_SID ? true : false;
  }

  private getGoogleMapsKey() {
    return import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '';
  }

  private getOpenAIKey() {
    return import.meta.env?.VITE_OPENAI_API_KEY || '';
  }

  // Real Google Maps integration with fallback
  async getLocationFromPostcode(postcode: string): Promise<LocationData> {
    try {
      // First check if we have this location cached in Supabase
      const cachedLocation = await locationService.getByPostcode(postcode);
      if (cachedLocation) {
        return {
          postcode: cachedLocation.postcode,
          city: cachedLocation.city,
          country: cachedLocation.country,
          coordinates: cachedLocation.coordinates,
          regionCode: cachedLocation.postcode.substring(0, 2),
          sustainability: {
            score: cachedLocation.sustainability_score,
            factors: ['Green spaces', 'Public transport', 'Recycling facilities']
          }
        };
      }

      // Try Google Maps Geocoding API if available
      if (this.hasGoogleMaps()) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${postcode}&key=${this.getGoogleMapsKey()}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const result = data.results[0];
          const location = result.geometry.location;
          
          // Extract city and country from address components
          const addressComponents = result.address_components;
          const city = addressComponents.find((component: any) => 
            component.types.includes('locality') || component.types.includes('postal_town')
          )?.long_name || 'Unknown';
          
          const country = addressComponents.find((component: any) => 
            component.types.includes('country')
          )?.long_name || 'Unknown';

          const locationData: LocationData = {
            postcode: postcode.toUpperCase(),
            city,
            country,
            coordinates: {
              lat: location.lat,
              lng: location.lng
            },
            regionCode: postcode.substring(0, 2),
            sustainability: {
              score: Math.random() * 100, // Mock sustainability score
              factors: ['Green spaces', 'Public transport', 'Recycling facilities']
            }
          };

          // Cache in Supabase if available
          try {
            await locationService.create({
              name: `${city}, ${country}`,
              postcode: postcode.toUpperCase(),
              city,
              country,
              coordinates: locationData.coordinates,
              sustainability_score: locationData.sustainability.score,
              air_quality_index: 50 // Mock AQI
            });
          } catch (error) {
            console.warn('Could not cache location:', error);
          }

          return locationData;
        }
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }

    // Fallback to mock data based on postcode patterns
    const mockLocationData = this.getMockLocationData(postcode);
    
    // Try to cache the mock data
    try {
      await locationService.create({
        name: `${mockLocationData.city}, ${mockLocationData.country}`,
        postcode: postcode.toUpperCase(),
        city: mockLocationData.city,
        country: mockLocationData.country,
        coordinates: mockLocationData.coordinates,
        sustainability_score: mockLocationData.sustainability.score,
        air_quality_index: 50
      });
    } catch (error) {
      console.warn('Could not cache mock location:', error);
    }

    return mockLocationData;
  }

  // Mock location data generator
  private getMockLocationData(postcode: string): LocationData {
    const upperPostcode = postcode.toUpperCase();
    
    // UK postcode patterns
    if (upperPostcode.match(/^(SW|SE|E|W|N|NW|EC|WC)/)) {
      return {
        postcode: upperPostcode,
        city: 'London',
        country: 'United Kingdom',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        regionCode: upperPostcode.substring(0, 2),
        sustainability: {
          score: 75,
          factors: ['Excellent public transport', 'Green spaces', 'Cycling infrastructure']
        }
      };
    }
    
    if (upperPostcode.startsWith('M')) {
      return {
        postcode: upperPostcode,
        city: 'Manchester',
        country: 'United Kingdom',
        coordinates: { lat: 53.4808, lng: -2.2426 },
        regionCode: 'M',
        sustainability: {
          score: 68,
          factors: ['Good public transport', 'Recycling programs', 'Green initiatives']
        }
      };
    }
    
    // US postcode patterns
    if (upperPostcode.match(/^9[0-9]{4}$/)) {
      return {
        postcode: upperPostcode,
        city: 'Los Angeles',
        country: 'United States',
        coordinates: { lat: 34.0522, lng: -118.2437 },
        regionCode: upperPostcode.substring(0, 2),
        sustainability: {
          score: 60,
          factors: ['EV charging stations', 'Solar programs', 'Water conservation']
        }
      };
    }
    
    // Default fallback
    return {
      postcode: upperPostcode,
      city: 'Unknown City',
      country: 'Unknown Country',
      coordinates: { lat: 51.5074, lng: -0.1278 }, // Default to London
      regionCode: upperPostcode.substring(0, 2) || 'XX',
      sustainability: {
        score: 65,
        factors: ['Basic infrastructure', 'Waste management', 'Local initiatives']
      }
    };
  }

  // Real OpenAI integration with fallback
  async generatePersonalizedTips(
    userData: OnboardingData,
    carbonFootprint: CarbonFootprint,
    location: LocationData
  ): Promise<PersonalizedTip[]> {
    if (!this.hasOpenAI()) {
      console.warn('OpenAI not configured, using mock tips');
      return this.getMockTips(userData, carbonFootprint);
    }

    try {
      const prompt = `
        Generate personalized sustainability tips for a user with the following profile:
        
        User Profile:
        - Name: ${userData.name}
        - Location: ${location.city}, ${location.country}
        - Home: ${userData.homeType} with ${userData.rooms} rooms, ${userData.people} people
        - Energy: ${userData.energySource}
        - Transport: ${userData.transport}${userData.carType ? ` (${userData.carType})` : ''}
        - Monthly spending: £${userData.monthlySpend}
        - Goals: ${userData.goals.join(', ')}
        
        Carbon Footprint:
        - Total: ${carbonFootprint.total.toFixed(1)} tonnes CO2/year
        - Home: ${carbonFootprint.breakdown.home.toFixed(1)} tonnes
        - Transport: ${carbonFootprint.breakdown.transport.toFixed(1)} tonnes
        - Spending: ${carbonFootprint.breakdown.spending.toFixed(1)} tonnes
        
        Generate 6 personalized tips that are:
        1. Specific to their situation
        2. Actionable and realistic
        3. Include estimated carbon and money savings
        4. Prioritized by impact
        
        Return as JSON array with this structure:
        {
          "tips": [
            {
              "title": "Tip title",
              "content": "Detailed explanation and how-to",
              "category": "carbon|money|health|local",
              "priority": 1-10,
              "action": "Specific action to take",
              "potentialSaving": {
                "carbon": 0.5,
                "money": 120
              },
              "timeframe": "immediate|1-3 months|3-6 months",
              "difficulty": "easy|medium|hard"
            }
          ]
        }
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getOpenAIKey()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are Zai, a sustainability AI assistant. Provide practical, personalized advice for reducing carbon footprint and saving money.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices?.[0]?.message?.content) {
        try {
          const result = JSON.parse(data.choices[0].message.content);
          return result.tips.map((tip: any, index: number) => ({
            ...tip,
            id: `openai-tip-${Date.now()}-${index}`
          }));
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          throw parseError;
        }
      }
    } catch (error) {
      console.error('Error generating personalized tips with OpenAI:', error);
    }

    // Fallback to mock tips
    return this.getMockTips(userData, carbonFootprint);
  }

  // Mock air quality data
  async getAirQuality(coordinates: { lat: number; lng: number }): Promise<AirQualityData> {
    const mockAqi = Math.floor(Math.random() * 150) + 1;
    
    return {
      aqi: mockAqi,
      level: mockAqi <= 50 ? 'Good' : mockAqi <= 100 ? 'Moderate' : 'Unhealthy',
      pollutants: {
        pm25: Math.random() * 50,
        pm10: Math.random() * 100,
        o3: Math.random() * 200,
        no2: Math.random() * 100
      },
      recommendations: [
        'Consider walking or cycling for short trips',
        'Use public transport when possible',
        'Avoid outdoor exercise during peak hours'
      ]
    };
  }

  // Google Maps Places API for local businesses with fallback
  async getLocalBusinesses(
    coordinates: { lat: number; lng: number },
    query: string
  ): Promise<LocalBusiness[]> {
    if (!this.hasGoogleMaps()) {
      console.warn('Google Maps not configured, using mock businesses');
      return this.getMockBusinesses(coordinates);
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=5000&keyword=sustainable+organic+${query}&key=${this.getGoogleMapsKey()}`
      );
      
      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results) {
        return data.results.slice(0, 6).map((place: any, index: number) => ({
          id: place.place_id,
          name: place.name,
          category: place.types[0] || 'business',
          distance: `${(Math.random() * 2 + 0.5).toFixed(1)}km`,
          sustainability: 'Eco-friendly practices',
          savings: `${Math.floor(Math.random() * 20 + 5)}% off`,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          contact: {
            address: place.vicinity,
            phone: place.formatted_phone_number
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching local businesses:', error);
    }

    // Fallback to mock data
    return this.getMockBusinesses(coordinates);
  }

  // Mock businesses generator
  private getMockBusinesses(coordinates: { lat: number; lng: number }): LocalBusiness[] {
    return [
      {
        id: 'local-1',
        name: 'Green Grocer',
        category: 'grocery',
        distance: '0.8km',
        sustainability: 'Organic & local produce',
        savings: '15% off with app',
        coordinates: coordinates,
        contact: {
          address: '123 Green Street',
          phone: '+44 20 1234 5678'
        }
      },
      {
        id: 'local-2',
        name: 'Cycle Hub',
        category: 'transport',
        distance: '1.2km',
        sustainability: 'Bike repairs & rentals',
        savings: '10% off repairs',
        coordinates: coordinates,
        contact: {
          address: '456 Cycle Lane',
          website: 'https://cyclehub.co.uk'
        }
      },
      {
        id: 'local-3',
        name: 'Eco Café',
        category: 'food',
        distance: '0.5km',
        sustainability: 'Zero waste, local sourcing',
        savings: '20% off drinks',
        coordinates: coordinates,
        contact: {
          address: '789 Sustainable Street',
          phone: '+44 20 9876 5432'
        }
      }
    ];
  }

  // Partner offers
  async getPartnerOffers(userData: OnboardingData): Promise<PartnerOffer[]> {
    return [
      {
        id: 'partner-1',
        partner: 'Octopus Energy',
        category: 'energy',
        offer: '100% renewable energy',
        savings: '£50 credit + cheaper rates',
        validUntil: '2024-12-31',
        code: 'ZEROZERO50',
        url: 'https://octopus.energy'
      },
      {
        id: 'partner-2',
        partner: 'Lime',
        category: 'transport',
        offer: 'Free unlock codes',
        savings: '10 free rides worth £15',
        validUntil: '2024-12-31',
        code: 'LIMEZERO',
        url: 'https://lime.bike'
      },
      {
        id: 'partner-3',
        partner: 'Too Good To Go',
        category: 'food',
        offer: 'Surplus food boxes',
        savings: 'Up to 70% off retail',
        validUntil: '2024-12-31',
        url: 'https://toogoodtogo.co.uk'
      }
    ];
  }

  // Zai chat with OpenAI and fallback
  async chatWithZai(
    message: string,
    userData: OnboardingData,
    context: any
  ): Promise<ZaiResponse> {
    if (!this.hasOpenAI()) {
      // Fallback response
      return {
        message: `Hi ${userData.name}! I'd love to chat, but my AI features need to be configured. For now, I can help you explore your sustainability insights through the dashboard!`,
        tips: [],
        actions: ['Explore carbon insights', 'Check savings opportunities', 'Find local options'],
        priority: 5
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getOpenAIKey()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are Zai, a friendly sustainability AI assistant for Zero Zero app. Help users reduce their carbon footprint and save money. Keep responses conversational and actionable. User context: ${userData.name} from ${userData.postcode}, goals: ${userData.goals.join(', ')}.`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices?.[0]?.message?.content) {
        return {
          message: data.choices[0].message.content,
          tips: [],
          actions: ['Explore recommendations', 'Calculate savings', 'Find local options'],
          priority: 5
        };
      }
    } catch (error) {
      console.error('Error chatting with Zai:', error);
    }

    // Fallback response
    return {
      message: "I'm here to help you reduce your carbon footprint and save money! What would you like to know?",
      tips: [],
      actions: ['Explore recommendations', 'Calculate savings', 'Find local options'],
      priority: 5
    };
  }

  // SMS notifications (mock implementation)
  async sendSMSNotification(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.hasTwilio()) {
      console.warn('Twilio not configured, SMS sending disabled');
      return false;
    }

    try {
      // Note: Twilio API calls should be made from a backend service
      console.log('SMS notification (mock):', { phoneNumber, message });
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Enhanced mock tips with better personalization
  private getMockTips(userData: OnboardingData, carbonFootprint: CarbonFootprint): PersonalizedTip[] {
    const tips: PersonalizedTip[] = [];

    // Energy tips based on home type and energy source
    if (userData.energySource === 'gas') {
      tips.push({
        id: 'energy-1',
        title: 'Reduce heating by 1°C',
        content: `Your ${userData.homeType} uses gas heating. Lowering your thermostat by just 1 degree can reduce your heating bill by 10% and save significant CO₂.`,
        category: 'energy',
        priority: 8,
        action: 'Adjust your thermostat settings',
        potentialSaving: {
          carbon: 0.5,
          money: 120
        },
        timeframe: 'immediate',
        difficulty: 'easy'
      });
    }

    // Transport tips
    if (userData.transport === 'car' && userData.carType !== 'electric') {
      tips.push({
        id: 'transport-1',
        title: 'Try car-free days',
        content: `With your ${userData.carType} car, trying 2 car-free days per week using public transport or cycling could significantly reduce both costs and emissions.`,
        category: 'transport',
        priority: 7,
        action: 'Plan 2 car-free days per week',
        potentialSaving: {
          carbon: 1.2,
          money: 200
        },
        timeframe: '1-3 months',
        difficulty: 'medium'
      });
    }

    // Universal tips
    tips.push({
      id: 'energy-2',
      title: 'Switch to LED bulbs',
      content: `For your ${userData.rooms}-room ${userData.homeType}, replacing all bulbs with LEDs can reduce lighting costs by 80%.`,
      category: 'energy',
      priority: 6,
      action: 'Replace incandescent bulbs with LEDs',
      potentialSaving: {
        carbon: 0.2,
        money: 50
      },
      timeframe: 'immediate',
      difficulty: 'easy'
    });

    return tips.slice(0, 6);
  }
}

export const apiService = new ApiService();