import OpenAI from 'openai';
import chalk from 'chalk';
import { GPT5Client } from '../../dist/openai-client.js';

/**
 * Available fallback models for GPT-5 MCP server
 */
export const AVAILABLE_MODELS = [
  { 
    value: 'gpt-4.1', 
    name: 'gpt-4.1 - Latest GPT-4 iteration with enhanced capabilities',
    description: 'Most balanced option with strong performance across all tasks'
  },
  { 
    value: 'o3', 
    name: 'o3 - Advanced reasoning model for complex tasks',
    description: 'Best for complex reasoning, analysis, and problem-solving'
  },
  { 
    value: 'o3-deep-research', 
    name: 'o3-deep-research - Specialized for in-depth analysis',
    description: 'Optimized for research, comprehensive analysis, and detailed investigations'
  },
  { 
    value: 'o4-mini', 
    name: 'o4-mini - Compact, efficient model for quick responses',
    description: 'Fast and cost-effective for simple tasks and quick responses'
  },
  { 
    value: 'o3-mini', 
    name: 'o3-mini - Lightweight reasoning model',
    description: 'Balanced speed and reasoning capabilities at lower cost'
  },
  { 
    value: 'gpt-4o', 
    name: 'gpt-4o - Multimodal GPT-4 with vision capabilities',
    description: 'Supports text and images, good for multimodal tasks'
  }
];

/**
 * Validate OpenAI API key by making a test request
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateApiKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    return { 
      valid: false, 
      error: 'API key must start with "sk-"' 
    };
  }

  try {
    const client = new OpenAI({ apiKey });
    
    // Test with a minimal request to verify the key works
    await client.models.list();
    
    return { valid: true };
  } catch (error) {
    let errorMessage = 'Invalid API key or network error';
    
    if (error.status === 401) {
      errorMessage = 'Invalid API key - please check your key is correct';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded - please try again in a moment';
    } else if (error.status === 403) {
      errorMessage = 'API key does not have required permissions';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Network connection failed - please check your internet connection';
    }
    
    return { 
      valid: false, 
      error: errorMessage 
    };
  }
}

/**
 * Validate that the user has access to a specific model
 * Uses a more reliable approach: check if model exists in available models list
 * @param {string} apiKey - The API key to use  
 * @param {string} modelName - The model name to test
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateModelAccess(apiKey, modelName) {
  try {
    const client = new OpenAI({ apiKey });
    
    // Get list of available models (this works reliably)
    const models = await client.models.list();
    const availableModelIds = models.data.map(m => m.id);
    
    // Check if the requested model is in the available models list
    const isAvailable = availableModelIds.includes(modelName);
    
    if (isAvailable) {
      return { valid: true };
    } else {
      // List similar models to help user
      const similarModels = availableModelIds.filter(id => 
        id.includes(modelName.split('-')[0]) || 
        id.includes(modelName.split('.')[0])
      ).slice(0, 3);
      
      let errorMessage = `Model "${modelName}" not found in your available models`;
      if (similarModels.length > 0) {
        errorMessage += `. Similar available models: ${similarModels.join(', ')}`;
      }
      
      return { 
        valid: false, 
        error: errorMessage 
      };
    }
  } catch (error) {
    let errorMessage = `Cannot check model availability for "${modelName}"`;
    
    if (error.status === 401) {
      errorMessage = 'API key authentication failed - please check your key and billing status';
    } else if (error.status === 403) {
      errorMessage = 'API key does not have permission to list models';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded - please try again in a moment';
    } else if (error.message?.includes('quota') || error.message?.includes('billing')) {
      errorMessage = 'Insufficient credits or billing issue - please check your OpenAI billing dashboard';
    }
    
    return { 
      valid: false, 
      error: errorMessage 
    };
  }
}

/**
 * Validate configuration values
 * @param {Object} config - Configuration object to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateConfigValues(config) {
  const errors = [];
  
  // Validate API key format
  if (!config.apiKey || !config.apiKey.startsWith('sk-')) {
    errors.push('API key must start with "sk-"');
  }
  
  // Validate cost limits (minimum $1.00)
  if (config.dailyCostLimit !== undefined) {
    const dailyLimit = parseFloat(config.dailyCostLimit);
    if (isNaN(dailyLimit) || dailyLimit < 1.00) {
      errors.push('Daily cost limit must be at least $1.00');
    }
  }
  
  if (config.taskCostLimit !== undefined) {
    const taskLimit = parseFloat(config.taskCostLimit);
    if (isNaN(taskLimit) || taskLimit < 1.00) {
      errors.push('Task cost limit must be at least $1.00');
    }
  }
  
  // Validate reasoning effort
  const validReasoningEfforts = ['minimal', 'low', 'medium', 'high'];
  if (config.reasoningEffort && !validReasoningEfforts.includes(config.reasoningEffort)) {
    errors.push('Reasoning effort must be one of: minimal, low, medium, high');
  }
  
  // Validate verbosity
  const validVerbosityLevels = ['low', 'medium', 'high'];
  if (config.verbosity && !validVerbosityLevels.includes(config.verbosity)) {
    errors.push('Verbosity must be one of: low, medium, high');
  }
  
  // Validate fallback model
  const validModels = AVAILABLE_MODELS.map(m => m.value);
  if (config.fallbackModel && !validModels.includes(config.fallbackModel)) {
    errors.push(`Fallback model must be one of: ${validModels.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Test the complete configuration by making actual API calls
 * @param {Object} config - Configuration to test
 * @returns {Promise<{valid: boolean, errors: string[]}>}
 */
export async function validateCompleteConfiguration(config) {
  const errors = [];
  
  // First validate the structure
  const structureValidation = validateConfigValues(config);
  if (!structureValidation.valid) {
    return structureValidation;
  }
  
  console.log(chalk.blue('🔍 Testing API key...'));
  
  // Test API key
  const keyValidation = await validateApiKey(config.apiKey);
  if (!keyValidation.valid) {
    errors.push(`API Key: ${keyValidation.error}`);
    return { valid: false, errors }; // Stop here if API key is invalid
  }
  
  console.log(chalk.green('✅ API key is valid'));
  
  // Test fallback model access
  if (config.fallbackModel) {
    console.log(chalk.blue(`🔍 Testing access to model "${config.fallbackModel}"...`));
    
    const modelValidation = await validateModelAccess(config.apiKey, config.fallbackModel);
    if (!modelValidation.valid) {
      errors.push(`Model Access: ${modelValidation.error}`);
    } else {
      console.log(chalk.green(`✅ Model "${config.fallbackModel}" is accessible`));
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}