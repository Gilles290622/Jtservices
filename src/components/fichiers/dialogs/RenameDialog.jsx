import React, { useState, useEffect } from 'react';
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

const RenameDialog = ({ isOpen, onOpenChange, item, onSuccess }) => {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setNewName(item.name);
    }
  }, [item]);

  const handleRename = async () => {
    if (!newName.trim()) {
      toast({ variant: 'destructive', title: 'Nom invalide', description: "Le nom ne peut pas être vide." });
      return;
    }
    if (!item) return;

    setLoading(true);
    const table = item.mime_type === undefined ? 'folders' : 'files';
    
    const { error } = await supabase
      .from(table)
      .update({ name: newName.trim() })
      .eq('id', item.id);

    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
      toast({ title: 'Succès', description: 'Le nom a été mis à jour.' });
      onSuccess();
      onOpenChange(null);
    }
  };
  
  const handleDialogChange = (open) => {
    if (!open) {
      setNewName('');
      onOpenChange(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renommer</DialogTitle>
          <DialogDescription>
            Entrez le nouveau nom pour "{item?.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(null)}>Annuler</Button>
          <Button onClick={handleRename} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Renommage...' : 'Renommer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog;