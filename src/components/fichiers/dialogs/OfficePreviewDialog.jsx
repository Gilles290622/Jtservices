import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OfficePreviewDialog = ({ isOpen, setIsOpen, viewerUrl, file }) => {
  const [isLoadingViewer, setIsLoadingViewer] = useState(true);

  if (!isOpen || !file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-4 bg-slate-100">
        <DialogHeader className="flex-shrink-0 p-2 bg-white rounded-t-lg shadow-sm">
          <DialogTitle className="truncate">{file.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow w-full h-full relative bg-white rounded-b-lg p-0 sm:p-4 overflow-hidden">
            {isLoadingViewer && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            )}
            <iframe
              src={viewerUrl}
              className={`w-full h-full border-none transition-opacity duration-500 ${isLoadingViewer ? 'opacity-0' : 'opacity-100'}`}
              title={file.name}
              frameBorder="0"
              onLoad={() => setIsLoadingViewer(false)}
            ></iframe>
        </div>
         <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OfficePreviewDialog;