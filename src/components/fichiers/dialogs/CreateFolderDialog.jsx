import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const CreateFolderDialog = ({ isOpen, setIsOpen, parentId, ownerId, onSuccess }) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast({ variant: 'destructive', title: 'Nom invalide', description: 'Le nom du dossier ne peut pas être vide.' });
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('folders').insert({
      name: folderName.trim(),
      parent_id: parentId,
      owner_id: ownerId,
    });

    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
      toast({ title: 'Succès', description: `Dossier "${folderName}" créé.` });
      setFolderName('');
      onSuccess();
      setIsOpen(false);
    }
  };
  
  const handleOpenChange = (open) => {
    if (!open) {
      setFolderName('');
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau dossier</DialogTitle>
          <DialogDescription>
            Entrez le nom du nouveau dossier que vous souhaitez créer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Nom du dossier"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateFolder} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;