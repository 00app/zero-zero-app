// UK vs US localization utilities
export function isUSZipCode(postcode: string): boolean {
  // US ZIP code patterns: 12345 or 12345-6789
  const usZipPattern = /^\d{5}(-\d{4})?$/;
  return usZipPattern.test(postcode.trim());
}

export function isUKPostcode(postcode: string): boolean {
  // UK postcode patterns: SW1A 1AA, M1 1AA, B33 8TH, etc.
  const ukPostcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
  return ukPostcodePattern.test(postcode.trim());
}

export function getLocaleFromPostcode(postcode: string): 'UK' | 'US' | 'OTHER' {
  if (isUSZipCode(postcode)) return 'US';
  if (isUKPostcode(postcode)) return 'UK';
  return 'OTHER';
}

// UK English text replacements
export const ukTexts = {
  // Spelling variations
  color: 'colour',
  realize: 'realise',
  organize: 'organise',
  program: 'programme',
  center: 'centre',
  meter: 'metre',
  liter: 'litre',
  fiber: 'fibre',
  
  // Currency
  currency: 'GBP',
  currencySymbol: '£',
  
  // Home types
  apartment: 'flat',
  
  // Energy terms
  electricity: 'electricity',
  gas: 'gas',
  
  // Transport terms
  publicTransport: 'public transport',
  subway: 'underground',
  
  // Common phrases
  zipCode: 'postcode',
  neighborhood: 'neighbourhood',
  favorite: 'favourite',
  optimize: 'optimise',
  
  // Sustainability terms
  carbonFootprint: 'carbon footprint',
  recycling: 'recycling',
  wasteReduction: 'waste reduction',
  energyEfficiency: 'energy efficiency',
  
  // Money terms
  monthlySpending: 'monthly spending',
  savings: 'savings',
  budget: 'budget'
};

// US English text replacements
export const usTexts = {
  // Spelling variations
  colour: 'color',
  realise: 'realize',
  organise: 'organize',
  programme: 'program',
  centre: 'center',
  metre: 'meter',
  litre: 'liter',
  fibre: 'fiber',
  
  // Currency
  currency: 'USD',
  currencySymbol: '$',
  
  // Home types
  flat: 'apartment',
  
  // Energy terms
  electricity: 'electricity',
  gas: 'gas',
  
  // Transport terms
  publicTransport: 'public transportation',
  underground: 'subway',
  
  // Common phrases
  postcode: 'zip code',
  neighbourhood: 'neighborhood',
  favourite: 'favorite',
  optimise: 'optimize',
  
  // Sustainability terms
  carbonFootprint: 'carbon footprint',
  recycling: 'recycling',
  wasteReduction: 'waste reduction',
  energyEfficiency: 'energy efficiency',
  
  // Money terms
  monthlySpending: 'monthly spending',
  savings: 'savings',
  budget: 'budget'
};

export function localizeText(key: keyof typeof ukTexts, locale: 'UK' | 'US' | 'OTHER' = 'UK'): string {
  if (locale === 'US') {
    return usTexts[key as keyof typeof usTexts] || ukTexts[key];
  }
  return ukTexts[key];
}

export function localizeCurrency(amount: number, locale: 'UK' | 'US' | 'OTHER' = 'UK'): string {
  const symbol = locale === 'US' ? '$' : '£';
  return `${symbol}${amount.toLocaleString()}`;
}

// Convert between currencies (simplified for demo - in real app would use exchange rates)
export function convertCurrency(amount: number, fromLocale: 'UK' | 'US', toLocale: 'UK' | 'US'): number {
  if (fromLocale === toLocale) return amount;
  
  // Simplified conversion rates for demo
  const gbpToUsd = 1.27;
  const usdToGbp = 0.79;
  
  if (fromLocale === 'UK' && toLocale === 'US') {
    return Math.round(amount * gbpToUsd);
  }
  
  if (fromLocale === 'US' && toLocale === 'UK') {
    return Math.round(amount * usdToGbp);
  }
  
  return amount;
}