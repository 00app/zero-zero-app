// Water Quality Service with robust error handling
export interface WaterQualityData {
  id: string;
  date: string;
  site: string;
  characteristic: string;
  value: number;
  unit: string;
  location: string;
  source: string;
  rating?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface WaterQualityResult {
  ActivityIdentifier: string;
  ActivityStartDate: string;
  ActivityStartTime: string;
  MonitoringLocationName: string;
  MonitoringLocationIdentifier: string;
  MonitoringLocationLatitude: number;
  MonitoringLocationLongitude: number;
  CharacteristicName: string;
  ResultMeasureValue: string;
  ResultMeasure: {
    MeasureValue: string;
    MeasureUnitCode: string;
  };
  OrganizationFormalName: string;
  StateCode: string;
  CountyCode: string;
  ResultDetectionConditionText: string;
  ResultAnalyticalMethod: string;
  ResultCommentText: string;
}

export interface WaterQualityParams {
  region?: string;
  characteristic?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  characteristicName?: string;
  startDateLo?: string;
  startDateHi?: string;
  statecode?: string;
  sampleMedia?: string;
  minresults?: string;
  lat?: string;
  long?: string;
  within?: string;
  siteid?: string;
}

export interface WaterQualityRating {
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  color: string;
}

export interface WaterQualityStatistics {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  standardDeviation: number;
}

// Water characteristics available in the API
export const WATER_CHARACTERISTICS = [
  'pH',
  'Temperature, water',
  'Dissolved oxygen (DO)',
  'Turbidity',
  'Conductivity',
  'Nitrate',
  'Phosphorus',
  'Ammonia',
  'Chloride',
  'Sulfate',
  'Total dissolved solids',
  'Hardness, Ca, Mg',
  'Alkalinity',
  'Calcium',
  'Magnesium',
  'Sodium',
  'Potassium',
  'Iron',
  'Manganese',
  'Copper',
  'Zinc',
  'Lead',
  'Chromium',
  'Cadmium',
  'Mercury',
  'Arsenic',
  'Selenium',
  'Fluoride',
  'Coliform',
  'E. coli',
  'Enterococci'
];

// US State codes for the API
export const US_STATE_CODES: { [key: string]: string } = {
  'Alabama': 'US:01',
  'Alaska': 'US:02',
  'Arizona': 'US:04',
  'Arkansas': 'US:05',
  'California': 'US:06',
  'Colorado': 'US:08',
  'Connecticut': 'US:09',
  'Delaware': 'US:10',
  'Florida': 'US:12',
  'Georgia': 'US:13',
  'Hawaii': 'US:15',
  'Idaho': 'US:16',
  'Illinois': 'US:17',
  'Indiana': 'US:18',
  'Iowa': 'US:19',
  'Kansas': 'US:20',
  'Kentucky': 'US:21',
  'Louisiana': 'US:22',
  'Maine': 'US:23',
  'Maryland': 'US:24',
  'Massachusetts': 'US:25',
  'Michigan': 'US:26',
  'Minnesota': 'US:27',
  'Mississippi': 'US:28',
  'Missouri': 'US:29',
  'Montana': 'US:30',
  'Nebraska': 'US:31',
  'Nevada': 'US:32',
  'New Hampshire': 'US:33',
  'New Jersey': 'US:34',
  'New Mexico': 'US:35',
  'New York': 'US:36',
  'North Carolina': 'US:37',
  'North Dakota': 'US:38',
  'Ohio': 'US:39',
  'Oklahoma': 'US:40',
  'Oregon': 'US:41',
  'Pennsylvania': 'US:42',
  'Rhode Island': 'US:44',
  'South Carolina': 'US:45',
  'South Dakota': 'US:46',
  'Tennessee': 'US:47',
  'Texas': 'US:48',
  'Utah': 'US:49',
  'Vermont': 'US:50',
  'Virginia': 'US:51',
  'Washington': 'US:53',
  'West Virginia': 'US:54',
  'Wisconsin': 'US:55',
  'Wyoming': 'US:56',
  'District of Columbia': 'US:11',
  'Puerto Rico': 'US:72',
  'Virgin Islands': 'US:78'
};

// Mock data for fallback scenarios
const mockWaterQualityData: WaterQualityData[] = [
  {
    id: 'mock-1',
    date: '2024-01-15',
    site: 'Thames River - London Bridge',
    characteristic: 'pH',
    value: 7.2,
    unit: 'pH units',
    location: 'London, UK',
    source: 'Environment Agency',
    rating: 'good'
  },
  {
    id: 'mock-2',
    date: '2024-01-15',
    site: 'Thames River - London Bridge',
    characteristic: 'Dissolved Oxygen',
    value: 8.5,
    unit: 'mg/L',
    location: 'London, UK',
    source: 'Environment Agency',
    rating: 'excellent'
  },
  {
    id: 'mock-3',
    date: '2024-01-14',
    site: 'River Tagus - Lisbon',
    characteristic: 'Temperature',
    value: 15.2,
    unit: '°C',
    location: 'Lisbon, Portugal',
    source: 'Portuguese Environment Agency',
    rating: 'good'
  },
  {
    id: 'mock-4',
    date: '2024-01-14',
    site: 'Volta River - Accra',
    characteristic: 'Turbidity',
    value: 12.3,
    unit: 'NTU',
    location: 'Accra, Ghana',
    source: 'Ghana EPA',
    rating: 'fair'
  },
  {
    id: 'mock-5',
    date: '2024-01-13',
    site: 'River Colne - Watford',
    characteristic: 'Nitrate',
    value: 2.8,
    unit: 'mg/L',
    location: 'Watford, UK',
    source: 'Environment Agency',
    rating: 'good'
  }
];

// Convert mock data to API format
const mockApiData: WaterQualityResult[] = mockWaterQualityData.map((item, index) => ({
  ActivityIdentifier: item.id,
  ActivityStartDate: item.date,
  ActivityStartTime: '12:00:00',
  MonitoringLocationName: item.site,
  MonitoringLocationIdentifier: `MOCK-${index + 1}`,
  MonitoringLocationLatitude: 0,
  MonitoringLocationLongitude: 0,
  CharacteristicName: item.characteristic,
  ResultMeasureValue: item.value.toString(),
  ResultMeasure: {
    MeasureValue: item.value.toString(),
    MeasureUnitCode: item.unit
  },
  OrganizationFormalName: item.source,
  StateCode: 'XX',
  CountyCode: '000',
  ResultDetectionConditionText: 'Present Above Quantification Limit',
  ResultAnalyticalMethod: 'Standard Method',
  ResultCommentText: 'Mock data for demonstration'
}));

// Get base API URL with fallback
function getApiUrl(): string {
  const baseUrl = import.meta.env?.VITE_WATER_API_URL || 
                  'https://www.waterqualitydata.us/data/Result/search';
  
  return baseUrl;
}

// Check if API is available
async function checkApiAvailability(): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl() + '?mimeType=json&zip=no&samplecount=1', {
      method: 'HEAD',
      mode: 'cors'
    });
    return response.ok;
  } catch (error) {
    console.warn('Water Quality API not available:', error);
    return false;
  }
}

// Build query parameters
function buildQueryParams(params: WaterQualityParams): string {
  const queryParams = new URLSearchParams();
  
  // Default parameters
  queryParams.append('mimeType', 'json');
  queryParams.append('zip', 'no');
  queryParams.append('samplecount', String(params.limit || 50));
  
  // Add custom parameters
  if (params.region) {
    queryParams.append('statecode', params.region);
  }
  
  if (params.characteristic) {
    queryParams.append('characteristicName', params.characteristic);
  }
  
  if (params.startDate) {
    queryParams.append('startDateLo', params.startDate);
  }
  
  if (params.endDate) {
    queryParams.append('startDateHi', params.endDate);
  }

  // New parameters for advanced search
  if (params.characteristicName) {
    queryParams.append('characteristicName', params.characteristicName);
  }
  
  if (params.startDateLo) {
    queryParams.append('startDateLo', params.startDateLo);
  }
  
  if (params.startDateHi) {
    queryParams.append('startDateHi', params.startDateHi);
  }
  
  if (params.statecode) {
    queryParams.append('statecode', params.statecode);
  }
  
  if (params.sampleMedia) {
    queryParams.append('sampleMedia', params.sampleMedia);
  }
  
  if (params.minresults) {
    queryParams.append('minresults', params.minresults);
  }
  
  if (params.lat) {
    queryParams.append('lat', params.lat);
  }
  
  if (params.long) {
    queryParams.append('long', params.long);
  }
  
  if (params.within) {
    queryParams.append('within', params.within);
  }
  
  if (params.siteid) {
    queryParams.append('siteid', params.siteid);
  }
  
  return queryParams.toString();
}

// Transform API response to our data format
function transformApiData(apiData: any[]): WaterQualityData[] {
  return apiData.map((item, index) => ({
    id: item.ActivityIdentifier || `api-${index}`,
    date: item.ActivityStartDate || new Date().toISOString().split('T')[0],
    site: item.MonitoringLocationName || 'Unknown Site',
    characteristic: item.CharacteristicName || 'Unknown',
    value: parseFloat(item.ResultMeasureValue) || 0,
    unit: item.ResultMeasure?.MeasureUnitCode || 'units',
    location: `${item.MonitoringLocationName || 'Unknown'}, ${item.StateCode || 'Unknown'}`,
    source: item.OrganizationFormalName || 'Water Quality Portal',
    rating: getRatingForCharacteristic(item.CharacteristicName, parseFloat(item.ResultMeasureValue))
  }));
}

// Get rating based on characteristic and value
function getRatingForCharacteristic(characteristic: string, value: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (!characteristic || isNaN(value)) return 'fair';
  
  const char = characteristic.toLowerCase();
  
  if (char.includes('ph')) {
    if (value >= 6.5 && value <= 8.5) return 'excellent';
    if (value >= 6.0 && value <= 9.0) return 'good';
    if (value >= 5.5 && value <= 9.5) return 'fair';
    return 'poor';
  }
  
  if (char.includes('dissolved oxygen')) {
    if (value >= 8.0) return 'excellent';
    if (value >= 6.0) return 'good';
    if (value >= 4.0) return 'fair';
    return 'poor';
  }
  
  if (char.includes('temperature')) {
    if (value >= 10 && value <= 20) return 'excellent';
    if (value >= 5 && value <= 25) return 'good';
    if (value >= 0 && value <= 30) return 'fair';
    return 'poor';
  }
  
  if (char.includes('turbidity')) {
    if (value <= 5) return 'excellent';
    if (value <= 15) return 'good';
    if (value <= 30) return 'fair';
    return 'poor';
  }
  
  if (char.includes('nitrate')) {
    if (value <= 1) return 'excellent';
    if (value <= 5) return 'good';
    if (value <= 10) return 'fair';
    return 'poor';
  }
  
  // Default rating
  return 'good';
}

// Filter mock data based on location/region
function filterMockData(params: WaterQualityParams): WaterQualityData[] {
  let filtered = [...mockWaterQualityData];
  
  if (params.region) {
    const regionMap: { [key: string]: string[] } = {
      'UK': ['London', 'Watford'],
      'PT': ['Lisbon'],
      'GH': ['Accra'],
      'london': ['London'],
      'lisbon': ['Lisbon'],
      'accra': ['Accra'],
      'watford': ['Watford']
    };
    
    const locations = regionMap[params.region.toLowerCase()] || [];
    if (locations.length > 0) {
      filtered = filtered.filter(item => 
        locations.some(loc => item.location.includes(loc))
      );
    }
  }
  
  if (params.characteristic) {
    filtered = filtered.filter(item => 
      item.characteristic.toLowerCase().includes(params.characteristic!.toLowerCase())
    );
  }
  
  return filtered.slice(0, params.limit || 50);
}

