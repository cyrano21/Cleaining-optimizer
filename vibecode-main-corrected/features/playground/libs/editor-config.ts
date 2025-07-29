import type { Monaco } from "@monaco-editor/react";
import { HuggingFaceAI } from "@/lib/huggingface-ai";
import { OllamaAI } from "@/lib/ollama-ai";
import { GeminiAI } from "@/lib/gemini-ai";

export const getEditorLanguage = (fileExtension: string): string => {
  const extension = fileExtension.toLowerCase();
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    mjs: "javascript",
    cjs: "javascript",
    
    // Web languages
    json: "json",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "less",
    
    // Markup/Documentation
    md: "markdown",
    markdown: "markdown",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    
    // Programming languages
    py: "python",
    python: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    sh: "shell",
    bash: "shell",
    sql: "sql",
    
    // Config files
    toml: "ini",
    ini: "ini",
    conf: "ini",
    dockerfile: "dockerfile",
  };
  
  return languageMap[extension] || "plaintext";
};

// Create AI-powered code actions provider
export const createCodeActionsProvider = (monaco: Monaco) => {
  const huggingFaceAI = new HuggingFaceAI();
  let ollamaAI: OllamaAI | null = null;
  let geminiAI: GeminiAI | null = null;
  
  // Try to initialize Ollama, fallback to HuggingFace if it fails
  try {
    ollamaAI = new OllamaAI();
  } catch (error) {
    console.warn('Ollama not available, using HuggingFace as fallback:', error);
  }
  
  // Try to initialize Gemini
  try {
    geminiAI = new GeminiAI();
  } catch (error) {
    console.warn('Gemini not available:', error);
  }

  // Get available AI provider
  const getAIProvider = () => {
    if (geminiAI) return geminiAI;
    if (ollamaAI) return ollamaAI;
    return huggingFaceAI;
  };

  return {
    provideCodeActions: async (
      model: import('monaco-editor').editor.ITextModel, 
      range: import('monaco-editor').Range, 
      context: import('monaco-editor').languages.CodeActionContext,
      token: import('monaco-editor').CancellationToken
    ) => {
      // Use token to avoid unused variable warning
      if (token.isCancellationRequested) return { actions: [], dispose: () => {} };
      const actions: import('monaco-editor').languages.CodeAction[] = [];
      const aiProvider = getAIProvider();
      
      // Check if there are diagnostics (errors/warnings) in the current range
      const diagnostics = context.markers || [];
      
      for (const diagnostic of diagnostics) {
        if (diagnostic.severity === monaco.MarkerSeverity.Error || 
            diagnostic.severity === monaco.MarkerSeverity.Warning) {
          
          const errorMessage = diagnostic.message;
          const code = model.getValueInRange({
            startLineNumber: diagnostic.startLineNumber,
            startColumn: diagnostic.startColumn,
            endLineNumber: diagnostic.endLineNumber,
            endColumn: diagnostic.endColumn
          });
          
          // Create AI fix action
          actions.push({
            title: `🤖 Corriger avec l'IA: ${errorMessage.substring(0, 50)}...`,
            kind: 'quickfix',
            isPreferred: true,
            edit: {
              edits: []
            },
            command: {
              id: 'ai.fixError',
              title: 'Fix with AI',
              arguments: [{
                error: errorMessage,
                code: code,
                range: {
                  startLineNumber: diagnostic.startLineNumber,
                  startColumn: diagnostic.startColumn,
                  endLineNumber: diagnostic.endLineNumber,
                  endColumn: diagnostic.endColumn
                },
                language: getEditorLanguage(model.uri?.path?.split('.').pop() || 'ts'),
                aiProvider
              }]
            }
          });
        }
      }
      
      return {
        actions: actions,
        dispose: () => {}
      };
    }
  };
};

