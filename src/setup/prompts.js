import inquirer from 'inquirer';
import chalk from 'chalk';
import { AVAILABLE_MODELS } from './validators.js';

/**
 * Display welcome message and check if user is ready to proceed
 */
export async function displayWelcome() {
  console.log(chalk.bold.blue('\n🚀 GPT-5 MCP Server Setup Wizard\n'));
  console.log('This wizard will help you configure the GPT-5 MCP server for use with Claude Code CLI and Claude Desktop.\n');
  console.log(chalk.gray('💡 You can exit anytime by pressing Ctrl+C or selecting "No" when prompted\n'));
  
  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Ready to get started?',
      default: true
    }
  ]);
  
  return proceed;
}

/**
 * Check if user has API key ready, provide guidance if not
 */
export async function promptApiKeyReadiness() {
  console.log(chalk.yellow('\n📋 OpenAI API Key Requirements:\n'));
  console.log('• You need an OpenAI API key to use this server');
  console.log('• Your organization must be ' + chalk.bold('verified') + ' to access GPT-5 via API');
  console.log('• Get your API key: ' + chalk.blue('https://platform.openai.com/api-keys'));
  console.log('• Verification guide: ' + chalk.blue('https://help.openai.com/en/articles/10910291-api-organization-verification'));
  
  const { hasApiKey } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasApiKey',
      message: 'Do you have your OpenAI API key ready?',
      default: true
    }
  ]);
  
  if (!hasApiKey) {
    console.log(chalk.red('\\nPlease get your API key and ensure your organization is verified before continuing.'));
    console.log('Run this setup wizard again when you\'re ready!');
    return false;
  }
  
  return true;
}

/**
 * Prompt for OpenAI API key
 */
export async function promptApiKey() {
  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter your OpenAI API key:',
      mask: '*',
      validate: (input) => {
        if (!input) return 'API key is required';
        if (!input.startsWith('sk-')) return 'API key must start with "sk-"';
        if (input.length < 20) return 'API key seems too short';
        return true;
      }
    }
  ]);
  
  return apiKey;
}

/**
 * Prompt for fallback model selection
 */
export async function promptFallbackModel() {
  console.log(chalk.yellow('\n🤖 Fallback Model Selection:\n'));
  console.log('Choose a fallback model to use when GPT-5 is not available:');
  
  const choices = [
    ...AVAILABLE_MODELS,
    new inquirer.Separator(),
    { value: '__exit__', name: '❌ Exit setup' }
  ];
  
  const { fallbackModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'fallbackModel',
      message: 'Select your preferred fallback model:',
      choices,
      pageSize: 12
    }
  ]);
  
  if (fallbackModel === '__exit__') {
    console.log(chalk.yellow('\nSetup cancelled by user.'));
    process.exit(0);
  }
  
  return fallbackModel;
}

/**
 * Prompt for cost limits configuration
 */
export async function promptCostLimits() {
  console.log(chalk.yellow('\n💰 Cost Management Setup:\n'));
  console.log('Configure spending limits to control your OpenAI API usage:');
  console.log(chalk.gray('• All amounts are in US dollars (USD)'));
  console.log(chalk.gray('• Minimum limit is $1.00, no maximum limit'));
  
  const costLimits = await inquirer.prompt([
    {
      type: 'number',
      name: 'dailyCostLimit',
      message: 'Daily cost limit (USD):',
      default: 10.00,
      validate: (input) => {
        const num = parseFloat(input);
        if (isNaN(num)) return 'Please enter a valid number';
        if (num < 1.00) return 'Minimum daily limit is $1.00';
        return true;
      },
      filter: (input) => parseFloat(input).toFixed(2)
    },
    {
      type: 'number',
      name: 'taskCostLimit',
      message: 'Per-task cost limit (USD):',
      default: 5.00,
      validate: (input) => {
        const num = parseFloat(input);
        if (isNaN(num)) return 'Please enter a valid number';
        if (num < 1.00) return 'Minimum task limit is $1.00';
        return true;
      },
      filter: (input) => parseFloat(input).toFixed(2)
    },
    {
      type: 'confirm',
      name: 'exitSetup',
      message: 'Exit setup now?',
      default: false,
      when: false // This creates an exit point but doesn't show by default
    }
  ]);
  
  // Add manual exit check
  console.log(chalk.gray('\n(Press Ctrl+C anytime to exit)'));
  
  return costLimits;
}

/**
 * Prompt for reasoning and verbosity settings
 */
