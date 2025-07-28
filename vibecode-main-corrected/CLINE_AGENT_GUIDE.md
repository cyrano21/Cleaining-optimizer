# Cline AI Agent Integration Guide

Transform your VibeCode IDE into a Cline-like experience with AI-powered development assistance.

## 🚀 Features

### AI Chat Assistant
- **Enhanced Chat Interface**: Multi-tab interface with AI chat and Cline agent
- **File Context**: Attach current files for better context
- **Code Suggestions**: Smart code improvements and fixes
- **Multiple Modes**: Chat, Review, Fix, and Optimize modes

### Cline Agent Capabilities
- **File Operations**: Create, modify, delete files and folders
- **Command Execution**: Run terminal commands and install dependencies
- **Code Generation**: Generate complete components and features
- **Architecture Planning**: Suggest project structures and best practices
- **Error Fixing**: Debug and fix compilation/runtime errors

## 🔧 Setup

### 1. Hugging Face Token (Optional)
Get your free token from [Hugging Face](https://huggingface.co/settings/tokens):
```bash
# Add to .env.local
HUGGINGFACE_API_TOKEN=hf_your_token_here
```

### 2. Available Models
```typescript
// Default models available
const HUGGINGFACE_MODELS = {
  CODE: 'microsoft/DialoGPT-large',
  CODEGEN: 'Salesforce/codegen-350M-mono',
  CODEBERT: 'microsoft/codebert-base',
  GPT2: 'gpt2',
  // Add more as needed
}
```

## 📖 Usage

### Quick Start
1. **Open AI Assistant**: Click the AI button in the sidebar
2. **Switch to Agent Tab**: Use the tab navigation
3. **Ask for Help**: Type your request like "Create a React component"
4. **Execute Actions**: Review and run suggested actions

### Example Prompts

#### Create Components
```
Create a React component for a user profile card with TypeScript and Tailwind CSS
```

#### Setup Projects
```
Set up a Next.js API route for user authentication with JWT tokens
```

#### Fix Issues
```
Fix TypeScript compilation errors in my React project
```

#### Optimize Code
```
Review and optimize my React component for better performance
```

## 🎯 API Endpoints

### Agent API
```typescript
POST /api/agent
{
  prompt: "Create a new React component",
  context: {
    currentFile: "App.tsx",
    projectStructure: {...}
  }
}
```

### Response Format
```json
{
  "actions": [
    {
      "type": "create_file",
      "filePath": "components/UserCard.tsx",
      "content": "...",
      "description": "Create user card component"
    }
  ],
  "explanation": "I'll create a user profile card component...",
  "warnings": [],
  "suggestions": []
}
```

## 🔍 Advanced Features

### Context-Aware Suggestions
The agent considers:
- Current file content
- Project structure
- Recent changes
- Attached files

### Action Types
- **create_file**: Create new files with content
- **modify_file**: Update existing files
- **delete_file**: Remove files
- **run_command**: Execute terminal commands
- **install_dependency**: Install npm packages
- **create_folder**: Create directory structures

### Error Handling
- Detailed error messages
- Alternative suggestions
- Rollback capabilities

## 🛠️ Development

### Adding New Capabilities
Extend the agent by modifying:
- `lib/huggingface-ai.ts`: AI model integration
- `app/api/agent/route.ts`: API endpoints
- `features/ai-chat/components/cline-agent.tsx`: UI components

### Custom Models
```typescript
// Use different models
const agent = new ClineAgent('Salesforce/codegen-350M-mono')
```

## 📋 Troubleshooting

### Common Issues

1. **Token Not Working**
   - Verify your Hugging Face token
   - Check token permissions
   - Ensure token is in .env.local

2. **API Errors**
   - Check network connectivity
   - Verify model availability
   - Review error logs

3. **File Operations**
   - Ensure proper file permissions
   - Check project structure
   - Validate file paths

### Debug Mode
Enable debug logging:
```typescript
// In cline-agent.tsx
const [debugMode, setDebugMode] = useState(true)
```

## 🎨 Customization

### Styling
Modify components in:
- `features/ai-chat/components/cline-agent.tsx`
- `features/ai-chat/components/ai-chat-with-agent.tsx`

### Behavior
Adjust agent behavior in:
- `app/api/agent/route.ts`
- `lib/huggingface-ai.ts`

## 🔗 Integration

### With Existing Components
Replace existing AI chat with the new agent:
```typescript
// Instead of AIChatSidePanel
import { AIChatWithAgent } from "@/features/ai-chat/components/ai-chat-with-agent"
```

### Custom Hooks
Create custom hooks for agent interactions:
```typescript
const useClineAgent = () => {
  const [agent, setAgent] = useState(null)
  // Custom logic here
}
```

## 📊 Performance Tips

1. **Model Selection**: Use smaller models for faster responses
2. **Context Limiting**: Limit file attachments for better performance
3. **Caching**: Cache common responses
4. **Streaming**: Enable streaming for large responses

## 🚀 Next Steps

- [ ] Add more AI models
- [ ] Implement file system operations
- [ ] Add project templates
- [ ] Create custom commands
- [ ] Add testing capabilities
- [ ] Implement deployment features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review API logs
- Open an issue on GitHub
- Join our Discord community