// Register AI fix command
export const registerAICommands = (monaco: Monaco) => {
  const huggingFaceAI = new HuggingFaceAI();
  let ollamaAI: OllamaAI | null = null;
  
  try {
    ollamaAI = new OllamaAI();
  } catch (error) {
    console.warn('Ollama not available, using HuggingFace as fallback:', error);
  }

  // Register the AI fix command globally
  monaco.editor.addEditorAction({
    id: 'ai.fixError',
    label: 'Corriger avec l\'IA',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
    contextMenuGroupId: 'modification',
    contextMenuOrder: 1.5,
    run: async (editor: import('monaco-editor').editor.IStandaloneCodeEditor, ...args: unknown[]) => {
      const [params] = args;
      if (!params || typeof params !== 'object') return;
      
      const { error, code, range, language } = params as {
        error: string;
        code: string;
        range?: import('monaco-editor').Range;
        language: string;
      };
      
      // Show loading indicator only if range is provided
      let loadingDecoration: string[] = [];
      
      try {
        if (range) {
          loadingDecoration = editor.deltaDecorations([], [{
            range: new monaco.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn),
            options: {
              className: 'ai-fixing-decoration',
              hoverMessage: { value: '🤖 L\'IA corrige le code...' }
            }
          }]);
        }
        
        let fixedCode = '';
        
        // Try Ollama first, then fallback to HuggingFace
        try {
          if (ollamaAI) {
            const response = await ollamaAI.fixError(error, code, language);
            fixedCode = typeof response === 'object' && response !== null && 'content' in response 
              ? (response as { content: string }).content 
              : String(response);
          } else {
            throw new Error('Ollama not available');
          }
        } catch (ollamaError) {
          console.warn('Ollama failed, trying HuggingFace:', ollamaError);
          const response = await huggingFaceAI.fixError(error, code, language);
          fixedCode = typeof response === 'object' && response !== null && 'content' in response 
            ? (response as { content: string }).content 
            : String(response);
        }
        
        // Remove loading decoration
        if (loadingDecoration.length > 0) {
          editor.deltaDecorations(loadingDecoration, []);
        }
        
        if (typeof fixedCode === 'string' && fixedCode.trim()) {
          // Extract just the code part if the response includes explanation
          const codeMatch = fixedCode.match(/```(?:typescript|javascript|tsx|jsx)?\n([\s\S]*?)\n```/);
          const cleanCode = codeMatch ? codeMatch[1] : fixedCode;
          
          if (range) {
            // Apply the fix
            editor.executeEdits('ai-fix', [{
              range: new monaco.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn),
              text: cleanCode.trim()
            }]);
            
            // Show success message
            const successDecoration = editor.deltaDecorations([], [{
              range: new monaco.Range(range.startLineNumber, range.startColumn, range.startLineNumber + cleanCode.split('\n').length - 1, 1),
              options: {
                className: 'ai-success-decoration',
                hoverMessage: { value: '✅ Corrigé par l\'IA' }
              }
            }]);
            
            // Remove success decoration after 3 seconds
            setTimeout(() => {
              editor.deltaDecorations(successDecoration, []);
            }, 3000);
          } else {
            // If no range provided, replace all content
            const model = editor.getModel();
            if (model) {
              const fullRange = model.getFullModelRange();
              editor.executeEdits('ai-fix', [{
                range: fullRange,
                text: cleanCode.trim()
              }]);
            }
          }
        }
      } catch (error) {
        console.error('AI fix failed:', error);
        // Remove loading decoration if it exists
        if (loadingDecoration.length > 0) {
          editor.deltaDecorations(loadingDecoration, []);
        }
        
        // Show error message only if range is available
        if (range) {
          const errorDecoration = editor.deltaDecorations([], [{
            range: new monaco.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn),
            options: {
              className: 'ai-error-decoration',
              hoverMessage: { value: '❌ Échec de la correction IA: ' + (error as Error).message }
            }
          }]);
          
          setTimeout(() => {
            editor.deltaDecorations(errorDecoration, []);
          }, 5000);
        }
      }
    }
  });
};

