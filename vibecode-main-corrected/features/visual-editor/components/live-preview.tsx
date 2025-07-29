'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  RefreshCw, 
  Smartphone, 
  Tablet, 
  Monitor, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  ExternalLink,
  Settings
} from 'lucide-react'
import { useLivePreview } from '../hooks/useLivePreview'
import type { DevicePreset, PreviewError } from '../types/visual-editor.types'

interface LivePreviewProps {
  code: string
  selectedDevice?: DevicePreset
  onDeviceChange?: (device: DevicePreset) => void
  className?: string
  showDeviceSelector?: boolean
  showRefreshButton?: boolean
  showErrorDetails?: boolean
  autoRefresh?: boolean
  refreshDelay?: number
}

const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'mobile',
    name: 'Mobile',
    width: 375,
    height: 667,
    icon: 'smartphone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 'tablet',
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: 'tablet',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 'desktop',
    name: 'Desktop',
    width: 1200,
    height: 800,
    icon: 'monitor',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
]

const DeviceIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'smartphone':
      return <Smartphone className="h-4 w-4" />
    case 'tablet':
      return <Tablet className="h-4 w-4" />
    case 'monitor':
      return <Monitor className="h-4 w-4" />
    default:
      return <Monitor className="h-4 w-4" />
  }
}

const ErrorDisplay = ({ error, showDetails }: { error: PreviewError; showDetails: boolean }) => {
  const [showStack, setShowStack] = useState(false)
  
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-red-900">Preview Error</span>
            <Badge variant="destructive" className="text-xs">
              {error.type}
            </Badge>
          </div>
          
          <p className="text-sm text-red-800 mb-2">
            {error.message}
          </p>
          
          {error.line && error.column && (
            <p className="text-xs text-red-600 mb-2">
              Line {error.line}, Column {error.column}
            </p>
          )}
          
          {showDetails && error.stack && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStack(!showStack)}
                className="text-red-700 hover:text-red-900 p-0 h-auto"
              >
                {showStack ? 'Hide' : 'Show'} Stack Trace
              </Button>
              
              {showStack && (
                <pre className="mt-2 p-3 bg-red-100 border border-red-200 rounded text-xs text-red-800 overflow-x-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Updating preview...</span>
    </div>
  </div>
)

export function LivePreview({
  code,
  selectedDevice = DEVICE_PRESETS[2], // Default to desktop
  onDeviceChange,
  className = '',
  showDeviceSelector = true,
  showRefreshButton = true,
  showErrorDetails = true,
  autoRefresh = true,
  refreshDelay = 1000
}: LivePreviewProps) {
  const {
    previewRef,
    isPreviewLoading,
    previewError,
    previewUrl,
    refreshPreview,
    syncWithCode,
    updatePreview,
    handleIframeLoad,
    handleIframeError,
    getPreviewMetrics
  } = useLivePreview({
    autoRefresh,
    refreshDelay,
    enableHotReload: true,
    showErrors: showErrorDetails
  })
  
  // Sync with code changes
  useEffect(() => {
    if (code) {
      syncWithCode(code, selectedDevice)
    }
  }, [code, selectedDevice, syncWithCode])
  
  // Initial preview generation
  useEffect(() => {
    if (code) {
      updatePreview(code, selectedDevice)
    }
  }, [])
  
  const handleDeviceChange = (device: DevicePreset) => {
    onDeviceChange?.(device)
    if (code) {
      updatePreview(code, device)
    }
  }
  
  const handleRefresh = () => {
    if (code) {
      updatePreview(code, selectedDevice)
    } else {
      refreshPreview()
    }
  }
  
  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }
  
  const metrics = getPreviewMetrics()
  
  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Live Preview</CardTitle>
            {metrics.hasError ? (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Error
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showRefreshButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isPreviewLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isPreviewLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            {previewUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={openInNewTab}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showDeviceSelector && (
          <>
            <Separator className="my-3" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Device:</span>
              {DEVICE_PRESETS.map((device) => (
                <Button
                  key={device.id}
                  variant={selectedDevice.id === device.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleDeviceChange(device)}
                  className="h-8 px-3"
                >
                  <DeviceIcon icon={device.icon} />
                  <span className="ml-2 text-xs">{device.name}</span>
                </Button>
              ))}
              
              <div className="ml-auto text-xs text-gray-500">
                {selectedDevice.width} × {selectedDevice.height}
              </div>
            </div>
          </>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 p-0 relative">
        {previewError && showErrorDetails && (
          <div className="p-4">
            <ErrorDisplay error={previewError} showDetails={showErrorDetails} />
          </div>
        )}
        
        <div className="relative h-full">
          {isPreviewLoading && <LoadingOverlay />}
          
          <div 
            className="h-full bg-gray-50 flex items-center justify-center overflow-hidden"
            style={{
              background: 'repeating-conic-gradient(#f8f9fa 0% 25%, #e9ecef 0% 50%) 50% / 20px 20px'
            }}
          >
            {previewUrl ? (
              <iframe
                ref={previewRef}
                src={previewUrl}
                className="w-full h-full border-0 bg-white shadow-lg"
                style={{
                  maxWidth: selectedDevice.width + 'px',
                  maxHeight: selectedDevice.height + 'px',
                  transform: selectedDevice.width > 1200 ? 'scale(0.8)' : 'none',
                  transformOrigin: 'top center'
                }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title="Live Preview"
              />
            ) : (
              <div className="text-center text-gray-500">
                <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No preview available</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start coding to see your changes live
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Preview Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>Device: {selectedDevice.name}</span>
              <span>Size: {selectedDevice.width}×{selectedDevice.height}</span>
              {metrics.lastUpdate && (
                <span>Updated: {new Date(metrics.lastUpdate).toLocaleTimeString()}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isPreviewLoading && (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </span>
              )}
              
              {!isPreviewLoading && !previewError && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Ready
                </span>
              )}
              
              {previewError && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  Error
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LivePreview