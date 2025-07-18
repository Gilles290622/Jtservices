import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const SelectionBar = ({ selectedItems, onRename, onMove, onDownload, onShare, onDeleteComplete, onClearSelection }) => {
  const { toast } = useToast();

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const folderIdsToDelete = selectedItems.filter(item => item.mime_type === undefined).map(item => item.id);
    const fileIdsToDelete = selectedItems.filter(item => item.mime_type !== undefined).map(item => item.id);
    
    let errorOccurred = false;

    if (fileIdsToDelete.length > 0) {
        const { error: filesError } = await supabase.from('files').delete().in('id', fileIdsToDelete);
        if (filesError) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer certains fichiers.' });
            errorOccurred = true;
        }
    }

    if (folderIdsToDelete.length > 0) {
        const { error: foldersError } = await supabase.from('folders').delete().in('id', folderIdsToDelete);
        if (foldersError) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer certains dossiers.' });
            errorOccurred = true;
        }
    }
    
    if (!errorOccurred) {
        toast({ title: 'Succès', description: 'Éléments supprimés.' });
    }
    
    onClearSelection();
    onDeleteComplete();
  };
  
  const handleBulkDownload = () => {
    if (selectedItems.length !== 1 || selectedItems[0].mime_type === undefined) {
      toast({ variant: 'destructive', title: 'Sélection invalide', description: "Veuillez sélectionner un seul fichier à télécharger." });
      return;
    }
    onDownload(selectedItems[0]);
  };
  
  const handleBulkShare = () => {
    if (selectedItems.length !== 1 || selectedItems[0].mime_type === undefined) {
      toast({ variant: 'destructive', title: 'Sélection invalide', description: "Veuillez sélectionner un seul fichier à partager." });
      return;
    }
    onShare(selectedItems[0]);
  }

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="flex-shrink-0 p-2 border-b bg-blue-50 flex flex-col sm:flex-row justify-between items-center gap-2"
    >
        <p className="text-sm font-medium text-blue-800">{selectedItems.length} élément(s) sélectionné(s)</p>
        <div className="flex gap-2">
            <Button onClick={onRename} size="sm" variant="ghost" disabled={selectedItems.length !== 1}>Renommer</Button>
            <Button onClick={onMove} size="sm" variant="ghost">Déplacer</Button>
            <Button onClick={handleBulkDownload} size="sm" variant="ghost" disabled={selectedItems.length !== 1 || selectedItems[0].mime_type === undefined}>Télécharger</Button>
            <Button onClick={handleBulkShare} size="sm" variant="ghost" disabled={selectedItems.length !== 1 || selectedItems[0].mime_type === undefined}>Partager</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive-ghost">Supprimer</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible et supprimera définitivement les éléments sélectionnés.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={onClearSelection} size="sm" variant="ghost">Annuler</Button>
        </div>
    </motion.div>
  );
};

export default SelectionBar;