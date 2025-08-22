#!/usr/bin/env node

import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";

// Import our setup modules
import {
  displayWelcome,
  promptApiKeyReadiness,
  promptApiKey,
  promptFallbackModel,
  promptCostLimits,
  promptReasoningSettings,
  confirmConfiguration,
  handleValidationFailure,
} from "./src/setup/prompts.js";

import { validateCompleteConfiguration } from "./src/setup/validators.js";

import { generateAllConfigurations, getProjectPath, writeEnvFile } from "./src/setup/generators.js";

import { displayCompleteInstructions } from "./src/setup/instructions.js";

/**
 * Main setup wizard function
 */
async function runSetupWizard() {
  try {
    // Welcome and initial checks
    console.clear();

    const ready = await displayWelcome();
    if (!ready) {
      console.log(chalk.yellow("Setup cancelled. Run again when you're ready!"));
      process.exit(0);
    }

    // Check API key readiness
    const hasApiKey = await promptApiKeyReadiness();
    if (!hasApiKey) {
      process.exit(0);
    }

    // Note: This is preview-only mode, no files will be written

    // Main configuration loop
    let config = {};
    let configComplete = false;

    while (!configComplete) {
      try {
        // Collect configuration
        config = await collectConfiguration(config);

        // Confirm configuration
        const confirmed = await confirmConfiguration(config);
        if (!confirmed) {
          console.log(chalk.yellow("\nLet's reconfigure...\n"));
          continue;
        }

        // Validate configuration
        const spinner = ora("Validating configuration...").start();

        try {
          const validation = await validateCompleteConfiguration(config);
          spinner.stop();

          if (validation.valid) {
            configComplete = true;
            console.log(chalk.green("✅ Configuration validated successfully!"));
          } else {
            console.log(""); // Add space after spinner
            const action = await handleValidationFailure(validation.errors);

            if (action === "exit") {
              console.log(chalk.yellow("Setup cancelled."));
              process.exit(0);
            } else if (action === "restart") {
              config = {};
              console.log(chalk.yellow("\nStarting over...\n"));
            } else {
              // Handle specific reconfiguration
              config = await handleSpecificReconfiguration(config, action);
            }
          }
        } catch (error) {
          spinner.fail("Validation failed");
          console.error(chalk.red(`\nValidation error: ${error.message}`));

          const action = await handleValidationFailure([error.message]);
          if (action === "exit") {
            process.exit(1);
          } else if (action === "restart") {
            config = {};
          }
        }
      } catch (error) {
        console.error(chalk.red(`\nConfiguration error: ${error.message}`));
        console.log(chalk.yellow("Please try again...\n"));
      }
    }

    // Generate configurations
    console.log(chalk.blue("\n🔧 Generating configurations..."));
    const generated = await generateAllConfigurations(config);

    // Write .env file but not Claude Desktop config
    console.log(chalk.blue("\n💾 Creating .env file..."));

    const writeOptions = {
      backup: true, // Always backup existing .env files
      writeDesktopConfig: false, // Don't auto-write Claude Desktop config
    };

    // Write only the .env file
    await writeEnvFile(generated.projectPath, generated.envContent, writeOptions.backup);

    // Display complete instructions
    displayCompleteInstructions(config, generated);

    console.log(
      chalk.yellow("\n✅ .env file created! Claude configurations shown above for manual setup."),
    );
  } catch (error) {
    console.error(chalk.red(`\n💥 Setup wizard failed: ${error.message}`));
    console.error(chalk.gray(error.stack));

    console.log(chalk.yellow("\nPlease try running the setup again or report this issue."));
    process.exit(1);
  }
}

/**
 * Collect configuration from user
 */
async function collectConfiguration(existingConfig = {}) {
  const config = { ...existingConfig };

  // API Key
  if (!config.apiKey) {
    config.apiKey = await promptApiKey();
  }

  // Fallback model
  if (!config.fallbackModel) {
    config.fallbackModel = await promptFallbackModel();
  }

  // Cost limits
  if (!config.dailyCostLimit || !config.taskCostLimit) {
    const costLimits = await promptCostLimits();
    config.dailyCostLimit = costLimits.dailyCostLimit;
    config.taskCostLimit = costLimits.taskCostLimit;
  }

  // Reasoning settings
  if (!config.reasoningEffort || !config.verbosity) {
    const reasoningSettings = await promptReasoningSettings();
    config.reasoningEffort = reasoningSettings.reasoningEffort;
    config.verbosity = reasoningSettings.verbosity;
  }

  return config;
}

/**
 * Handle specific reconfiguration based on user choice
 */
async function handleSpecificReconfiguration(config, action) {
  const newConfig = { ...config };

  switch (action) {
    case "api-key":
      newConfig.apiKey = await promptApiKey();
      break;

    case "model":
      newConfig.fallbackModel = await promptFallbackModel();
      break;

    case "costs":
      const costLimits = await promptCostLimits();
      newConfig.dailyCostLimit = costLimits.dailyCostLimit;
      newConfig.taskCostLimit = costLimits.taskCostLimit;
      break;

    case "behavior":
      const reasoningSettings = await promptReasoningSettings();
      newConfig.reasoningEffort = reasoningSettings.reasoningEffort;
      newConfig.verbosity = reasoningSettings.verbosity;
      break;

    case "restart":
      return await collectConfiguration();

    default:
      console.log(chalk.yellow("Unknown action, starting over..."));
      return await collectConfiguration();
  }

  return newConfig;
}

/**
 * Handle graceful shutdown on Ctrl+C
 */
process.on("SIGINT", () => {
  console.log(chalk.yellow("\n\n👋 Setup cancelled by user."));
  console.log("Run the setup wizard again anytime!");
  process.exit(0);
});

/**
 * Handle unhandled promise rejections
 */
process.on("unhandledRejection", (reason, promise) => {
  console.error(chalk.red("\n💥 Unhandled error occurred:"));
  console.error(reason);
  console.log(chalk.yellow("\nPlease report this issue and try running setup again."));
  process.exit(1);
});

// Run the setup wizard if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSetupWizard();
}
