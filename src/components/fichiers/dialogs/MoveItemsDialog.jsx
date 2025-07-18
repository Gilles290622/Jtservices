import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Folder, ChevronRight, ChevronDown } from 'lucide-react';

const FolderNode = ({ node, onSelect, selectedFolderId, disabledIds, defaultOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isDisabled = disabledIds.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-2">
      <div 
        className={`flex items-center p-1 my-1 rounded-md transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'} ${selectedFolderId === node.id ? 'bg-blue-100' : ''}`}
        onClick={() => !isDisabled && onSelect(node)}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-1">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : <span className="w-8"></span>}
        <Folder size={16} className="mr-2 text-blue-500" />
        <span>{node.name}</span>
      </div>
      {isOpen && hasChildren && (
        <div className="ml-4 border-l-2 pl-2">
          {node.children.map(child => <FolderNode key={child.id} node={child} onSelect={onSelect} selectedFolderId={selectedFolderId} disabledIds={disabledIds} defaultOpen={false} />)}
        </div>
      )}
    </div>
  );
};

const MoveItemsDialog = ({ isOpen, setIsOpen, itemsToMove, currentFolderId, ownerId, onSuccess }) => {
  const [allFolders, setAllFolders] = useState([]);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const folderTree = useMemo(() => {
    if (allFolders.length === 0) return [];
    const map = {};
    const roots = [];
    allFolders.forEach(f => {
        map[f.id] = {...f, children: []};
    });
    allFolders.forEach(f => {
        if (f.parent_id && map[f.parent_id]) {
            map[f.parent_id].children.push(map[f.id]);
        } else {
            roots.push(map[f.id]);
        }
    });
    return roots;
  }, [allFolders]);
  
  useEffect(() => {
    if (!isOpen || !ownerId) return;

    const fetchAllFolders = async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('id, name, parent_id')
        .eq('owner_id', ownerId);

      if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger la liste des dossiers." });
      } else {
        setAllFolders(data);
      }
    };

    fetchAllFolders();
  }, [isOpen, ownerId, toast]);

  const handleConfirmMove = async () => {
    if (!destination) {
      toast({ variant: 'destructive', title: 'Aucune destination', description: 'Veuillez sélectionner un dossier de destination.' });
      return;
    }
    setLoading(true);

    const filesToUpdate = itemsToMove.filter(item => item.mime_type !== undefined);
    const foldersToUpdate = itemsToMove.filter(item => item.mime_type === undefined);

    const updates = [];
    if(filesToUpdate.length > 0) {
        updates.push(supabase.from('files').update({ folder_id: destination.id }).in('id', filesToUpdate.map(f => f.id)));
    }
    if(foldersToUpdate.length > 0) {
        updates.push(supabase.from('folders').update({ parent_id: destination.id }).in('id', foldersToUpdate.map(f => f.id)));
    }

    const results = await Promise.all(updates);
    const errors = results.map(res => res.error).filter(Boolean);

    setLoading(false);
    if (errors.length > 0) {
      toast({ variant: 'destructive', title: 'Erreur de déplacement', description: `Certains éléments n'ont pas pu être déplacés. ${errors[0].message}` });
    } else {
      toast({ title: 'Succès', description: `${itemsToMove.length} élément(s) déplacé(s) vers "${destination.name}".` });
      onSuccess();
      setIsOpen(false);
    }
  };

  const disabledFolderIds = useMemo(() => {
    const ids = new Set();
    const foldersToMove = itemsToMove.filter(item => item.mime_type === undefined).map(item => item.id);
    
    const collectChildren = (folderId) => {
        ids.add(folderId);
        const children = allFolders.filter(f => f.parent_id === folderId);
        children.forEach(c => collectChildren(c.id));
    };

    foldersToMove.forEach(id => collectChildren(id));
    return Array.from(ids);
  }, [itemsToMove, allFolders]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Déplacer les éléments</DialogTitle>
          <DialogDescription>
            Sélectionnez le dossier de destination pour les {itemsToMove.length} élément(s) sélectionné(s).
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-80 overflow-y-auto border rounded-md">
          {folderTree.map(rootNode => (
              <FolderNode 
                key={rootNode.id} 
                node={rootNode} 
                onSelect={setDestination} 
                selectedFolderId={destination?.id} 
                disabledIds={disabledFolderIds}
                defaultOpen={true}
               />
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button onClick={handleConfirmMove} disabled={loading || !destination || destination.id === currentFolderId} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Déplacement...' : 'Déplacer ici'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveItemsDialog;