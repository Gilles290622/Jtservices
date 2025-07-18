import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ReactPlayer from 'react-player/lazy';
import { Loader2 } from 'lucide-react';

const VideoPlayerDialog = ({ isOpen, setIsOpen, video }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-black border-gray-800 text-white sm:max-w-4xl p-0">
        <div className="aspect-video w-full bg-gray-900">
          {isClient && video.video_url ? (
            <ReactPlayer
              url={video.video_url}
              width="100%"
              height="100%"
              playing={true}
              controls={true}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload'
                  }
                }
              }}
              light={video.thumbnail_url || false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col text-center">
              <Loader2 className="h-10 w-10 text-red-500 animate-spin mb-4" />
              <p className="text-gray-300">
                {video.video_url ? "Chargement de la vidéo..." : "URL de la vidéo non disponible."}
              </p>
            </div>
          )}
        </div>
        <DialogHeader className="p-6 pt-4">
          <DialogTitle className="text-2xl font-bold">{video.title}</DialogTitle>
          <DialogDescription className="text-gray-400 pt-2">
            {video.description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerDialog;