# Interactive Setup Wizard - Development Plan

## Overview
Create a user-friendly interactive setup script that guides users through configuring the GPT-5 MCP server with minimal technical knowledge required.

## Goals
- **One-command setup** - Single script execution
- **Zero configuration knowledge** - Clear prompts with explanations
- **Validation** - Test API keys and model access before saving
- **Multiple output formats** - Generate both Claude Desktop and Claude Code CLI configs
- **Safety** - Dry run mode and existing file protection

## User Experience Flow

### 1. Initial Setup
```bash
npm run setup
# or
node setup.js
```

### 2. Welcome & Detection
- Display welcome message and purpose
- Check if `.env` already exists
- Offer options: overwrite, backup, or exit

### 3. OpenAI Configuration
- **API Key Input**
  - Check if user has API key ready
  - If not, direct to: https://platform.openai.com/api-keys
  - Important notice: Organization must be verified for GPT-5 access
  - Link to verification guide: https://help.openai.com/en/articles/10910291-api-organization-verification
  - Prompt for OpenAI API key
  - Validate key with test request
  - Clear error messages if invalid

- **Fallback Model Selection**
  - Present available models with descriptions:
    - `gpt-4.1` - Latest GPT-4 iteration with enhanced capabilities
    - `o3` - Advanced reasoning model for complex tasks
    - `o3-deep-research` - Specialized for in-depth analysis and research
    - `o4-mini` - Compact, efficient model for quick responses
    - `o3-mini` - Lightweight reasoning model
    - `gpt-4o` - Multimodal GPT-4 with vision capabilities
  - Test user access to selected model
  - Provide fallback suggestions if access denied

### 4. Cost & Usage Configuration
- **Daily Cost Limit**
  - Default: $10.00
  - Explanation: "Maximum spending per day across all tasks (USD)"
  - Minimum validation: $1.00 (user can set any amount above this)
  - Note: All amounts are in US dollars

- **Task Cost Limit** 
  - Default: $5.00
  - Explanation: "Maximum spending per individual task/conversation (USD)"
  - Minimum validation: $1.00 (user can set any amount above this)
  - Note: All amounts are in US dollars

- **Default Reasoning Effort**
  - Options: minimal, low, medium, high
  - Default: high
  - Explanations:
    - minimal: Fast responses, basic reasoning
    - low: Quick responses with some analysis
    - medium: Balanced speed and reasoning depth
    - high: Thorough analysis and reasoning (slower, more expensive)

- **Default Verbosity**
  - Options: low, medium, high
  - Default: medium
  - Explanations:
    - low: Concise, direct responses
    - medium: Balanced detail level
    - high: Comprehensive, detailed explanations

### 5. Dry Run Preview
- Display all configuration choices
- Show preview of `.env` file contents
- Show preview of MCP setup commands
- Ask for final confirmation
- **If validation fails during dry run:**
  - Show specific error details
  - Offer interactive menu to redo specific configurations:
    - Re-enter API key
    - Choose different fallback model
    - Adjust cost limits
    - Change reasoning/verbosity settings
    - Start over completely
    - Exit setup

### 6. Configuration Generation
- Create/update `.env` file
- Generate Claude Desktop JSON config
- Generate Claude Code CLI commands
- Display setup completion summary

### 7. Next Steps Instructions
- Show how to add to Claude Desktop
- Show how to add to Claude Code CLI
- Provide troubleshooting tips
- Display final configuration summary

### 8. Documentation Updates
- Update `README.md` with simplified setup instructions referencing the new wizard
- Update `docs/quickstart.md` to include the interactive setup as the recommended approach
- Add troubleshooting section for common setup wizard issues

## Technical Implementation

### File Structure
```
setup.js                 # Main interactive script
src/setup/
  ├── validators.js       # API key and model validation
  ├── prompts.js         # User input prompts and menus
  ├── generators.js      # Config file generation
  └── instructions.js    # Setup instruction templates
```

### Key Components

#### 1. Validation Engine (`validators.js`)
```javascript
- validateApiKey(key) → Promise<boolean>
- validateModelAccess(key, model) → Promise<boolean>
- validateConfigValues(config) → ValidationResult
```

#### 2. Interactive Prompts (`prompts.js`)
```javascript
- promptApiKey() → Promise<string>
- promptFallbackModel() → Promise<string>
- promptCostLimits() → Promise<object>
- promptReasoningSettings() → Promise<object>
- confirmConfiguration(config) → Promise<boolean>
```

#### 3. Configuration Generators (`generators.js`)
```javascript
- generateEnvFile(config) → string
- generateClaudeDesktopConfig(projectPath) → object
- generateClaudeCodeCommands(projectPath) → string[]
```

#### 4. Setup Instructions (`instructions.js`)
```javascript
- getClaudeDesktopInstructions(config) → string
- getClaudeCodeInstructions(commands) → string
- getTroubleshootingTips() → string
```

### Dependencies
- `inquirer` - Interactive command line prompts
- `chalk` - Colored terminal output
- `ora` - Loading spinners during validation
- `fs-extra` - File system operations
- `path` - Path manipulation

### Environment Variables Generated
```env
# Required
OPENAI_API_KEY=sk-...

# Optional (with defaults)
DAILY_COST_LIMIT=10.00
TASK_COST_LIMIT=5.00
DEFAULT_REASONING_EFFORT=high
DEFAULT_VERBOSITY=medium
FALLBACK_MODEL=gpt-4o
DEFAULT_TEMPERATURE=0.7
```

### MCP Configuration Outputs

#### Claude Desktop Config (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "gpt5": {
      "command": "node",
      "args": ["/absolute/path/to/gpt5-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "DAILY_COST_LIMIT": "10.00",
        "TASK_COST_LIMIT": "5.00"
      }
    }
  }
}
```

#### Claude Code CLI Commands
```bash
# Development setup
claude mcp add gpt5 --env OPENAI_API_KEY=sk-... \
  --env DAILY_COST_LIMIT=10.00 \
  --env TASK_COST_LIMIT=5.00 \
  -- node /absolute/path/to/gpt5-mcp/dist/index.js

# Production setup (after build)
claude mcp add gpt5 --env-file /absolute/path/to/gpt5-mcp/.env \
  -- node /absolute/path/to/gpt5-mcp/dist/index.js
```

## Error Handling & Edge Cases

### API Key Validation
- Invalid format detection
- Network connectivity issues
- Rate limiting during validation
- Insufficient permissions

### Model Access Validation
- Model not available to user
- Regional restrictions
- Billing account issues

### File System Operations
- Permission errors
- Existing file backup
- Path resolution issues
- Directory creation

### User Experience
- Graceful cancellation (Ctrl+C)
- Input validation and retry
- Clear error messages
- Recovery suggestions

## Success Metrics
- User can complete setup in under 3 minutes
- Zero manual file editing required
- Working MCP server after completion
- Clear next steps provided
- Robust error handling and recovery

## Documentation Strategy

### README.md Updates
- Replace manual setup section with "Quick Setup" pointing to `npm run setup`
- Keep manual setup as "Advanced Setup" for developers
- Add setup wizard troubleshooting section
- Update examples to use wizard-generated configurations

### docs/quickstart.md Updates  
- Add interactive setup as primary recommendation
- Include wizard output examples
- Reference README for detailed manual setup
- Add common error scenarios and solutions

### New Documentation Sections
- Setup wizard FAQ
- Troubleshooting guide for API key issues
- OpenAI organization verification walkthrough
- Model access verification steps

## Future Enhancements
- Docker setup option
- Custom environment file location
- Bulk configuration for teams
- Configuration validation/health check
- Update existing configuration wizard