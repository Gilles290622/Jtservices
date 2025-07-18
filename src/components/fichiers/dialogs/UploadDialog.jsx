import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, UploadCloud, File, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize } from '@/lib/utils';

const UploadDialog = ({ isOpen, onOpenChange, currentFolder, onUploadComplete, storageUsage }) => {
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFilesToUpload(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const removeFile = (fileToRemove) => {
    setFilesToUpload(prev => prev.filter(file => file.path !== fileToRemove.path));
  };
  
  const totalSize = useMemo(() => filesToUpload.reduce((acc, file) => acc + file.size, 0), [filesToUpload]);

  const handleUpload = async () => {
    if (filesToUpload.length === 0) return;

    if (storageUsage.used + totalSize > storageUsage.total) {
      toast({
          variant: "destructive",
          title: "Espace de stockage insuffisant",
          description: `Vous ne pouvez pas téléverser ces fichiers. Votre quota de ${formatFileSize(storageUsage.total)} sera dépassé.`,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress({});

    for (const file of filesToUpload) {
      const fileId = crypto.randomUUID();
      const filePath = `${currentFolder.owner_id}/${fileId}`;
      
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('jts-fichiers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onProgress: (event) => {
            if (event.lengthComputable) {
              const percentage = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(prev => ({ ...prev, [file.path]: percentage }));
            }
          }
        });

      if (uploadError) {
        toast({ variant: 'destructive', title: `Erreur de téléversement pour ${file.name}`, description: uploadError.message });
        setUploadProgress(prev => ({ ...prev, [file.path]: 'error' }));
        continue; 
      }

      const { error: dbError } = await supabase.from('files').insert({
        id: fileId,
        name: file.name,
        folder_id: currentFolder.id,
        owner_id: currentFolder.owner_id,
        mime_type: file.type,
        size: file.size,
      });

      if (dbError) {
        toast({ variant: 'destructive', title: 'Erreur base de données', description: `Impossible de sauvegarder les informations pour ${file.name}` });
        setUploadProgress(prev => ({ ...prev, [file.path]: 'error' }));
        await supabase.storage.from('jts-fichiers').remove([filePath]);
      }
    }

    setIsUploading(false);
    toast({ title: 'Succès', description: 'Tous les fichiers ont été téléversés.' });
    setFilesToUpload([]);
    onUploadComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isUploading) onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Téléverser des fichiers</DialogTitle>
        </DialogHeader>
        
        <div {...getRootProps()} className={`mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`}>
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-2 text-slate-500">Glissez-déposez des fichiers ici, ou cliquez pour sélectionner</p>
        </div>

        {filesToUpload.length > 0 && (
          <div className="mt-4 max-h-60 overflow-y-auto pr-2 space-y-2">
            <AnimatePresence>
              {filesToUpload.map(file => (
                <motion.div 
                  key={file.path} 
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <File className="h-6 w-6 text-slate-500 flex-shrink-0" />
                    <div className="flex-grow overflow-hidden">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadProgress[file.path] !== undefined && (
                       <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                           <div 
                                className={`h-full ${uploadProgress[file.path] === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} 
                                style={{ width: `${uploadProgress[file.path] === 'error' ? 100 : uploadProgress[file.path]}%` }}
                            />
                       </div>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFile(file)} disabled={isUploading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <DialogFooter className="mt-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-slate-500">
                {filesToUpload.length} fichier(s) | Total: {formatFileSize(totalSize)}
            </div>
            <div>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isUploading}>Annuler</Button>
              <Button onClick={handleUpload} disabled={isUploading || filesToUpload.length === 0}>
                {isUploading ? 'Téléversement...' : 'Téléverser'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;