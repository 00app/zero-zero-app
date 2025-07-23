import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlitchText } from '../effects/GlitchText';
import { useGlitchAnimation } from '../hooks/useGlitchAnimation';
import googleMapsService, { type PlacesSuggestion } from '../../services/googleMapsService';

interface LocationStepProps {
  onComplete: (location: string) => void;
  initialValue?: string;
}

export function LocationStep({ onComplete, initialValue }: LocationStepProps) {
  const [location, setLocation] = useState(initialValue || '');
  const [questionText, setQuestionText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [suggestions, setSuggestions] = useState<PlacesSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isGlitching = useGlitchAnimation(1500);

  const fullQuestion = "where are you based?";
  const typingSpeed = 60;

  useEffect(() => {
    let currentChar = 0;
    const typeInterval = setInterval(() => {
      if (currentChar <= fullQuestion.length) {
        setQuestionText(fullQuestion.slice(0, currentChar));
        currentChar++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setShowInput(true), 300);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    if (location.trim() && showInput) {
      setShowContinue(true);
    } else {
      setShowContinue(false);
    }
  }, [location, showInput]);

  // Debounced location search with Google Maps
  useEffect(() => {
    if (!location.trim() || location.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    const searchTimer = setTimeout(async () => {
      try {
        const predictions = await googleMapsService.getPlacePredictions(location, {
          componentRestrictions: { country: 'gb' },
          types: ['(cities)']
        });
        
        setSuggestions(predictions);
        setShowSuggestions(predictions.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.log('Location search error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [location]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onComplete(location.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && selectedIndex >= 0 && suggestions[selectedIndex]) {
        selectSuggestion(suggestions[selectedIndex]);
      } else if (location.trim()) {
        onComplete(location.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const selectSuggestion = async (suggestion: PlacesSuggestion) => {
    try {
      // Get detailed place information
      const placeDetails = await googleMapsService.getPlaceDetails(suggestion.placeId);
      const formattedAddress = placeDetails 
        ? googleMapsService.formatUKAddress(placeDetails)
        : suggestion.description;
      
      setLocation(formattedAddress);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setSuggestions([]);
      
      // Auto-advance after selection
      setTimeout(() => {
        onComplete(formattedAddress);
      }, 500);
    } catch (error) {
      console.log('Error selecting place:', error);
      setLocation(suggestion.description);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    if (!showSuggestions && e.target.value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Question */}
      <div className="text-left">
        <div 
          className="zz-large mb-8"
          style={{ 
            fontWeight: 'var(--font-regular)',
            lineHeight: 1.2,
            minHeight: '29px',
            textAlign: 'left'
          }}
        >
          {questionText}
          {questionText.length < fullQuestion.length && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1 h-6 ml-1"
              style={{ background: 'var(--zz-text)' }}
            />
          )}
        </div>
      </div>

      {/* Input Field with Google Maps Autocomplete */}
      {showInput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={location}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                placeholder="city, country"
                className="w-full py-6 pr-6 pl-0 text-left bg-transparent"
                style={{
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  color: 'var(--zz-text)',
                  fontSize: 'var(--text-large)',
                  fontWeight: 'var(--font-regular)',
                  fontFamily: 'Roboto, sans-serif',
                  lineHeight: 1.2
                }}
                autoFocus
                autoComplete="off"
              />
              
              {/* Google Maps API Status Indicator */}
              {showInput && (
                <div 
                  className="absolute right-0 top-6 text-xs opacity-40"
                  style={{ 
                    fontSize: '10px',
                    lineHeight: 1.2
                  }}
                  title={googleMapsService.getConnectionStatus().message}
                >
                  {googleMapsService.getConnectionStatus().isReady ? '📍' : '📝'}
                </div>
              )}
              
              {/* Loading indicator */}
              {isLoadingSuggestions && (
                <div 
                  className="absolute right-0 top-8 text-xs opacity-60"
                  style={{ 
                    fontSize: '10px',
                    lineHeight: 1.2
                  }}
                >
                  searching...
                </div>
              )}
              
              {/* Google Places Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-full mt-2 z-10"
                    style={{
                      background: 'var(--zz-card)',
                      border: '1px solid var(--zz-border)',
                      borderRadius: '0',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion.placeId}
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-3 transition-all duration-200"
                        style={{
                          background: selectedIndex === index ? 'var(--zz-accent)' : 'transparent',
                          color: selectedIndex === index ? 'var(--zz-bg)' : 'var(--zz-text)',
                          fontSize: 'var(--text-medium)',
                          fontWeight: 'var(--font-regular)',
                          fontFamily: 'Roboto, sans-serif',
                          lineHeight: 1.4,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        whileHover={{
                          background: 'var(--zz-accent)',
                          color: 'var(--zz-bg)'
                        }}
                      >
                        <div style={{ fontWeight: 'var(--font-medium)' }}>
                          {suggestion.mainText}
                        </div>
                        {suggestion.secondaryText && (
                          <div 
                            style={{ 
                              fontSize: 'var(--text-small)',
                              opacity: 0.7,
                              marginTop: '2px'
                            }}
                          >
                            {suggestion.secondaryText}
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Typed Answer Display */}
            {location && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-left"
              >
                <div 
                  className="zz-medium opacity-70"
                  style={{ lineHeight: 1.4 }}
                >
                  {location}
                </div>
              </motion.div>
            )}

            {/* Continue Button */}
            {showContinue && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex justify-end"
              >
                <button
                  type="submit"
                  className="zz-circle-button"
                  style={{
                    width: '56px',
                    height: '56px',
                    fontSize: '20px',
                    border: 'none',
                    background: 'var(--zz-accent)',
                    color: 'var(--zz-bg)',
                    fontFamily: 'Roboto, sans-serif'
                  }}
                  aria-label="Continue to next step"
                >
                  <GlitchText isGlitching={isGlitching}>
                    →
                  </GlitchText>
                </button>
              </motion.div>
            )}
          </form>
        </motion.div>
      )}
    </div>
  );
}