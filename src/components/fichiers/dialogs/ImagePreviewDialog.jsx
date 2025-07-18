import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ImagePreviewDialog = ({ isOpen, setIsOpen, imageUrl, imageName }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl w-full p-2 sm:p-4 bg-transparent border-none shadow-none flex items-center justify-center">
        <div className="relative">
          <DialogHeader className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent rounded-t-lg">
            <DialogTitle className="truncate text-white text-shadow">{imageName}</DialogTitle>
          </DialogHeader>
          <img 
            src={imageUrl} 
            alt={imageName} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;