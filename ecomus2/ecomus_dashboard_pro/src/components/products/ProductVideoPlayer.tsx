'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw,
  Clock
} from 'lucide-react';

interface ProductVideo {
  url: string;
  type: 'upload' | 'youtube' | 'vimeo';
  thumbnail?: string;
  duration?: number;
  title?: string;
  description?: string;
}

interface ProductVideoPlayerProps {
  videos: ProductVideo[];
  className?: string;
}

const VIDEO_TYPE_LABELS = {
  upload: 'Vidéo uploadée',
  youtube: 'YouTube',
  vimeo: 'Vimeo'
};

const VIDEO_TYPE_COLORS = {
  upload: 'bg-purple-500',
  youtube: 'bg-red-500',
  vimeo: 'bg-blue-500'
};

export default function ProductVideoPlayer({ videos, className = '' }: ProductVideoPlayerProps) {
  const [selectedVideo, setSelectedVideo] = useState<ProductVideo>(videos[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [selectedVideo]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const resetVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  if (!videos.length) {
    return null;
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Vidéos du produit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lecteur vidéo principal */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={selectedVideo.url}
              poster={selectedVideo.thumbnail}
              className="w-full aspect-video object-contain"
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Overlay avec contrôles */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
              {/* Contrôles centraux */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={togglePlay}
                  className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>
              </div>

              {/* Contrôles en bas */}
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                {/* Barre de progression */}
                <div 
                  className="w-full h-2 bg-white/30 rounded-full cursor-pointer"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-150"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                {/* Contrôles */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={resetVideo}
                      className="text-white hover:bg-white/20"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Badge du type de vidéo */}
            <div className="absolute top-4 left-4">
              <Badge 
                className={`${VIDEO_TYPE_COLORS[selectedVideo.type]} text-white`}
              >
                {VIDEO_TYPE_LABELS[selectedVideo.type]}
              </Badge>
            </div>
          </div>

          {/* Informations sur la vidéo actuelle */}
          {selectedVideo.title && (
            <div>
              <h4 className="font-medium">{selectedVideo.title}</h4>
              {selectedVideo.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedVideo.description}
                </p>
              )}
              {selectedVideo.duration && (
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Durée: {formatTime(selectedVideo.duration)}
                </div>
              )}
            </div>
          )}

          {/* Liste des vidéos (si plusieurs) */}
          {videos.length > 1 && (
            <div>
              <h4 className="font-medium mb-3">Autres vidéos:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {videos.filter(video => video !== selectedVideo).map((video, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {video.thumbnail ? (
                            <img 
                              src={video.thumbnail} 
                              alt={video.title || 'Vidéo du produit'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          {video.duration && (
                            <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                              {formatTime(video.duration)}
                            </div>
                          )}
                        </div>

                        {/* Informations */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">                            <Badge 
                              className={`${VIDEO_TYPE_COLORS[video.type]} text-white mb-1 text-xs`}
                            >
                              {VIDEO_TYPE_LABELS[video.type]}
                            </Badge>
                          </div>
                          {video.title && (
                            <p className="font-medium text-sm truncate">{video.title}</p>
                          )}
                          {video.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