export async function promptReasoningSettings() {
  console.log(chalk.yellow('\n🧠 AI Behavior Settings:\n'));
  
  const reasoningChoices = [
    {
      value: 'minimal',
      name: 'Minimal - Fast responses, basic reasoning',
      short: 'Minimal'
    },
    {
      value: 'low',
      name: 'Low - Quick responses with some analysis',
      short: 'Low'
    },
    {
      value: 'medium',
      name: 'Medium - Balanced speed and reasoning depth',
      short: 'Medium'
    },
    {
      value: 'high',
      name: 'High - Thorough analysis and reasoning (slower, more expensive)',
      short: 'High'
    }
  ];
  
  const verbosityChoices = [
    {
      value: 'low',
      name: 'Low - Concise, direct responses',
      short: 'Low'
    },
    {
      value: 'medium',
      name: 'Medium - Balanced detail level',
      short: 'Medium'
    },
    {
      value: 'high',
      name: 'High - Comprehensive, detailed explanations',
      short: 'High'
    }
  ];
  
  const settings = await inquirer.prompt([
    {
      type: 'list',
      name: 'reasoningEffort',
      message: 'Default reasoning effort:',
      choices: reasoningChoices,
      default: 'high'
    },
    {
      type: 'list',
      name: 'verbosity',
      message: 'Default response verbosity:',
      choices: verbosityChoices,
      default: 'medium'
    }
  ]);
  
  return settings;
}

/**
 * Display configuration summary and ask for confirmation
 */
export async function confirmConfiguration(config) {
  console.log(chalk.yellow('\n📋 Configuration Summary:\n'));
  
  console.log(chalk.cyan('OpenAI Settings:'));
  console.log(`  API Key: ${config.apiKey.substring(0, 7)}...${config.apiKey.substring(config.apiKey.length - 4)}`);
  console.log(`  Fallback Model: ${config.fallbackModel}`);
  
  console.log(chalk.cyan('\nCost Limits:'));
  console.log(`  Daily Limit: $${config.dailyCostLimit}`);
  console.log(`  Task Limit: $${config.taskCostLimit}`);
  
  console.log(chalk.cyan('\nBehavior Settings:'));
  console.log(`  Reasoning Effort: ${config.reasoningEffort}`);
  console.log(`  Verbosity: ${config.verbosity}`);
  
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Does this configuration look correct?',
      default: true
    }
  ]);
  
  return confirmed;
}

/**
 * Handle validation failure with options to retry or modify
 */
export async function handleValidationFailure(errors) {
  console.log(chalk.red('\n❌ Configuration Validation Failed:\n'));
  
  errors.forEach(error => {
    console.log(chalk.red(`  • ${error}`));
  });
  
  const choices = [
    { value: 'api-key', name: 'Re-enter API key' },
    { value: 'model', name: 'Choose different fallback model' },
    { value: 'costs', name: 'Adjust cost limits' },
    { value: 'behavior', name: 'Change reasoning/verbosity settings' },
    { value: 'restart', name: 'Start over completely' },
    { value: 'exit', name: 'Exit setup' }
  ];
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices
    }
  ]);
  
  return action;
}

/**
 * Ask if user wants to see a dry run before making changes
 */
export async function promptDryRun() {
  const { dryRun } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'dryRun',
      message: 'Would you like to see what will be changed before writing files?',
      default: true
    }
  ]);
  
  return dryRun;
}

/**
 * Show dry run preview and ask for final confirmation
 */
export async function showDryRunPreview(envPreview, mcpConfig) {
  console.log(chalk.yellow('\n🔍 Dry Run Preview:\n'));
  
  console.log(chalk.cyan('📄 .env file contents:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(envPreview);
  console.log(chalk.gray('─'.repeat(50)));
  
  console.log(chalk.cyan('\n🔧 Claude Desktop Configuration:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(JSON.stringify(mcpConfig.desktop, null, 2));
  console.log(chalk.gray('─'.repeat(50)));
  
  console.log(chalk.cyan('\n💻 Claude Code CLI Commands:'));
  console.log(chalk.gray('─'.repeat(50)));
  mcpConfig.cli.forEach(cmd => console.log(cmd));
  console.log(chalk.gray('─'.repeat(50)));
  
  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed with writing these configurations?',
      default: true
    }
  ]);
  
  return proceed;
}

/**
 * Handle file backup options when .env already exists
 */
export async function handleExistingEnv() {
  console.log(chalk.yellow('\n⚠️  Existing .env file detected\n'));
  
  const choices = [
    { value: 'backup', name: 'Create backup and overwrite (.env.backup)' },
    { value: 'overwrite', name: 'Overwrite without backup' },
    { value: 'exit', name: 'Exit setup (keep existing file)' }
  ];
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'How would you like to proceed?',
      choices
    }
  ]);
  
  return action;
}