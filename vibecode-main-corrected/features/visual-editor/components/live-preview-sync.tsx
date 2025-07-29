"use client";

import React, { useEffect, useRef, useState } from 'react';
import { VisualComponent } from '../types/visual-editor.types';

interface LivePreviewSyncProps {
  components: VisualComponent[];
  selectedComponent: VisualComponent | null;
  onSelectComponent: (component: VisualComponent) => void;
  zoom: number;
  className?: string;
}

export function LivePreviewSync({
  components,
  selectedComponent,
  onSelectComponent,
  zoom,
  className = ''
}: LivePreviewSyncProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate HTML content from components
  const generateHTML = () => {
    if (!components || !Array.isArray(components)) {
      return '';
    }
    
    const componentHTML = components.map(component => {
      const isSelected = selectedComponent?.id === component.id;
      const selectionClass = isSelected ? 'visual-editor-selected' : '';
      
      return `
        <div 
          id="component-${component.id}"
          class="visual-editor-component ${selectionClass}"
          data-component-id="${component.id}"
          style="
            position: absolute;
            left: ${component.position?.x || 0}px;
            top: ${component.position?.y || 0}px;
            width: ${component.size?.width || 'auto'};
            height: ${component.size?.height || 'auto'};
            z-index: 1;
            ${component.styles ? Object.entries(component.styles).map(([key, value]) => 
              `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`
            ).join(' ') : ''}
          "
        >
          ${component.template || ''}
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Live Preview</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            transform: scale(${zoom});
            transform-origin: top left;
          }
          
          .visual-editor-component {
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
          }
          
          .visual-editor-component:hover {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }
          
          .visual-editor-selected {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 2px #ef4444 !important;
          }
          
          /* Common component styles */
          .btn {
            display: inline-block;
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-size: 14px;
          }
          
          .btn:hover {
            background: #2563eb;
          }
          
          .card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
        </style>
      </head>
      <body>
        ${componentHTML}
        
        <script>
          // Handle component selection
          document.addEventListener('click', function(e) {
            const component = e.target.closest('.visual-editor-component');
            if (component) {
              e.preventDefault();
              e.stopPropagation();
              
              const componentId = component.getAttribute('data-component-id');
              if (componentId) {
                window.parent.postMessage({
                  type: 'component-selected',
                  componentId: componentId
                }, '*');
              }
            }
          });
          
          // Prevent default link behavior in preview
          document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
              e.preventDefault();
            }
          });
          
          // Notify parent that preview is ready
          window.addEventListener('load', function() {
            window.parent.postMessage({ type: 'preview-ready' }, '*');
          });
        </script>
      </body>
      </html>
    `;
  };

  // Update iframe content when components change
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(generateHTML());
        doc.close();
      }
    }
  }, [components, selectedComponent, zoom]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'component-selected') {
        const component = components.find(c => c.id === event.data.componentId);
        if (component) {
          onSelectComponent(component);
        }
      } else if (event.data.type === 'preview-ready') {
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [components, onSelectComponent]);

  return (
    <div className={`relative w-full h-full bg-white ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-gray-500">Loading preview...</div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

export default LivePreviewSync;