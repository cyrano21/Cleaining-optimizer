import { useState, useRef, useCallback, useEffect } from 'react'
import type { PreviewError, DevicePreset } from '../types/visual-editor.types'

interface UseLivePreviewOptions {
  autoRefresh?: boolean
  refreshDelay?: number
  enableHotReload?: boolean
  showErrors?: boolean
  onError?: (error: PreviewError) => void
  onLoad?: () => void
}

const DEFAULT_OPTIONS: UseLivePreviewOptions = {
  autoRefresh: true,
  refreshDelay: 1000,
  enableHotReload: true,
  showErrors: true
}

export function useLivePreview(options: UseLivePreviewOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<PreviewError | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [lastCode, setLastCode] = useState<string>('')
  
  const previewRef = useRef<HTMLIFrameElement>(null)
  const refreshTimer = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  
  // Initialize WebSocket for hot reload
  useEffect(() => {
    if (opts.enableHotReload) {
      connectWebSocket()
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current)
      }
    }
  }, [opts.enableHotReload])
  
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/preview/ws`
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      
      ws.onopen = () => {
        console.log('🔌 Preview WebSocket connected')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'reload':
              refreshPreview()
              break
            case 'error':
              setPreviewError({
                message: data.message,
                type: data.errorType || 'runtime',
                line: data.line,
                column: data.column,
                stack: data.stack
              })
              break
            case 'success':
              setPreviewError(null)
              break
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      ws.onerror = (error) => {
        console.error('Preview WebSocket error:', error)
      }
      
      ws.onclose = () => {
        console.log('🔌 Preview WebSocket disconnected')
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (opts.enableHotReload) {
            connectWebSocket()
          }
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to connect to preview WebSocket:', error)
    }
  }, [opts.enableHotReload])
  
  const generatePreviewHTML = useCallback((code: string, deviceSize?: DevicePreset) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background-color: #f9fafb;
    }
    .preview-container {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      min-height: calc(100vh - 32px);
    }
    .error-container {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      color: #dc2626;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 14px;
    }
    .error-title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    ${deviceSize ? `
    .preview-container {
      max-width: ${deviceSize.width}px;
      margin: 0 auto;
    }
    ` : ''}
  </style>
</head>
<body>
  <div id="root">
    <div class="preview-container">
      <div id="preview-content"></div>
    </div>
  </div>
  
  <script type="text/babel">
    const { useState, useEffect, createElement } = React;
    
    function PreviewApp() {
      const [error, setError] = useState(null);
      
      useEffect(() => {
        try {
          // Clear previous error
          setError(null);
          
          // Execute the generated code
          ${code}
          
          // If we get here, the code executed successfully
          if (window.parent) {
            window.parent.postMessage({ type: 'preview-success' }, '*');
          }
        } catch (err) {
          console.error('Preview error:', err);
          setError(err.message);
          
          if (window.parent) {
            window.parent.postMessage({ 
              type: 'preview-error', 
              error: err.message,
              stack: err.stack 
            }, '*');
          }
        }
      }, []);
      
      if (error) {
        return React.createElement('div', { className: 'error-container' }, [
          React.createElement('div', { className: 'error-title', key: 'title' }, 'Preview Error:'),
          React.createElement('div', { key: 'message' }, error)
        ]);
      }
      
      return React.createElement('div', { id: 'generated-content' });
    }
    
    ReactDOM.render(React.createElement(PreviewApp), document.getElementById('preview-content'));
  </script>
  
  <script>
    // Listen for hot reload messages
    if (window.parent) {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'hot-reload') {
          window.location.reload();
        }
      });
    }
    
    // Error handling
    window.addEventListener('error', (event) => {
      if (window.parent) {
        window.parent.postMessage({
          type: 'preview-error',
          error: event.message,
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack
        }, '*');
      }
    });
    
    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      if (window.parent) {
        window.parent.postMessage({
          type: 'preview-error',
          error: event.reason?.message || 'Unhandled promise rejection',
          stack: event.reason?.stack
        }, '*');
      }
    });
  </script>
</body>
</html>
    `
    
    return html
  }, [])
  
  const createPreviewBlob = useCallback((html: string) => {
    const blob = new Blob([html], { type: 'text/html' })
    return URL.createObjectURL(blob)
  }, [])
  
  const refreshPreview = useCallback(() => {
    if (!previewRef.current) return
    
    setIsPreviewLoading(true)
    setPreviewError(null)
    
    // Force iframe reload
    const iframe = previewRef.current
    const currentSrc = iframe.src
    iframe.src = 'about:blank'
    
    setTimeout(() => {
      iframe.src = currentSrc
    }, 50)
  }, [])
  
  const syncWithCode = useCallback((code: string, deviceSize?: DevicePreset) => {
    if (code === lastCode) return
    
    setLastCode(code)
    
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current)
    }
    
    if (opts.autoRefresh) {
      refreshTimer.current = setTimeout(() => {
        updatePreview(code, deviceSize)
      }, opts.refreshDelay)
    }
  }, [lastCode, opts.autoRefresh, opts.refreshDelay])
  
  const updatePreview = useCallback((code: string, deviceSize?: DevicePreset) => {
    try {
      setIsPreviewLoading(true)
      setPreviewError(null)
      
      const html = generatePreviewHTML(code, deviceSize)
      const blobUrl = createPreviewBlob(html)
      
      // Clean up previous blob URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      
      setPreviewUrl(blobUrl)
      
      if (previewRef.current) {
        previewRef.current.src = blobUrl
      }
    } catch (error) {
      const previewError: PreviewError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'build',
        stack: error instanceof Error ? error.stack : undefined
      }
      
      setPreviewError(previewError)
      opts.onError?.(previewError)
    }
  }, [generatePreviewHTML, createPreviewBlob, previewUrl, opts])
  
  const handleIframeLoad = useCallback(() => {
    setIsPreviewLoading(false)
    opts.onLoad?.()
  }, [opts])
  
  const handleIframeError = useCallback(() => {
    setIsPreviewLoading(false)
    const error: PreviewError = {
      message: 'Failed to load preview',
      type: 'runtime'
    }
    setPreviewError(error)
    opts.onError?.(error)
  }, [opts])
  
  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'preview-error') {
        const error: PreviewError = {
          message: event.data.error,
          type: 'runtime',
          line: event.data.line,
          column: event.data.column,
          stack: event.data.stack
        }
        setPreviewError(error)
        opts.onError?.(error)
      } else if (event.data.type === 'preview-success') {
        setPreviewError(null)
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [opts])
  
  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])
  
  const sendHotReload = useCallback(() => {
    if (previewRef.current?.contentWindow) {
      previewRef.current.contentWindow.postMessage({ type: 'hot-reload' }, '*')
    }
  }, [])
  
  const getPreviewMetrics = useCallback(() => {
    return {
      isLoading: isPreviewLoading,
      hasError: !!previewError,
      lastUpdate: lastCode ? Date.now() : null,
      previewUrl
    }
  }, [isPreviewLoading, previewError, lastCode, previewUrl])
  
  return {
    // Refs
    previewRef,
    
    // State
    isPreviewLoading,
    previewError,
    previewUrl,
    
    // Actions
    refreshPreview,
    syncWithCode,
    updatePreview,
    sendHotReload,
    
    // Event handlers
    handleIframeLoad,
    handleIframeError,
    
    // Utilities
    getPreviewMetrics
  }
}

export default useLivePreview