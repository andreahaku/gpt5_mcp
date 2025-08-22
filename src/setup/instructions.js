import chalk from 'chalk';
import path from 'path';

/**
 * Display setup completion summary
 * @param {Object} config - User configuration
 * @param {Object} generated - Generated configurations
 */
export function displaySetupComplete(config, generated) {
  console.log(chalk.green.bold('\n🎉 Setup Complete!\n'));
  
  console.log(chalk.cyan('Configuration Summary:'));
  console.log(`  ✅ .env file created with your settings`);
  console.log(`  ✅ Claude Desktop configuration ready`);
  console.log(`  ✅ Claude Code CLI commands generated`);
  console.log(`  ✅ Fallback model: ${config.fallbackModel}`);
  console.log(`  ✅ Daily limit: $${config.dailyCostLimit}`);
  console.log(`  ✅ Task limit: $${config.taskCostLimit}\n`);
}

/**
 * Display Claude Desktop setup instructions
 * @param {Object} desktopConfig - Claude Desktop configuration
 */
export function displayClaudeDesktopInstructions(desktopConfig) {
  console.log(chalk.bold.blue('📱 Claude Desktop Setup:\n'));
  
  const os = process.platform;
  let configPath;
  
  switch (os) {
    case 'darwin': // macOS
      configPath = '~/Library/Application Support/Claude/claude_desktop_config.json';
      break;
    case 'win32': // Windows
      configPath = '%APPDATA%\\\\Claude\\\\claude_desktop_config.json';
      break;
    case 'linux': // Linux
      configPath = '~/.config/Claude/claude_desktop_config.json';
      break;
    default:
      configPath = '[Your Claude config directory]/claude_desktop_config.json';
  }
  
  console.log(chalk.yellow('The Claude Desktop configuration has been automatically updated!'));
  console.log(`Configuration file: ${chalk.blue(configPath)}\n`);
  
  console.log(chalk.yellow('To complete Claude Desktop setup:'));
  console.log('1. ' + chalk.green('Restart Claude Desktop') + ' completely (Quit → Restart)');
  console.log('2. The GPT-5 server will be available automatically');
  console.log(`3. Look for the server status in Claude Desktop's settings\n`);
  
  console.log(chalk.gray('If you need to manually verify the configuration:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.gray(JSON.stringify(desktopConfig, null, 2)));
  console.log(chalk.gray('─'.repeat(50)));
}

/**
 * Display Claude Code CLI setup instructions
 * @param {string[]} cliCommands - Array of CLI commands
 */
export function displayClaudeCodeInstructions(cliCommands) {
  console.log(chalk.bold.blue('💻 Claude Code CLI Setup:\n'));
  
  console.log(chalk.yellow('Choose one of these commands to add the GPT-5 MCP server:\n'));
  
  console.log(chalk.green('Option 1: Using .env file (Recommended)'));
  console.log('This uses your .env file and is easier to manage:\n');
  console.log(chalk.white(cliCommands[1]));
  
  console.log(chalk.green('\n\nOption 2: Using individual environment variables'));
  console.log('This includes all settings directly in the command:\n');
  console.log(chalk.white(cliCommands[0]));
  
  console.log(chalk.yellow('\n\nAfter running either command:'));
  console.log('1. The server will be added to your Claude Code CLI configuration');
  console.log('2. You can verify with: ' + chalk.blue('claude mcp list'));
  console.log('3. Check server status with: ' + chalk.blue('/mcp') + ' (inside Claude Code)');
}

/**
 * Display troubleshooting information
 */
export function displayTroubleshootingTips() {
  console.log(chalk.bold.yellow('\n🔧 Troubleshooting Tips:\n'));
  
  console.log(chalk.cyan('Common Issues:'));
  
  console.log(chalk.white('1. Server not appearing in Claude Desktop:'));
  console.log('   • Make sure you completely quit and restart Claude Desktop');
  console.log('   • Check that the config file path is correct');
  console.log('   • Verify the dist/index.js file exists (run "npm run build")\n');
  
  console.log(chalk.white('2. API Key errors:'));
  console.log('   • Ensure your API key starts with "sk-"');
  console.log('   • Verify your OpenAI organization is verified for GPT-5');
  console.log('   • Check that your API key has sufficient credits\n');
  
  console.log(chalk.white('3. Model access errors:'));
  console.log('   • Some models require special access or verification');
  console.log(`   • Check your organization's model access in OpenAI dashboard`);
  console.log('   • Try a different fallback model if one is not available\n');
  
  console.log(chalk.white('4. Claude Code CLI issues:'));
  console.log(`   • Make sure you're using absolute paths in commands`);
  console.log('   • Verify the MCP server was added: ' + chalk.blue('claude mcp list'));
  console.log('   • Remove and re-add if needed: ' + chalk.blue('claude mcp remove gpt5') + '\n');
  
  console.log(chalk.cyan('Getting Help:'));
  console.log('• OpenAI API Status: ' + chalk.blue('https://status.openai.com/'));
  console.log('• Claude Code Documentation: ' + chalk.blue('https://docs.anthropic.com/en/docs/claude-code'));
  console.log('• Organization Verification: ' + chalk.blue('https://help.openai.com/en/articles/10910291-api-organization-verification'));
}

/**
 * Display next steps and usage examples
 * @param {Object} config - User configuration
 */
export function displayUsageExamples(config) {
  console.log(chalk.bold.green('\n🚀 Ready to Use!\n'));
  
  console.log(chalk.cyan('Try these commands in Claude Code:'));
  console.log('• ' + chalk.blue('/mcp') + ' - Check MCP server status');
  console.log('• ' + chalk.blue('consult_gpt5 "Explain quantum computing"') + ' - Basic usage');
  console.log('• ' + chalk.blue('start_conversation "Code review session"') + ' - Start a conversation');
  console.log('• ' + chalk.blue('get_cost_report today') + ' - Check your usage\n');
  
  console.log(chalk.cyan('Configuration Details:'));
  console.log(`• Fallback Model: ${config.fallbackModel}`);
  console.log(`• Reasoning Effort: ${config.reasoningEffort}`);
  console.log(`• Response Verbosity: ${config.verbosity}`);
  console.log(`• Daily Spending Limit: $${config.dailyCostLimit}`);
  console.log(`• Per-Task Limit: $${config.taskCostLimit}\n`);
  
  console.log(chalk.yellow('💡 Pro Tips:'));
  console.log('• Use lower reasoning effort for quick questions');
  console.log('• Monitor your costs with get_cost_report');
  console.log('• Start conversations for multi-turn interactions');
  console.log('• You can always reconfigure by running setup again');
}

/**
 * Display file locations and backup information
 * @param {string} projectPath - Project directory path
 */
export function displayFileLocations(projectPath) {
  console.log(chalk.bold.cyan('\n📁 File Locations:\n'));
  
  console.log(chalk.white('Project Files:'));
  console.log(`  Configuration: ${chalk.blue(path.join(projectPath, '.env'))}`);
  console.log(`  Server Binary: ${chalk.blue(path.join(projectPath, 'dist', 'index.js'))}`);
  console.log(`  Usage Data: ${chalk.blue(path.join(projectPath, 'data', 'usage.json'))}\n`);
  
  const os = process.platform;
  let desktopConfigPath;
  
  switch (os) {
    case 'darwin':
      desktopConfigPath = '~/Library/Application Support/Claude/claude_desktop_config.json';
      break;
    case 'win32':
      desktopConfigPath = '%APPDATA%\\\\Claude\\\\claude_desktop_config.json';
      break;
    case 'linux':
      desktopConfigPath = '~/.config/Claude/claude_desktop_config.json';
      break;
    default:
      desktopConfigPath = '[Claude config directory]/claude_desktop_config.json';
  }
  
  console.log(chalk.white('Claude Desktop:'));
  console.log(`  Config File: ${chalk.blue(desktopConfigPath)}\n`);
  
  console.log(chalk.gray('💾 Note: If .env.backup exists, it contains your previous configuration'));
}

/**
 * Display complete setup instructions in order
 * @param {Object} config - User configuration
 * @param {Object} generated - Generated configurations
 */
export function displayCompleteInstructions(config, generated) {
  // Clear screen for clean output
  console.clear();
  
  // Setup complete summary
  displaySetupComplete(config, generated);
  
  // Claude Desktop instructions
  displayClaudeDesktopInstructions(generated.mcpConfig.desktop);
  
  // Claude Code CLI instructions
  displayClaudeCodeInstructions(generated.mcpConfig.cli);
  
  // Usage examples
  displayUsageExamples(config);
  
  // File locations
  displayFileLocations(generated.projectPath);
  
  // Troubleshooting
  displayTroubleshootingTips();
  
  // Final message
  console.log(chalk.bold.green(`\n🎯 You're all set! Happy coding with GPT-5! 🚀\n`));
}