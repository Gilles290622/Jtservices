import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MediaPlayerDialog = ({ isOpen, setIsOpen, fileUrl, mimeType, fileName }) => {
  if (!isOpen || !fileUrl || !mimeType) return null;

  const isVideo = mimeType.startsWith('video/');
  const isAudio = mimeType.startsWith('audio/');

  const handleOpenChange = (open) => {
    if (!open) {
      const videoElement = document.querySelector('video');
      const audioElement = document.querySelector('audio');
      if (videoElement) videoElement.pause();
      if (audioElement) audioElement.pause();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-full bg-black border-none text-white p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="truncate">{fileName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex justify-center items-center">
          {isVideo && (
            <video controls autoPlay className="w-full max-h-[80vh] rounded-lg focus:outline-none" src={fileUrl}>
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          )}
          {isAudio && (
            <audio controls autoPlay className="w-full" src={fileUrl}>
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPlayerDialog;