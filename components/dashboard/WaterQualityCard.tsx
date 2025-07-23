import React, { useState, useEffect } from 'react';
import { 
  fetchWaterQualityData, 
  getRecentWaterQuality,
  getWaterQualityByLocation,
  formatWaterQualityResult,
  getWaterQualityStatistics,
  getWaterQualityRating,
  WATER_CHARACTERISTICS,
  US_STATE_CODES,
  WaterQualityResult,
  WaterQualityParams
} from '../../services/waterQualityService';
import type { OnboardingData } from '../onboarding/OnboardingFlow';

interface WaterQualityCardProps {
  userData: OnboardingData;
  isDark: boolean;
}

interface FormattedResult {
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
}

export function WaterQualityCard({ userData, isDark }: WaterQualityCardProps) {
  const [results, setResults] = useState<FormattedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('US:06'); // Default to California
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<string>('pH');
  const [dateRange, setDateRange] = useState<number>(30); // Days back
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [siteid, setSiteid] = useState<string>('');
  const [useLocation, setUseLocation] = useState(false);

  // Get user's location for location-based queries
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation && useLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Could not get location:', error);
          setUseLocation(false);
        }
      );
    }
  }, [useLocation]);

  // Auto-load data when component mounts
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let waterResults: WaterQualityResult[] = [];
      
      if (useLocation && userLocation) {
        // Location-based search
        waterResults = await getWaterQualityByLocation(
          userLocation.lat,
          userLocation.lon,
          25, // 25 mile radius
          selectedCharacteristic,
          dateRange
        );
      } else {
        // State-based search
        waterResults = await getRecentWaterQuality(
          selectedState,
          selectedCharacteristic,
          dateRange
        );
      }
      
      // Format results for display
      const formatted = waterResults
        .map(formatWaterQualityResult)
        .filter(r => r.value && r.value !== '')
        .slice(0, 50); // Limit to 50 results for performance
      
      setResults(formatted);
      
    } catch (err) {
      console.error('Water quality search error:', err);
      setError('Failed to fetch water quality data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - dateRange);
      
      const params: WaterQualityParams = {
        characteristicName: selectedCharacteristic,
        startDateLo: startDate.toISOString().split('T')[0],
        startDateHi: endDate.toISOString().split('T')[0],
        sampleMedia: 'Water',
        minresults: '1'
      };
      
      if (useLocation && userLocation) {
        params.lat = userLocation.lat.toString();
        params.long = userLocation.lon.toString();
        params.within = '25';
      } else {
        params.statecode = selectedState;
      }
      
      if (siteid.trim()) {
        params.siteid = siteid.trim();
      }
      
      const waterResults = await fetchWaterQualityData(params);
      const formatted = waterResults
        .map(formatWaterQualityResult)
        .filter(r => r.value && r.value !== '')
        .slice(0, 50);
      
      setResults(formatted);
      
    } catch (err) {
      console.error('Advanced water quality search error:', err);
      setError('Failed to fetch water quality data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatistics = () => {
    if (results.length === 0) return null;
    
    const values = results
      .map(r => parseFloat(r.value))
      .filter(v => !isNaN(v));
    
    if (values.length === 0) return null;
    
    const sorted = values.sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    
    return {
      count: values.length,
      mean: parseFloat(mean.toFixed(3)),
      median: parseFloat(median.toFixed(3)),
      min: sorted[0],
      max: sorted[sorted.length - 1]
    };
  };

  const stats = getStatistics();

  return (
    <div className="zz-task-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="zz-h3">water quality data</h3>
        <div className="flex items-center gap-2">
          <span className="zz-p1 opacity-60">🌊</span>
          <span className="zz-p1 opacity-60 text-xs">
            no api key required
          </span>
        </div>
      </div>

      {/* Search Controls */}
      <div className="space-y-4">
        {/* Location Toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useLocation}
              onChange={(e) => setUseLocation(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="zz-p1">use my location</span>
          </label>
          {useLocation && !userLocation && (
            <span className="zz-p1 opacity-60 text-xs">
              requesting location...
            </span>
          )}
        </div>

        {/* State Selection (if not using location) */}
        {!useLocation && (
          <div className="space-y-2">
            <label className="zz-p1 block">state</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="zz-input w-full"
            >
              {Object.entries(US_STATE_CODES).map(([name, code]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Characteristic Selection */}
        <div className="space-y-2">
          <label className="zz-p1 block">water characteristic</label>
          <select
            value={selectedCharacteristic}
            onChange={(e) => setSelectedCharacteristic(e.target.value)}
            className="zz-input w-full"
          >
            {WATER_CHARACTERISTICS.map((char) => (
              <option key={char} value={char}>
                {char}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="zz-p1 block">date range (days back)</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="zz-input w-full"
          >
            <option value={7}>last 7 days</option>
            <option value={30}>last 30 days</option>
            <option value={90}>last 90 days</option>
            <option value={365}>last year</option>
          </select>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="zz-p1 opacity-60 hover:opacity-100 transition-opacity"
        >
          {showAdvanced ? '→ hide advanced' : '→ advanced options'}
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-2 p-4 border-2 border-gray-300 rounded"
               style={{ borderColor: 'var(--zz-border)' }}>
            <label className="zz-p1 block">specific site id (optional)</label>
            <input
              type="text"
              value={siteid}
              onChange={(e) => setSiteid(e.target.value)}
              placeholder="e.g., USGS-01646500"
              className="zz-input w-full"
            />
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={showAdvanced ? handleAdvancedSearch : handleSearch}
          disabled={loading}
          className="zz-pill selected w-full"
        >
          {loading ? 'searching...' : 'search water quality data'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 border border-red-500 rounded bg-red-50 text-red-700">
          <p className="zz-p1">{error}</p>
        </div>
      )}

      {/* Statistics Summary */}
      {stats && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded"
             style={{ background: 'var(--zz-card)', color: 'var(--zz-card-text)' }}>
          <div>
            <div className="zz-p1 font-medium">{stats.count}</div>
            <div className="text-xs opacity-60">samples</div>
          </div>
          <div>
            <div className="zz-p1 font-medium">{stats.mean}</div>
            <div className="text-xs opacity-60">average</div>
          </div>
          <div>
            <div className="zz-p1 font-medium">{stats.median}</div>
            <div className="text-xs opacity-60">median</div>
          </div>
          <div>
            <div className="zz-p1 font-medium">{stats.min}</div>
            <div className="text-xs opacity-60">minimum</div>
          </div>
          <div>
            <div className="zz-p1 font-medium">{stats.max}</div>
            <div className="text-xs opacity-60">maximum</div>
          </div>
        </div>
      )}

      {/* Results Display */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="zz-p1 opacity-60 zz-water-loading">loading water quality data...</div>
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="text-center py-8">
            <div className="zz-p1 opacity-60">
              no water quality data found for the selected criteria
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <div className="zz-p1 opacity-60">
              showing {results.length} recent water quality measurements
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result, index) => {
                const numericValue = parseFloat(result.value);
                const rating = !isNaN(numericValue) 
                  ? getWaterQualityRating(result.characteristic, numericValue)
                  : null;
                
                return (
                  <div
                    key={index}
                    className="p-4 border rounded hover:border-gray-300 transition-colors"
                    style={{ borderColor: 'var(--zz-border)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="zz-p1 font-medium">
                            {result.value} {result.unit}
                          </span>
                          {rating && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              rating.rating === 'excellent' ? 'zz-water-rating-excellent' :
                              rating.rating === 'good' ? 'zz-water-rating-good' :
                              rating.rating === 'fair' ? 'zz-water-rating-fair' :
                              'zz-water-rating-poor'
                            }`}>
                              {rating.rating}
                            </span>
                          )}
                        </div>
                        <div className="text-sm opacity-60">
                          {result.characteristic}
                        </div>
                        <div className="text-xs opacity-50 mt-1">
                          {result.location} • {result.date}
                        </div>
                        <div className="text-xs opacity-40">
                          {result.state}, {result.county}
                        </div>
                      </div>
                      <div className="text-xs opacity-40 text-right">
                        {result.organization}
                      </div>
                    </div>
                    
                    {result.comment && (
                      <div className="text-xs opacity-60 mt-2 p-2 rounded"
                           style={{ background: 'var(--zz-card)', color: 'var(--zz-card-text)' }}>
                        {result.comment}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* API Information */}
      <div className="text-xs opacity-40 p-3 rounded"
           style={{ background: 'var(--zz-card)', color: 'var(--zz-card-text)' }}>
        <p className="mb-1">
          <strong>data source:</strong> US Water Quality Portal
        </p>
        <p className="mb-1">
          <strong>api endpoint:</strong> waterqualitydata.us
        </p>
        <p>
          <strong>note:</strong> this api does not require an api key and provides free access to water quality data from monitoring stations across the united states
        </p>
      </div>
    </div>
  );
}