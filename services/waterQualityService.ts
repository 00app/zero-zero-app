// US Water Quality Portal API Service
// API Documentation: https://www.waterqualitydata.us/webservices_documentation/

const WATER_API_BASE_URL = import.meta.env?.VITE_WATER_API_URL || 'https://www.waterqualitydata.us/data/Result/search';

export interface WaterQualityParams {
  statecode?: string; // e.g., "US:06" for California
  characteristicName?: string; // e.g., "pH", "Temperature", "Dissolved oxygen"
  startDateLo?: string; // YYYY-MM-DD
  startDateHi?: string; // YYYY-MM-DD
  siteid?: string; // Specific monitoring site
  sampleMedia?: string; // e.g., "Water"
  siteType?: string; // e.g., "Stream", "Lake"
  providers?: string; // e.g., "NWIS", "STORET"
  organization?: string; // Organization identifier
  huc?: string; // Hydrologic Unit Code
  countycode?: string; // County code
  bBox?: string; // Bounding box coordinates
  lat?: string; // Latitude
  long?: string; // Longitude
  within?: string; // Distance in miles
  minresults?: string; // Minimum number of results
  mimeType?: string; // Always 'json' for our purposes
}

export interface WaterQualityResult {
  OrganizationIdentifier: string;
  OrganizationFormalName: string;
  ActivityIdentifier: string;
  ActivityTypeCode: string;
  ActivityMediaName: string;
  ActivityStartDate: string;
  ActivityStartTime: string;
  ActivityEndDate: string;
  ActivityEndTime: string;
  ActivityDepthHeightMeasure: string;
  ActivityDepthAltitudeReferencePointText: string;
  ActivityTopDepthHeightMeasure: string;
  ActivityBottomDepthHeightMeasure: string;
  ProjectIdentifier: string;
  ActivityConductingOrganizationText: string;
  MonitoringLocationIdentifier: string;
  ActivityCommentText: string;
  SampleAquifer: string;
  HydrologicCondition: string;
  HydrologicEvent: string;
  SampleCollectionMethod: string;
  SampleCollectionEquipmentName: string;
  ResultDetectionConditionText: string;
  CharacteristicName: string;
  ResultSampleFractionText: string;
  ResultMeasureValue: string;
  ResultMeasure: {
    MeasureValue: string;
    MeasureUnitCode: string;
  };
  MeasureQualifierCode: string;
  ResultStatusIdentifier: string;
  StatisticalBaseCode: string;
  ResultValueTypeName: string;
  ResultWeightBasisText: string;
  ResultTimeBasisText: string;
  ResultTemperatureBasisText: string;
  ResultParticleSizeBasisText: string;
  PrecisionValue: string;
  ResultCommentText: string;
  USGSPCode: string;
  ResultDepthHeightMeasure: string;
  ResultDepthAltitudeReferencePointText: string;
  SubjectTaxonomicName: string;
  SampleTissueAnatomyName: string;
  ResultAnalyticalMethod: {
    MethodIdentifier: string;
    MethodIdentifierContext: string;
    MethodName: string;
    MethodQualifierTypeName: string;
    MethodDescriptionText: string;
  };
  ResultLaboratoryCommentText: string;
  ResultDetectionQuantitationLimitTypeName: string;
  ResultDetectionQuantitationLimitMeasure: {
    MeasureValue: string;
    MeasureUnitCode: string;
  };
  ResultSamplingPointName: string;
  ResultSamplingPointType: string;
  ResultSamplingPointPlaceInSeries: string;
  ResultSamplingPointCommentText: string;
  MonitoringLocationName: string;
  MonitoringLocationTypeName: string;
  MonitoringLocationDescriptionText: string;
  HUCEightDigitCode: string;
  DrainageAreaMeasure: {
    MeasureValue: string;
    MeasureUnitCode: string;
  };
  ContributingDrainageAreaMeasure: {
    MeasureValue: string;
    MeasureUnitCode: string;
  };
  MonitoringLocationGeometry: {
    coordinates: [number, number];
    type: string;
  };
  StateCode: string;
  StateName: string;
  CountyCode: string;
  CountyName: string;
  MonitoringLocationUrl: string;
  ActivityLocation: {
    coordinates: [number, number];
    type: string;
  };
  ActivityLocationDescriptionText: string;
  MonitoringLocationIdentifiersConcatenated: string;
  ActivityGroupIdentifier: string;
  ActivityGroupName: string;
  ActivityGroupType: string;
  ActivityLocationLatitudeMeasure: string;
  ActivityLocationLongitudeMeasure: string;
  ActivityLocationHorizontalAccuracyMeasure: string;
  ActivityLocationHorizontalCollectionMethodName: string;
  ActivityLocationHorizontalCoordinateReferenceSystemDatumName: string;
  AssemblageSampledName: string;
  BiologicalIntentName: string;
  BiologicalIndividualIdentifier: string;
  SubjectTaxonomicNameUserSupplied: string;
  SubjectTaxonomicNameUserSuppliedReferenceText: string;
  SampleTissueAnatomyName: string;
  GroupSummaryCountWeight: string;
  NetTypeName: string;
  NetSurfaceAreaMeasure: {
    MeasureValue: string;
    MeasureUnitCode: string;
  };
  NetMeshSizeMeasure: {
    MeasureValue: string;
    MeasureUnitCode: string;
  };
  BoatSpeedMeasure: {
    MeasureValue: string;
    MeasureUnitCode: string;
  };
  CurrentSpeedMeasure: {
    MeasureValue: string;
    MeasureUnitCode: string;
  };
  ToxicityTestTypeName: string;
  SampleCollectionEquipmentCommentText: string;
  ResultLaboratoryName: string;
  AnalysisStartDate: string;
  AnalysisStartTime: string;
  AnalysisEndDate: string;
  AnalysisEndTime: string;
  ResultLaboratoryAccreditationIndicator: string;
  ResultLaboratoryAccreditationAuthorityName: string;
  TaxonomistAccreditationIndicator: string;
  TaxonomistAccreditationAuthorityName: string;
}

export interface WaterQualityResponse {
  WQXWeb: {
    Organization: {
      Activity: {
        Result: WaterQualityResult[];
      }[];
    }[];
  };
}

// Common water quality characteristics
export const WATER_CHARACTERISTICS = [
  'pH',
  'Temperature, water',
  'Dissolved oxygen (DO)',
  'Conductivity',
  'Turbidity',
  'Nitrate',
  'Phosphorus',
  'Alkalinity, total',
  'Hardness, Ca, Mg',
  'Chloride',
  'Sulfate',
  'Total dissolved solids',
  'Biochemical oxygen demand (BOD)',
  'Chemical oxygen demand (COD)',
  'Ammonia-nitrogen',
  'Fecal Coliform',
  'E. coli',
  'Total suspended solids',
  'Silica',
  'Iron',
  'Manganese',
  'Copper',
  'Lead',
  'Zinc',
  'Chromium',
  'Cadmium',
  'Mercury',
  'Arsenic'
];

// US State codes for the API
export const US_STATE_CODES = {
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
  'Wyoming': 'US:56'
};

// Build query URL with parameters
export function buildWaterQualityUrl(params: WaterQualityParams): string {
  const url = new URL(WATER_API_BASE_URL);
  
  // Always request JSON format
  url.searchParams.set('mimeType', 'json');
  
  // Add parameters if provided
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
}

// Fetch water quality data
export async function fetchWaterQualityData(params: WaterQualityParams): Promise<WaterQualityResult[]> {
  try {
    const url = buildWaterQualityUrl(params);
    console.log('Fetching water quality data from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: WaterQualityResponse = await response.json();
    
    // Extract results from the nested structure
    const results: WaterQualityResult[] = [];
    
    if (data.WQXWeb && data.WQXWeb.Organization) {
      data.WQXWeb.Organization.forEach(org => {
        if (org.Activity) {
          org.Activity.forEach(activity => {
            if (activity.Result) {
              results.push(...activity.Result);
            }
          });
        }
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('Error fetching water quality data:', error);
    throw error;
  }
}

// Get recent water quality data for a specific state and characteristic
export async function getRecentWaterQuality(
  statecode: string,
  characteristicName: string,
  daysBack: number = 30
): Promise<WaterQualityResult[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - daysBack);
  
  const params: WaterQualityParams = {
    statecode,
    characteristicName,
    startDateLo: startDate.toISOString().split('T')[0],
    startDateHi: endDate.toISOString().split('T')[0],
    sampleMedia: 'Water',
    minresults: '1'
  };
  
  return fetchWaterQualityData(params);
}

// Get water quality for a specific location (bounding box)
export async function getWaterQualityByLocation(
  lat: number,
  lon: number,
  radiusMiles: number = 25,
  characteristicName?: string,
  daysBack: number = 30
): Promise<WaterQualityResult[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - daysBack);
  
  const params: WaterQualityParams = {
    lat: lat.toString(),
    long: lon.toString(),
    within: radiusMiles.toString(),
    startDateLo: startDate.toISOString().split('T')[0],
    startDateHi: endDate.toISOString().split('T')[0],
    sampleMedia: 'Water',
    minresults: '1'
  };
  
  if (characteristicName) {
    params.characteristicName = characteristicName;
  }
  
  return fetchWaterQualityData(params);
}

// Format a result for display
export function formatWaterQualityResult(result: WaterQualityResult) {
  return {
    date: result.ActivityStartDate,
    time: result.ActivityStartTime,
    location: result.MonitoringLocationName || result.MonitoringLocationIdentifier,
    characteristic: result.CharacteristicName,
    value: result.ResultMeasureValue,
    unit: result.ResultMeasure?.MeasureUnitCode || '',
    organization: result.OrganizationFormalName,
    state: result.StateName,
    county: result.CountyName,
    coordinates: result.MonitoringLocationGeometry?.coordinates,
    detectionCondition: result.ResultDetectionConditionText,
    method: result.ResultAnalyticalMethod?.MethodName,
    comment: result.ResultCommentText
  };
}

// Get summary statistics for a set of results
export function getWaterQualityStatistics(results: WaterQualityResult[], characteristic: string) {
  const values = results
    .filter(r => r.CharacteristicName === characteristic && r.ResultMeasureValue)
    .map(r => parseFloat(r.ResultMeasureValue))
    .filter(v => !isNaN(v));
  
  if (values.length === 0) {
    return null;
  }
  
  const sorted = values.sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  return {
    count: values.length,
    mean: parseFloat(mean.toFixed(3)),
    median: parseFloat(median.toFixed(3)),
    min: parseFloat(min.toFixed(3)),
    max: parseFloat(max.toFixed(3)),
    range: parseFloat((max - min).toFixed(3))
  };
}

// Check if a characteristic value is within safe/acceptable ranges
export function getWaterQualityRating(characteristic: string, value: number): {
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  description: string;
} {
  const ratings = {
    'pH': {
      excellent: { min: 6.5, max: 8.5, desc: 'Optimal pH range for most aquatic life' },
      good: { min: 6.0, max: 9.0, desc: 'Acceptable pH range' },
      fair: { min: 5.5, max: 9.5, desc: 'pH may stress some aquatic life' },
      poor: { min: 0, max: 14, desc: 'pH outside safe range for most aquatic life' }
    },
    'Temperature, water': {
      excellent: { min: 10, max: 20, desc: 'Optimal temperature range (°C)' },
      good: { min: 5, max: 25, desc: 'Acceptable temperature range' },
      fair: { min: 0, max: 30, desc: 'Temperature may stress aquatic life' },
      poor: { min: -10, max: 50, desc: 'Temperature outside safe range' }
    },
    'Dissolved oxygen (DO)': {
      excellent: { min: 8, max: 15, desc: 'Excellent oxygen levels' },
      good: { min: 5, max: 20, desc: 'Good oxygen levels' },
      fair: { min: 3, max: 25, desc: 'Marginal oxygen levels' },
      poor: { min: 0, max: 50, desc: 'Poor oxygen levels' }
    }
  };
  
  const charRating = ratings[characteristic as keyof typeof ratings];
  if (!charRating) {
    return { rating: 'unknown', description: 'No rating criteria available' };
  }
  
  if (value >= charRating.excellent.min && value <= charRating.excellent.max) {
    return { rating: 'excellent', description: charRating.excellent.desc };
  } else if (value >= charRating.good.min && value <= charRating.good.max) {
    return { rating: 'good', description: charRating.good.desc };
  } else if (value >= charRating.fair.min && value <= charRating.fair.max) {
    return { rating: 'fair', description: charRating.fair.desc };
  } else {
    return { rating: 'poor', description: charRating.poor.desc };
  }
}