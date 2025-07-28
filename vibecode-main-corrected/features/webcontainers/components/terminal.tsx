"use client";

import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { SearchAddon } from "xterm-addon-search";
import "xterm/css/xterm.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Copy, Trash2, Download, AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalErrorMonitor } from "../services/terminal-error-monitor";
import TerminalErrorPanel from "./terminal-error-panel";
import TerminalErrorNotifications from "./terminal-error-notifications";

interface TerminalProps {
  webcontainerUrl?: string;
  className?: string;
  theme?: "dark" | "light";
  webContainerInstance?: any;
}

// Define the methods that will be exposed through the ref
export interface TerminalRef {
  writeToTerminal: (data: string) => void;
  clearTerminal: () => void;
  focusTerminal: () => void;
}

const TerminalComponent = forwardRef<TerminalRef, TerminalProps>(({ 
  webcontainerUrl, 
  className,
  theme = "dark",
  webContainerInstance
}, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const searchAddon = useRef<SearchAddon | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showErrorPanel, setShowErrorPanel] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  
  // Command line state
  const currentLine = useRef<string>("");
  const cursorPosition = useRef<number>(0);
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);
  const currentProcess = useRef<any>(null);
  const shellProcess = useRef<any>(null);

  const terminalThemes = {
    dark: {
      background: "#09090B",
      foreground: "#FAFAFA",
      cursor: "#FAFAFA",
      cursorAccent: "#09090B",
      selection: "#27272A",
      black: "#18181B",
      red: "#EF4444",
      green: "#22C55E",
      yellow: "#EAB308",
      blue: "#3B82F6",
      magenta: "#A855F7",
      cyan: "#06B6D4",
      white: "#F4F4F5",
      brightBlack: "#3F3F46",
      brightRed: "#F87171",
      brightGreen: "#4ADE80",
      brightYellow: "#FDE047",
      brightBlue: "#60A5FA",
      brightMagenta: "#C084FC",
      brightCyan: "#22D3EE",
      brightWhite: "#FFFFFF",
    },
    light: {
      background: "#FFFFFF",
      foreground: "#18181B",
      cursor: "#18181B",
      cursorAccent: "#FFFFFF",
      selection: "#E4E4E7",
      black: "#18181B",
      red: "#DC2626",
      green: "#16A34A",
      yellow: "#CA8A04",
      blue: "#2563EB",
      magenta: "#9333EA",
      cyan: "#0891B2",
      white: "#F4F4F5",
      brightBlack: "#71717A",
      brightRed: "#EF4444",
      brightGreen: "#22C55E",
      brightYellow: "#EAB308",
      brightBlue: "#3B82F6",
      brightMagenta: "#A855F7",
      brightCyan: "#06B6D4",
      brightWhite: "#FAFAFA",
    },
  };

  const writePrompt = useCallback(() => {
    if (term.current) {
      term.current.write("\r\n$ ");
      currentLine.current = "";
      cursorPosition.current = 0;
    }
  }, []);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    writeToTerminal: (data: string) => {
      if (term.current) {
        term.current.write(data);
      }
    },
    clearTerminal: () => {
      clearTerminal();
    },
    focusTerminal: () => {
      if (term.current) {
        term.current.focus();
      }
    },
  }));

  const executeCommand = useCallback(async (command: string) => {
    if (!webContainerInstance || !term.current) return;

    // Add to history
    if (command.trim() && commandHistory.current[commandHistory.current.length - 1] !== command) {
      commandHistory.current.push(command);
    }
    historyIndex.current = -1;

    let commandOutput = "";
    let exitCode: number | undefined;

    try {
      // Handle built-in commands
      if (command.trim() === "clear") {
        term.current.clear();
        writePrompt();
        return;
      }

      if (command.trim() === "history") {
        commandHistory.current.forEach((cmd, index) => {
          term.current!.writeln(`  ${index + 1}  ${cmd}`);
        });
        writePrompt();
        return;
      }

      if (command.trim() === "") {
        writePrompt();
        return;
      }

      // Parse command
      const parts = command.trim().split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      // Execute in WebContainer
      term.current.writeln("");
      const process = await webContainerInstance.spawn(cmd, args, {
        terminal: {
          cols: term.current.cols,
          rows: term.current.rows,
        },
      });

      currentProcess.current = process;

      // Capture output for error analysis
      const outputChunks: string[] = [];

      // Handle process output
      process.output.pipeTo(new WritableStream({
        write(data) {
          if (term.current) {
            term.current.write(data);
            outputChunks.push(data);
          }
        },
      }));

      // Wait for process to complete
      exitCode = await process.exit;
      currentProcess.current = null;
      commandOutput = outputChunks.join('');

      // Analyze for errors
      await analyzeCommandForErrors(command, commandOutput, exitCode);

      // Show new prompt
      writePrompt();

    } catch (error) {
      const errorMessage = `\r\nCommand not found: ${command}`;
      if (term.current) {
        term.current.writeln(errorMessage);
        writePrompt();
      }
      
      // Analyze the error
      await analyzeCommandForErrors(command, errorMessage, 127);
      
      currentProcess.current = null;
    }
  }, [webContainerInstance, writePrompt]);

  const handleTerminalInput = useCallback((data: string) => {
    if (!term.current) return;

    // Handle special characters
    switch (data) {
      case '\r': // Enter
        executeCommand(currentLine.current);
        break;
        
      case '\u007F': // Backspace
        if (cursorPosition.current > 0) {
          currentLine.current = 
            currentLine.current.slice(0, cursorPosition.current - 1) + 
            currentLine.current.slice(cursorPosition.current);
          cursorPosition.current--;
          
          // Update terminal display
          term.current.write('\b \b');
        }
        break;
        
      case '\u0003': // Ctrl+C
        if (currentProcess.current) {
          currentProcess.current.kill();
          currentProcess.current = null;
        }
        term.current.writeln("^C");
        writePrompt();
        break;
        
      case '\u001b[A': // Up arrow
        if (commandHistory.current.length > 0) {
          if (historyIndex.current === -1) {
            historyIndex.current = commandHistory.current.length - 1;
          } else if (historyIndex.current > 0) {
            historyIndex.current--;
          }
          
          // Clear current line and write history command
          const historyCommand = commandHistory.current[historyIndex.current];
          term.current.write('\r$ ' + ' '.repeat(currentLine.current.length) + '\r$ ');
          term.current.write(historyCommand);
          currentLine.current = historyCommand;
          cursorPosition.current = historyCommand.length;
        }
        break;
        
      case '\u001b[B': // Down arrow
        if (historyIndex.current !== -1) {
          if (historyIndex.current < commandHistory.current.length - 1) {
            historyIndex.current++;
            const historyCommand = commandHistory.current[historyIndex.current];
            term.current.write('\r$ ' + ' '.repeat(currentLine.current.length) + '\r$ ');
            term.current.write(historyCommand);
            currentLine.current = historyCommand;
            cursorPosition.current = historyCommand.length;
          } else {
            historyIndex.current = -1;
            term.current.write('\r$ ' + ' '.repeat(currentLine.current.length) + '\r$ ');
            currentLine.current = "";
            cursorPosition.current = 0;
          }
        }
        break;
        
      default:
        // Regular character input
        if (data >= ' ' || data === '\t') {
          currentLine.current = 
            currentLine.current.slice(0, cursorPosition.current) + 
            data + 
            currentLine.current.slice(cursorPosition.current);
          cursorPosition.current++;
          term.current.write(data);
        }
        break;
    }
  }, [executeCommand, writePrompt]);

  const initializeTerminal = useCallback(() => {
    if (!terminalRef.current || term.current) return;

    // Additional check to ensure DOM element is properly mounted
    if (!terminalRef.current.isConnected || !terminalRef.current.offsetParent) {
      // Retry after a short delay if DOM is not ready
      setTimeout(() => initializeTerminal(), 50);
      return;
    }

    try {
      const terminal = new Terminal({
        cursorBlink: true,
        fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        letterSpacing: 0,
        theme: terminalThemes[theme],
        allowTransparency: false,
        convertEol: true,
        scrollback: 1000,
        tabStopWidth: 4,
      });

      // Add addons
      const fitAddonInstance = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      const searchAddonInstance = new SearchAddon();

      terminal.loadAddon(fitAddonInstance);
      terminal.loadAddon(webLinksAddon);
      terminal.loadAddon(searchAddonInstance);

      // Double-check terminalRef.current is still available and properly mounted
      if (terminalRef.current && terminalRef.current.isConnected) {
        try {
          terminal.open(terminalRef.current);
          
          fitAddon.current = fitAddonInstance;
          searchAddon.current = searchAddonInstance;
          term.current = terminal;

          // Handle terminal input
          terminal.onData(handleTerminalInput);

          // Initial fit with longer delay to ensure renderer is ready
          setTimeout(() => {
            try {
              if (fitAddonInstance && term.current) {
                fitAddonInstance.fit();
              }
            } catch (fitError) {
              console.warn("Fit addon error:", fitError);
            }
          }, 200);

          // Welcome message with delay to ensure terminal is ready
          setTimeout(() => {
            if (terminal) {
              terminal.writeln("🚀 WebContainer Terminal");
              terminal.writeln("Type 'help' for available commands");
              writePrompt();
            }
          }, 100);
        } catch (openError) {
          console.error("Error opening terminal:", openError);
          // Clean up on error
          terminal.dispose();
          return null;
        }
      }

      return terminal;
    } catch (error) {
      console.error("Error initializing terminal:", error);
      return null;
    }
  }, [theme, handleTerminalInput, writePrompt]);

  const connectToWebContainer = useCallback(async () => {
    if (!webContainerInstance || !term.current) return;

    try {
      setIsConnected(true);
      term.current.writeln("✅ Connected to WebContainer");
      term.current.writeln("Ready to execute commands");
      writePrompt();
    } catch (error) {
      setIsConnected(false);
      term.current.writeln("❌ Failed to connect to WebContainer");
      console.error("WebContainer connection error:", error);
    }
  }, [webContainerInstance, writePrompt]);

  // Analyser les commandes pour détecter les erreurs
  const analyzeCommandForErrors = useCallback(async (command: string, output: string, exitCode?: number) => {
    try {
      const error = await terminalErrorMonitor.analyzeTerminalOutput(
        command,
        output,
        exitCode,
        [webcontainerUrl || 'webcontainer']
      );
      
      if (error) {
        // Mettre à jour le compteur d'erreurs
        const recentErrors = terminalErrorMonitor.getRecentErrors();
        setErrorCount(recentErrors.length);
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    }
  }, [webcontainerUrl]);

  const clearTerminal = useCallback(() => {
    if (term.current) {
      term.current.clear();
      term.current.writeln("🚀 WebContainer Terminal");
      writePrompt();
    }
  }, [writePrompt]);

  // Exécuter une commande depuis le panel d'erreurs
  const executeCommandFromPanel = useCallback((command: string) => {
    if (term.current) {
      // Effacer la ligne actuelle
      currentLine.current = command;
      cursorPosition.current = command.length;
      
      // Afficher la commande dans le terminal
      term.current.write('\r$ ' + ' '.repeat(100) + '\r$ ' + command);
      
      // Exécuter la commande
      executeCommand(command);
    }
  }, [executeCommand]);

  const copyTerminalContent = useCallback(async () => {
    if (term.current) {
      const content = term.current.getSelection();
      if (content) {
        try {
          await navigator.clipboard.writeText(content);
        } catch (error) {
          console.error("Failed to copy to clipboard:", error);
        }
      }
    }
  }, []);

  const downloadTerminalLog = useCallback(() => {
    if (term.current) {
      const buffer = term.current.buffer.active;
      let content = "";
      
      for (let i = 0; i < buffer.length; i++) {
        const line = buffer.getLine(i);
        if (line) {
          content += line.translateToString(true) + "\n";
        }
      }

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `terminal-log-${new Date().toISOString().slice(0, 19)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  const searchInTerminal = useCallback((term: string) => {
    if (searchAddon.current && term) {
      searchAddon.current.findNext(term);
    }
  }, []);

  useEffect(() => {
    // Delay initialization to ensure DOM is ready
    const initTimer = setTimeout(() => {
      initializeTerminal();
    }, 100);

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddon.current) {
        setTimeout(() => {
          fitAddon.current?.fit();
        }, 100);
      }
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    // Démarrer la surveillance des erreurs
    terminalErrorMonitor.startMonitoring();

    // Écouter les nouvelles erreurs
    const handleNewError = () => {
      const recentErrors = terminalErrorMonitor.getRecentErrors();
      setErrorCount(recentErrors.length);
    };

    terminalErrorMonitor.onErrorDetected(handleNewError);

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      terminalErrorMonitor.stopMonitoring();
      if (currentProcess.current) {
        currentProcess.current.kill();
      }
      if (shellProcess.current) {
        shellProcess.current.kill();
      }
      if (term.current) {
        term.current.dispose();
        term.current = null;
      }
    };
  }, [initializeTerminal]);

  useEffect(() => {
    if (webContainerInstance && term.current && !isConnected) {
      connectToWebContainer();
    }
  }, [webContainerInstance, connectToWebContainer, isConnected]);

  return (
    <div className={cn("flex flex-col h-full bg-background border rounded-lg overflow-hidden", className)}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium">WebContainer Terminal</span>
          {isConnected && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {showSearch && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchInTerminal(e.target.value);
                }}
                className="h-6 w-32 text-xs"
              />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="h-6 w-6 p-0"
          >
            <Search className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyTerminalContent}
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadTerminalLog}
            className="h-6 w-6 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTerminal}
            className="h-6 w-6 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          
          <Button
            variant={errorCount > 0 ? "destructive" : "ghost"}
            size="sm"
            onClick={() => setShowErrorPanel(!showErrorPanel)}
            className="h-6 w-6 p-0 relative"
          >
            <AlertTriangle className="h-3 w-3" />
            {errorCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {errorCount > 9 ? '9+' : errorCount}
              </span>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => terminalErrorMonitor.startMonitoring()}
            title="Activer la surveillance IA des erreurs"
            className="h-6 w-6 p-0"
          >
            <Zap className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 relative">
        <div 
          ref={terminalRef} 
          className="absolute inset-0 p-2"
          style={{ 
            background: terminalThemes[theme].background,
          }}
        />
      </div>

      {/* Panel d'erreurs */}
      <TerminalErrorPanel
        isVisible={showErrorPanel}
        onClose={() => setShowErrorPanel(false)}
        onExecuteCommand={executeCommandFromPanel}
      />

      {/* Notifications d'erreurs critiques */}
      <TerminalErrorNotifications
        maxNotifications={3}
        autoHideDelay={15000}
        onFixError={executeCommandFromPanel}
      />
    </div>
  );
});

TerminalComponent.displayName = "TerminalComponent";

export default TerminalComponent;
