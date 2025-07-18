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

const EditPaymentDialog = ({ open, onOpenChange, onSave, payment }) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount.toString());
    }
  }, [payment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (!isNaN(paymentAmount) && paymentAmount > 0) {
      onSave({ paymentId: payment.id, amount: paymentAmount });
    }
  };
  
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le paiement</DialogTitle>
          <DialogDescription>
            Modification du paiement pour la facture n° {payment.sales?.invoice_number}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="amount">Nouveau montant du paiement (F CFA)</Label>
            <Input 
              id="amount" 
              type="number" 
              step="1" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentDialog;