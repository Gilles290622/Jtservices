import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import GridView from './browser/GridView';
import ListView from './browser/ListView';
import CreateFolderDialog from './dialogs/CreateFolderDialog';
import RenameDialog from './dialogs/RenameDialog';
import UploadDialog from './dialogs/UploadDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import MediaPlayerDialog from './dialogs/MediaPlayerDialog';
import TextPreviewDialog from './dialogs/TextPreviewDialog';
import ImagePreviewDialog from './dialogs/ImagePreviewDialog';
import OfficePreviewDialog from './dialogs/OfficePreviewDialog';
import MoveItemsDialog from './dialogs/MoveItemsDialog';
import BrowserHeader from './browser/BrowserHeader';
import SelectionBar from './browser/SelectionBar';
import { useFileBrowserState } from '@/hooks/useFileBrowserState';
import ShareDialog from './dialogs/ShareDialog';

const FileBrowser = ({
  currentFolder,
  folders,
  files,
  path,
  loading,
  onNavigate,
  onBreadcrumbClick,
  onUploadComplete,
  onDeleteComplete,
  onRenameComplete,
  onCreateFolderComplete,
  storageUsage,
  userId,
  userProfile,
}) => {
  const { toast } = useToast();
  const state = useFileBrowserState();
  const [itemToShare, setItemToShare] = useState(null);
  
  const {
    searchTerm, view, selectedItems,
    handleSelectionChange, clearSelection,
    itemToRename, setItemToRename,
    itemToDelete, setItemToDelete,
    fileToPreview, setFileToPreview,
    isMoveItemsOpen, setMoveItemsOpen,
    isCreateFolderOpen, setCreateFolderOpen,
    isUploadDialogOpen, setUploadDialogOpen,
  } = state;

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSingleItemDownload = async (file) => {
    if (file.mime_type === undefined) return;
    const { data, error } = await supabase.storage
      .from('jts-fichiers')
      .download(`${file.owner_id}/${file.id}`);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur de téléchargement', description: error.message });
      return;
    }
    const blob = new Blob([data], { type: file.mime_type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleOpenFile = async (file) => {
    const textLikeMimes = ['application/json', 'application/javascript', 'text/javascript', 'application/sql', 'application/x-httpd-php', 'application/xml', 'text/php', 'text/html'];
    const officeMimes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    
    const isTextPreviewable = file.mime_type.startsWith('text/') || textLikeMimes.includes(file.mime_type);
    const isOfficePreviewable = officeMimes.includes(file.mime_type);
    const isImagePreviewable = file.mime_type.startsWith('image/');
    const isMediaPreviewable = file.mime_type.startsWith('video/') || file.mime_type.startsWith('audio/');
    const isPdfPreviewable = file.mime_type === 'application/pdf';

    if (isTextPreviewable || isImagePreviewable || isMediaPreviewable || isPdfPreviewable || isOfficePreviewable) {
        const urlDuration = 60; 
        const { data, error } = await supabase.storage
            .from('jts-fichiers')
            .createSignedUrl(`${file.owner_id}/${file.id}`, urlDuration);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'obtenir le lien du fichier.' });
            return;
        }

        if (isPdfPreviewable) {
            window.open(data.signedUrl, '_blank');
        } else if (isOfficePreviewable) {
            const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(data.signedUrl)}`;
            setFileToPreview({ ...file, url: viewerUrl, type: 'office' });
        } else {
            const previewType = isImagePreviewable ? 'image' : isMediaPreviewable ? 'media' : 'text';
            setFileToPreview({ ...file, url: data.signedUrl, type: previewType });
        }
    } else {
        toast({
            title: "Aperçu non disponible",
            description: `Le téléchargement de "${file.name}" va commencer.`,
        });
        await handleSingleItemDownload(file);
    }
  };

  const handleSingleItemShare = (file) => {
    if (file.mime_type === undefined) return;
    setItemToShare(file);
  };

  const confirmSingleDelete = async () => {
    if (!itemToDelete) return;

    const isFolder = itemToDelete.mime_type === undefined;
    const fromTable = isFolder ? 'folders' : 'files';

    const { error } = await supabase.from(fromTable).delete().eq('id', itemToDelete.id);

    if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: `Impossible de supprimer ${itemToDelete.name}.` });
    } else {
        toast({ title: 'Succès', description: `${itemToDelete.name} a été supprimé.` });
        onDeleteComplete();
    }
    setItemToDelete(null);
  };
  
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploadDialogOpen(true);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true, noKeyboard: true });

  return (
    <div {...getRootProps()} className={`flex flex-col h-full w-full relative ${isDragActive ? 'outline-dashed outline-2 outline-blue-500 bg-blue-50' : ''}`}>
      <input {...getInputProps()} />
      
      {isDragActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-500 bg-opacity-20 pointer-events-none">
          <div className="text-center text-blue-800 font-bold">
            <Upload size={48} className="mx-auto mb-2" />
            <p>Déposez les fichiers ici</p>
          </div>
        </div>
      )}
      
      <BrowserHeader
        path={path}
        onBreadcrumbClick={onBreadcrumbClick}
        searchTerm={searchTerm}
        onSearchTermChange={state.setSearchTerm}
        view={view}
        onViewChange={state.setView}
        onCreateFolder={() => setCreateFolderOpen(true)}
        onUpload={() => setUploadDialogOpen(true)}
      />
      
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <SelectionBar 
            selectedItems={selectedItems}
            onRename={() => setItemToRename(selectedItems[0])}
            onMove={() => setMoveItemsOpen(true)}
            onDownload={handleSingleItemDownload}
            onShare={handleSingleItemShare}
            onDeleteComplete={onDeleteComplete}
            onClearSelection={clearSelection}
          />
        )}
      </AnimatePresence>

      <main className="flex-grow p-4 overflow-auto">
        <AnimatePresence>
          {loading ? (
            <motion.div key="loader" className="flex items-center justify-center h-full text-slate-500">
              Chargement...
            </motion.div>
          ) : view === 'grid' ? (
            <GridView
              folders={filteredFolders}
              files={filteredFiles}
              onNavigate={onNavigate}
              selectedItems={selectedItems}
              onSelectionChange={handleSelectionChange}
              handleOpenFile={handleOpenFile}
              handleDownload={handleSingleItemDownload}
              handleShare={handleSingleItemShare}
              handleRename={setItemToRename}
              handleDelete={setItemToDelete}
            />
          ) : (
            <ListView
              folders={filteredFolders}
              files={filteredFiles}
              onNavigate={onNavigate}
              selectedItems={selectedItems}
              onSelectionChange={handleSelectionChange}
              handleOpenFile={handleOpenFile}
              handleDownload={handleSingleItemDownload}
              handleShare={handleSingleItemShare}
              handleRename={setItemToRename}
              handleDelete={setItemToDelete}
            />
          )}
        </AnimatePresence>
      </main>

      {isCreateFolderOpen && (
        <CreateFolderDialog
          isOpen={isCreateFolderOpen}
          setIsOpen={setCreateFolderOpen}
          parentId={currentFolder.id}
          ownerId={userId}
          onSuccess={onCreateFolderComplete}
        />
      )}
      
      {itemToRename && (
        <RenameDialog
          isOpen={!!itemToRename}
          onOpenChange={setItemToRename}
          item={itemToRename}
          onSuccess={() => {
            const isFolder = itemToRename.mime_type === undefined;
            onRenameComplete(isFolder);
            clearSelection();
          }}
        />
      )}
      
      {isUploadDialogOpen && (
        <UploadDialog
          isOpen={isUploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          currentFolder={currentFolder}
          onUploadComplete={() => {
            onUploadComplete();
            clearSelection();
          }}
          storageUsage={storageUsage}
        />
      )}
      
      {fileToPreview && fileToPreview.type === 'image' && (
          <ImagePreviewDialog
            isOpen={!!fileToPreview}
            setIsOpen={() => setFileToPreview(null)}
            imageUrl={fileToPreview.url}
            imageName={fileToPreview.name}
          />
      )}

      {fileToPreview && fileToPreview.type === 'media' && (
          <MediaPlayerDialog 
              isOpen={!!fileToPreview}
              setIsOpen={() => setFileToPreview(null)}
              fileUrl={fileToPreview.url}
              mimeType={fileToPreview.mime_type}
              fileName={fileToPreview.name}
          />
      )}

      {fileToPreview && fileToPreview.type === 'text' && (
          <TextPreviewDialog 
              isOpen={!!fileToPreview}
              setIsOpen={() => setFileToPreview(null)}
              file={fileToPreview}
          />
      )}
      
      {fileToPreview && fileToPreview.type === 'office' && (
          <OfficePreviewDialog
            isOpen={!!fileToPreview}
            setIsOpen={() => setFileToPreview(null)}
            viewerUrl={fileToPreview.url}
            file={fileToPreview}
          />
      )}
      
      {isMoveItemsOpen && (
        <MoveItemsDialog
          isOpen={isMoveItemsOpen}
          setIsOpen={setMoveItemsOpen}
          itemsToMove={selectedItems}
          currentFolderId={currentFolder.id}
          ownerId={userId}
          onSuccess={() => {
            onDeleteComplete();
            clearSelection();
          }}
        />
      )}

      {itemToShare && (
        <ShareDialog
          isOpen={!!itemToShare}
          setIsOpen={() => setItemToShare(null)}
          file={itemToShare}
          userProfile={userProfile}
        />
      )}

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible et supprimera définitivement {itemToDelete?.name}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={confirmSingleDelete} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FileBrowser;