// Main function to fetch water quality data
export async function fetchWaterQualityData(params: WaterQualityParams = {}): Promise<WaterQualityResult[]> {
  try {
    // Check if API is available
    const isApiAvailable = await checkApiAvailability();
    
    if (!isApiAvailable) {
      console.info('Using mock water quality data (API not available)');
      return mockApiData.slice(0, params.limit || 50);
    }
    
    // Build API request
    const queryString = buildQueryParams(params);
    const url = `${getApiUrl()}?${queryString}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.info('No water quality data from API, using mock data');
      return mockApiData.slice(0, params.limit || 50);
    }
    
    return data;
    
  } catch (error) {
    console.warn('Error fetching water quality data, using mock data:', error);
    return mockApiData.slice(0, params.limit || 50);
  }
}

// Get recent water quality data for a specific state and characteristic
export async function getRecentWaterQuality(
  stateCode: string, 
  characteristic: string, 
  daysBack: number = 30
): Promise<WaterQualityResult[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - daysBack);
  
  const params: WaterQualityParams = {
    statecode: stateCode,
    characteristicName: characteristic,
    startDateLo: startDate.toISOString().split('T')[0],
    startDateHi: endDate.toISOString().split('T')[0],
    sampleMedia: 'Water',
    minresults: '1',
    limit: 100
  };
  
  return await fetchWaterQualityData(params);
}

// Get water quality data by location (lat/lon with radius)
export async function getWaterQualityByLocation(
  latitude: number,
  longitude: number,
  radiusMiles: number = 25,
  characteristic: string,
  daysBack: number = 30
): Promise<WaterQualityResult[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - daysBack);
  
  const params: WaterQualityParams = {
    lat: latitude.toString(),
    long: longitude.toString(),
    within: radiusMiles.toString(),
    characteristicName: characteristic,
    startDateLo: startDate.toISOString().split('T')[0],
    startDateHi: endDate.toISOString().split('T')[0],
    sampleMedia: 'Water',
    minresults: '1',
    limit: 100
  };
  
  return await fetchWaterQualityData(params);
}

// Format a water quality result for display
export function formatWaterQualityResult(result: WaterQualityResult): {
  date: string;
  time: string;
  location: string;
  characteristic: string;
  value: string;
  unit: string;
  organization: string;
  state: string;
  county: string;
  coordinates: [number, number] | undefined;
  detectionCondition: string;
  method: string;
  comment: string;
} {
  return {
    date: result.ActivityStartDate || '',
    time: result.ActivityStartTime || '',
    location: result.MonitoringLocationName || 'Unknown Location',
    characteristic: result.CharacteristicName || 'Unknown',
    value: result.ResultMeasureValue || result.ResultMeasure?.MeasureValue || '',
    unit: result.ResultMeasure?.MeasureUnitCode || '',
    organization: result.OrganizationFormalName || 'Unknown Organization',
    state: result.StateCode || '',
    county: result.CountyCode || '',
    coordinates: result.MonitoringLocationLatitude && result.MonitoringLocationLongitude
      ? [result.MonitoringLocationLatitude, result.MonitoringLocationLongitude]
      : undefined,
    detectionCondition: result.ResultDetectionConditionText || '',
    method: result.ResultAnalyticalMethod || '',
    comment: result.ResultCommentText || ''
  };
}

// Get water quality statistics for a dataset
export function getWaterQualityStatistics(results: WaterQualityResult[]): WaterQualityStatistics | null {
  const values = results
    .map(r => parseFloat(r.ResultMeasureValue || r.ResultMeasure?.MeasureValue || '0'))
    .filter(v => !isNaN(v) && v > 0);
  
  if (values.length === 0) return null;
  
  const sorted = values.sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  
  // Calculate standard deviation
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    count: values.length,
    mean: parseFloat(mean.toFixed(3)),
    median: parseFloat(median.toFixed(3)),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    standardDeviation: parseFloat(standardDeviation.toFixed(3))
  };
}

// Get water quality rating for a specific characteristic and value
export function getWaterQualityRating(characteristic: string, value: number): WaterQualityRating {
  const rating = getRatingForCharacteristic(characteristic, value);
  
  const ratingData = {
    excellent: { description: 'Excellent water quality', color: '#059669' },
    good: { description: 'Good water quality', color: '#2563eb' },
    fair: { description: 'Fair water quality', color: '#d97706' },
    poor: { description: 'Poor water quality', color: '#dc2626' }
  };
  
  return {
    rating,
    description: ratingData[rating].description,
    color: ratingData[rating].color
  };
}

// Get available regions
export function getAvailableRegions(): { value: string; label: string; }[] {
  return [
    { value: 'UK', label: 'United Kingdom' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'london', label: 'London Area' },
    { value: 'lisbon', label: 'Lisbon Area' },
    { value: 'accra', label: 'Accra Area' },
    { value: 'watford', label: 'Watford Area' }
  ];
}

// Get available characteristics
export function getAvailableCharacteristics(): { value: string; label: string; }[] {
  return [
    { value: 'pH', label: 'pH Level' },
    { value: 'Dissolved oxygen', label: 'Dissolved Oxygen' },
    { value: 'Temperature', label: 'Temperature' },
    { value: 'Turbidity', label: 'Turbidity' },
    { value: 'Nitrate', label: 'Nitrate' },
    { value: 'Phosphorus', label: 'Phosphorus' },
    { value: 'Ammonia', label: 'Ammonia' },
    { value: 'Conductivity', label: 'Conductivity' }
  ];
}

// Get rating color for UI
export function getRatingColor(rating: string): string {
  switch (rating) {
    case 'excellent': return 'zz-water-rating-excellent';
    case 'good': return 'zz-water-rating-good';
    case 'fair': return 'zz-water-rating-fair';
    case 'poor': return 'zz-water-rating-poor';
    default: return 'zz-water-rating-good';
  }
}

// Get rating description
export function getRatingDescription(rating: string): string {
  switch (rating) {
    case 'excellent': return 'Excellent water quality';
    case 'good': return 'Good water quality';
    case 'fair': return 'Fair water quality';
    case 'poor': return 'Poor water quality';
    default: return 'Water quality data';
  }
}