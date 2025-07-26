import { toast } from 'sonner';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  size?: number;
}

export class MediaUploadService {
  private static instance: MediaUploadService;
  private uploadEndpoint = '/api/upload';

  public static getInstance(): MediaUploadService {
    if (!MediaUploadService.instance) {
      MediaUploadService.instance = new MediaUploadService();
    }
    return MediaUploadService.instance;
  }

  /**
   * Upload a single file to the server
   */
  async uploadFile(file: File, type: 'image' | '3d' | 'video' = 'image'): Promise<UploadResult> {
    try {
      // Validate file size
      const maxSizes = {
        image: 10 * 1024 * 1024, // 10MB
        '3d': 50 * 1024 * 1024,   // 50MB for 3D models
        video: 100 * 1024 * 1024  // 100MB for videos
      };

      if (file.size > maxSizes[type]) {
        return {
          success: false,
          error: `File too large. Maximum size for ${type} is ${maxSizes[type] / (1024 * 1024)}MB`
        };
      }

      // Validate file type
      const allowedTypes = {
        image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        '3d': ['model/gltf+json', 'model/gltf-binary', 'application/octet-stream'],
        video: ['video/mp4', 'video/webm', 'video/ogg']
      };

      const isValidType = allowedTypes[type].includes(file.type) || 
        (type === '3d' && (file.name.endsWith('.gltf') || file.name.endsWith('.glb') || file.name.endsWith('.obj')));

      if (!isValidType) {
        return {
          success: false,
          error: `Invalid file type for ${type}`
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('category', 'products');

      const response = await fetch(this.uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      return {
        success: true,
        url: result.data.url,
        size: file.size
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload multiple files (for 360° sequences)
   */
  async uploadFiles(files: File[], type: 'image' | '3d' | 'video' = 'image'): Promise<UploadResult[]> {
    const uploadPromises = Array.from(files).map(file => this.uploadFile(file, type));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload 360° image sequence
   */
  async upload360Images(files: File[]): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
    try {
      const results = await this.uploadFiles(files, 'image');
      
      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);

      if (failedUploads.length > 0) {
        console.warn('Some uploads failed:', failedUploads);
      }

      return {
        success: successfulUploads.length > 0,
        urls: successfulUploads.map(r => r.url!),
        errors: failedUploads.map(r => r.error!)
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Upload failed']
      };
    }
  }

  /**
   * Upload 3D model with textures
   */
  async upload3DModel(modelFile: File, textureFiles: File[] = []): Promise<{
    success: boolean;
    modelUrl?: string;
    textureUrls?: string[];
    errors?: string[];
  }> {
    try {
      // Upload model file
      const modelResult = await this.uploadFile(modelFile, '3d');
      
      if (!modelResult.success) {
        return {
          success: false,
          errors: [modelResult.error!]
        };
      }

      // Upload texture files
      let textureUrls: string[] = [];
      let errors: string[] = [];

      if (textureFiles.length > 0) {
        const textureResults = await this.uploadFiles(textureFiles, 'image');
        
        textureUrls = textureResults
          .filter(r => r.success)
          .map(r => r.url!);
          
        errors = textureResults
          .filter(r => !r.success)
          .map(r => r.error!);
      }

      return {
        success: true,
        modelUrl: modelResult.url,
        textureUrls,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Upload failed']
      };
    }
  }

  /**
   * Generate thumbnail for video
   */
  async generateVideoThumbnail(videoFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = Math.min(2, video.duration / 4); // Get frame at 25% or 2s
      });

      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnailDataUrl);
        } else {
          reject(new Error('Could not generate thumbnail'));
        }
      });

      video.addEventListener('error', () => {
        reject(new Error('Error loading video for thumbnail generation'));
      });

      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      video.playsInline = true;
    });
  }

  /**
   * Clean up temporary URLs
   */
  cleanupTempUrls(urls: string[]) {
    urls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }
}

export const mediaUploadService = MediaUploadService.getInstance();
