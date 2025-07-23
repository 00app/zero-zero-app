// Google Maps Places Autocomplete Service for Zero Zero Location Input
// Provides predictive location finding with UK focus

interface PlacesSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

interface PlacesServiceOptions {
  componentRestrictions?: {
    country: string | string[];
  };
  types?: string[];
}

class GoogleMapsService {
  private apiKey: string;
  private isLoaded: boolean = false;
  private placesService: any = null;
  private autocompleteService: any = null;

  constructor() {
    // Get Google Maps API key from environment
    this.apiKey = this.getEnvVar('VITE_GOOGLE_MAPS_API_KEY') || 
                 this.getEnvVar('GOOGLE_MAPS_API_KEY') || 
                 '';

    if (this.apiKey) {
      console.log('✅ Google Maps API key configured:', this.apiKey.substring(0, 20) + '...');
      this.initializeGoogleMaps();
    } else {
      console.log('📍 Google Maps API key not configured - location autocomplete disabled');
      console.log('   To enable: Add VITE_GOOGLE_MAPS_API_KEY to your environment variables');
    }
  }

  private getEnvVar(key: string): string {
    try {
      // Try import.meta.env first (Vite)
      if (import.meta && import.meta.env) {
        const value = import.meta.env[key];
        if (value && value !== 'undefined') {
          return value;
        }
      }

      // Try process.env fallback
      if (typeof process !== 'undefined' && process.env) {
        const value = process.env[key];
        if (value && value !== 'undefined') {
          return value;
        }
      }

      // Try window environment variables
      if (typeof window !== 'undefined' && (window as any).__env__) {
        const value = (window as any).__env__[key];
        if (value && value !== 'undefined') {
          return value;
        }
      }

      return '';
    } catch (error) {
      console.log(`Could not access environment variable ${key}`);
      return '';
    }
  }

  private async initializeGoogleMaps(): Promise<void> {
    if (this.isLoaded || !this.apiKey) return;

    try {
      // Check if Google Maps is already loaded
      if (typeof window !== 'undefined' && (window as any).google?.maps) {
        this.setupServices();
        return;
      }

      // Load Google Maps JavaScript API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Set up callback for when the script loads
      (window as any).initGoogleMaps = () => {
        this.setupServices();
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('❌ Failed to load Google Maps API:', error);
    }
  }

  private setupServices(): void {
    try {
      if ((window as any).google?.maps?.places) {
        this.autocompleteService = new (window as any).google.maps.places.AutocompleteService();
        this.isLoaded = true;
        console.log('✅ Google Maps Places API loaded successfully');
      }
    } catch (error) {
      console.error('❌ Failed to setup Google Maps services:', error);
    }
  }

  isReady(): boolean {
    return this.isLoaded && this.autocompleteService !== null;
  }

  async getPlacePredictions(
    input: string, 
    options: PlacesServiceOptions = {}
  ): Promise<PlacesSuggestion[]> {
    return new Promise((resolve) => {
      if (!this.isReady() || !input.trim()) {
        resolve([]);
        return;
      }

      // Default options for UK-focused search
      const defaultOptions = {
        componentRestrictions: { country: 'gb' },
        types: ['(cities)'],
        ...options
      };

      try {
        this.autocompleteService.getPlacePredictions(
          {
            input: input.trim(),
            ...defaultOptions
          },
          (predictions: any[], status: string) => {
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
              const suggestions: PlacesSuggestion[] = predictions.map((prediction: any) => ({
                placeId: prediction.place_id,
                description: prediction.description,
                mainText: prediction.structured_formatting?.main_text || prediction.description,
                secondaryText: prediction.structured_formatting?.secondary_text || '',
                types: prediction.types || []
              }));
              
              resolve(suggestions);
            } else {
              console.log('No predictions found or API error:', status);
              resolve([]);
            }
          }
        );
      } catch (error) {
        console.error('Error getting place predictions:', error);
        resolve([]);
      }
    });
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.isReady()) {
        resolve(null);
        return;
      }

      try {
        if (!(window as any).google?.maps?.places?.PlacesService) {
          resolve(null);
          return;
        }

        // Create a dummy map for the PlacesService (required by API)
        const map = new (window as any).google.maps.Map(document.createElement('div'));
        const service = new (window as any).google.maps.places.PlacesService(map);

        service.getDetails(
          {
            placeId: placeId,
            fields: ['name', 'formatted_address', 'geometry', 'address_components']
          },
          (place: any, status: string) => {
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
              resolve(place);
            } else {
              console.log('Place details error:', status);
              resolve(null);
            }
          }
        );
      } catch (error) {
        console.error('Error getting place details:', error);
        resolve(null);
      }
    });
  }

  getConnectionStatus() {
    return {
      isConfigured: !!this.apiKey,
      isReady: this.isReady(),
      message: this.isReady() 
        ? 'Google Maps Places API connected'
        : this.apiKey 
          ? 'Loading Google Maps API...'
          : 'Google Maps API key not configured'
    };
  }

  // Test connection with a simple prediction request
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'No Google Maps API key configured'
      };
    }

    if (!this.isReady()) {
      return {
        success: false,
        message: 'Google Maps API not loaded yet - please wait a moment and try again'
      };
    }

    try {
      // Test with a simple London search
      const testResults = await this.getPlacePredictions('London', {
        componentRestrictions: { country: 'gb' },
        types: ['(cities)']
      });

      if (testResults.length > 0) {
        return {
          success: true,
          message: `Google Maps API working! Found ${testResults.length} results for London`,
          details: testResults.slice(0, 3).map(r => r.description)
        };
      } else {
        return {
          success: false,
          message: 'Google Maps API loaded but no results returned - check API permissions'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Google Maps API error: ${error}`,
        details: error
      };
    }
  }

  // Utility function to format UK addresses
  formatUKAddress(place: any): string {
    if (!place || !place.address_components) return place?.formatted_address || '';

    const components = place.address_components;
    const city = components.find((c: any) => c.types.includes('postal_town') || c.types.includes('locality'))?.long_name;
    const country = components.find((c: any) => c.types.includes('country'))?.long_name;
    
    if (city && country) {
      return `${city}, ${country}`;
    }
    
    return place.formatted_address || '';
  }
}

// Create singleton instance
export const googleMapsService = new GoogleMapsService();
export default googleMapsService;

// Export types
export type { PlacesSuggestion, PlacesServiceOptions };