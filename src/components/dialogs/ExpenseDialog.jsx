import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ExpenseDialog = ({ open, onOpenChange, onSave, editingExpense }) => {
  const [formData, setFormData] = useState({ description: '', category: '', amount: '' });

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        description: editingExpense.description,
        category: editingExpense.category,
        amount: editingExpense.amount
      });
    } else {
      setFormData({ description: '', category: '', amount: '' });
    }
  }, [editingExpense, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, amount: parseFloat(formData.amount) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}</DialogTitle>
          <DialogDescription>
            {editingExpense ? "Modifiez les informations de la dépense ci-dessous." : "Remplissez les informations pour ajouter une nouvelle dépense."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Input id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="amount">Montant (F CFA)</Label>
            <Input id="amount" type="number" step="1" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit">{editingExpense ? 'Modifier' : 'Ajouter'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;