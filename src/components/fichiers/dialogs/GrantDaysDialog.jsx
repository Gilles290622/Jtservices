import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const GrantDaysDialog = ({ open, onOpenChange, user, onSuccess }) => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGrantDays = async () => {
    if (!user || !days || days <= 0) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez entrer un nombre de jours valide.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.rpc('grant_free_days', {
      user_id_in: user.id,
      days_to_add_in: parseInt(days, 10),
    });
    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `Impossible d'accorder les jours : ${error.message}` });
    } else {
      toast({ title: 'Succès', description: `${days} jours ont été ajoutés au compte de ${user.full_name}.` });
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accorder des jours gratuits</DialogTitle>
          <DialogDescription>
            Ajoutez des jours d'abonnement au compte de <span className="font-bold">{user?.full_name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="days">Nombre de jours à ajouter</Label>
          <Input
            id="days"
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="Ex: 30"
            min="1"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleGrantDays} disabled={loading}>
            {loading ? 'En cours...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GrantDaysDialog;