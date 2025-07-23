// Legacy OpenAI Service - Maintained for backward compatibility
// New code should use /services/aiService.ts instead

import aiService from './aiService';

console.warn('⚠️ Using legacy openaiService - consider migrating to aiService.ts');

// Re-export everything from the new service for backward compatibility
export * from './aiService';
export { aiService as openaiService };
export default aiService;