export const configureMonaco = (monaco: Monaco) => {
  // Define a beautiful modern dark theme
  monaco.editor.defineTheme("modern-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      // Comments
      { token: "comment", foreground: "7C7C7C", fontStyle: "italic" },
      { token: "comment.line", foreground: "7C7C7C", fontStyle: "italic" },
      { token: "comment.block", foreground: "7C7C7C", fontStyle: "italic" },
      
      // Keywords
      { token: "keyword", foreground: "C586C0", fontStyle: "bold" },
      { token: "keyword.control", foreground: "C586C0", fontStyle: "bold" },
      { token: "keyword.operator", foreground: "D4D4D4" },
      
      // Strings
      { token: "string", foreground: "CE9178" },
      { token: "string.quoted", foreground: "CE9178" },
      { token: "string.template", foreground: "CE9178" },
      
      // Numbers
      { token: "number", foreground: "B5CEA8" },
      { token: "number.hex", foreground: "B5CEA8" },
      { token: "number.float", foreground: "B5CEA8" },
      
      // Functions
      { token: "entity.name.function", foreground: "DCDCAA" },
      { token: "support.function", foreground: "DCDCAA" },
      
      // Variables
      { token: "variable", foreground: "9CDCFE" },
      { token: "variable.parameter", foreground: "9CDCFE" },
      { token: "variable.other", foreground: "9CDCFE" },
      
      // Types
      { token: "entity.name.type", foreground: "4EC9B0" },
      { token: "support.type", foreground: "4EC9B0" },
      { token: "storage.type", foreground: "569CD6" },
      
      // Classes
      { token: "entity.name.class", foreground: "4EC9B0" },
      { token: "support.class", foreground: "4EC9B0" },
      
      // Constants
      { token: "constant", foreground: "4FC1FF" },
      { token: "constant.language", foreground: "569CD6" },
      { token: "constant.numeric", foreground: "B5CEA8" },
      
      // Operators
      { token: "keyword.operator", foreground: "D4D4D4" },
      { token: "punctuation", foreground: "D4D4D4" },
      
      // HTML/XML
      { token: "tag", foreground: "569CD6" },
      { token: "tag.id", foreground: "9CDCFE" },
      { token: "tag.class", foreground: "92C5F8" },
      { token: "attribute.name", foreground: "9CDCFE" },
      { token: "attribute.value", foreground: "CE9178" },
      
      // CSS
      { token: "attribute.name.css", foreground: "9CDCFE" },
      { token: "attribute.value.css", foreground: "CE9178" },
      { token: "property-name.css", foreground: "9CDCFE" },
      { token: "property-value.css", foreground: "CE9178" },
      
      // JSON
      { token: "key", foreground: "9CDCFE" },
      { token: "string.key", foreground: "9CDCFE" },
      { token: "string.value", foreground: "CE9178" },
      
      // Error/Warning
      { token: "invalid", foreground: "F44747", fontStyle: "underline" },
      { token: "invalid.deprecated", foreground: "D4D4D4", fontStyle: "strikethrough" },
    ],
    colors: {
      // Editor background
      "editor.background": "#0D1117",
      "editor.foreground": "#E6EDF3",
      
      // Line numbers
      "editorLineNumber.foreground": "#7D8590",
      "editorLineNumber.activeForeground": "#F0F6FC",
      
      // Cursor
      "editorCursor.foreground": "#F0F6FC",
      
      // Selection
      "editor.selectionBackground": "#264F78",
      "editor.selectionHighlightBackground": "#ADD6FF26",
      "editor.inactiveSelectionBackground": "#3A3D41",
      
      // Current line
      "editor.lineHighlightBackground": "#21262D",
      "editor.lineHighlightBorder": "#30363D",
      
      // Gutter
      "editorGutter.background": "#0D1117",
      "editorGutter.modifiedBackground": "#BB800966",
      "editorGutter.addedBackground": "#347D3966",
      "editorGutter.deletedBackground": "#F8514966",
      
      // Scrollbar
      "scrollbar.shadow": "#0008",
      "scrollbarSlider.background": "#6E768166",
      "scrollbarSlider.hoverBackground": "#6E768188",
      "scrollbarSlider.activeBackground": "#6E7681BB",
      
      // Minimap
      "minimap.background": "#161B22",
      "minimap.selectionHighlight": "#264F78",
      
      // Find/Replace
      "editor.findMatchBackground": "#9E6A03",
      "editor.findMatchHighlightBackground": "#F2CC6080",
      "editor.findRangeHighlightBackground": "#3FB95040",
      
      // Word highlight
      "editor.wordHighlightBackground": "#575757B8",
      "editor.wordHighlightStrongBackground": "#004972B8",
      
      // Brackets
      "editorBracketMatch.background": "#0064001A",
      "editorBracketMatch.border": "#888888",
      
      // Indentation guides
      "editorIndentGuide.background": "#21262D",
      "editorIndentGuide.activeBackground": "#30363D",
      
      // Ruler
      "editorRuler.foreground": "#21262D",
      
      // Whitespace
      "editorWhitespace.foreground": "#6E7681",
      
      // Error/Warning squiggles
      "editorError.foreground": "#F85149",
      "editorWarning.foreground": "#D29922",
      "editorInfo.foreground": "#75BEFF",
      "editorHint.foreground": "#EEEEEE",
      
      // Suggest widget
      "editorSuggestWidget.background": "#161B22",
      "editorSuggestWidget.border": "#30363D",
      "editorSuggestWidget.foreground": "#E6EDF3",
      "editorSuggestWidget.selectedBackground": "#21262D",
      
      // Hover widget
      "editorHoverWidget.background": "#161B22",
      "editorHoverWidget.border": "#30363D",
      
      // Panel
      "panel.background": "#0D1117",
      "panel.border": "#30363D",
      
      // Activity bar
      "activityBar.background": "#0D1117",
      "activityBar.foreground": "#E6EDF3",
      "activityBar.border": "#30363D",
      
      // Side bar
      "sideBar.background": "#0D1117",
      "sideBar.foreground": "#E6EDF3",
      "sideBar.border": "#30363D",
    },
  });

  // Set the theme
  monaco.editor.setTheme("modern-dark");
  
  // Configure additional editor settings
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // Set compiler options for better IntelliSense
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });

  // Register AI-powered code actions provider for TypeScript and JavaScript
  const codeActionsProvider = createCodeActionsProvider(monaco);
  
  monaco.languages.registerCodeActionProvider('typescript', codeActionsProvider);
  monaco.languages.registerCodeActionProvider('javascript', codeActionsProvider);
  monaco.languages.registerCodeActionProvider('typescriptreact', codeActionsProvider);
  monaco.languages.registerCodeActionProvider('javascriptreact', codeActionsProvider);
};

export const defaultEditorOptions = {
  // Font settings
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
  fontLigatures: true,
  fontWeight: "400",
  
  // Layout
  minimap: { 
    enabled: true,
    size: "proportional" as const,
    showSlider: "mouseover" as const
  },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 16, bottom: 16 },
  
  // Line settings
  lineNumbers: "on" as const,
  lineHeight: 20,
  renderLineHighlight: "all" as const,
  renderWhitespace: "selection" as const,
  
  // Indentation
  tabSize: 2,
  insertSpaces: true,
  detectIndentation: true,
  
  // Word wrapping
  wordWrap: "on" as const,
  wordWrapColumn: 120,
  wrappingIndent: "indent" as const,
  
  // Code folding
  folding: true,
  foldingHighlight: true,
  foldingStrategy: "indentation" as const,
  showFoldingControls: "mouseover" as const,
  
  // Scrolling
  smoothScrolling: true,
  mouseWheelZoom: true,
  fastScrollSensitivity: 5,
  
  // Selection
  multiCursorModifier: "ctrlCmd" as const,
  selectionHighlight: true,
  occurrencesHighlight: "singleFile" as const,
  
  // Suggestions
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: "on" as const,
  tabCompletion: "on" as const,
  wordBasedSuggestions: "currentDocument" as const,
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false
  },
  
  // Formatting
  formatOnPaste: true,
  formatOnType: true,
  
  // Bracket matching
  matchBrackets: "always" as const,
  bracketPairColorization: {
    enabled: true
  },
  
  // Guides
  renderIndentGuides: true,
  highlightActiveIndentGuide: true,
  rulers: [80, 120] as (number | import('monaco-editor').editor.IRulerOption)[],
  
  // Performance
  disableLayerHinting: false,
  disableMonospaceOptimizations: false,
  
  // Accessibility
  accessibilitySupport: "auto" as const,
  
  // Cursor
  cursorBlinking: "smooth" as const,
  cursorSmoothCaretAnimation: "on" as const,
  cursorStyle: "line" as const,
  cursorWidth: 2,
  
  // Find
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: "never" as const,
    seedSearchStringFromSelection: "always" as const
  },
  
  // Hover
  hover: {
    enabled: true,
    delay: 300,
    sticky: true
  },
  
  // Semantic highlighting
  "semanticHighlighting.enabled": true,
  
  // Sticky scroll
  stickyScroll: {
    enabled: true
  }
};