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

const PaymentDialog = ({ open, onOpenChange, onSave, sale }) => {
  const [amount, setAmount] = useState('');

  const remainingAmount = sale ? sale.total - sale.amount_paid : 0;

  useEffect(() => {
    if (sale) {
      setAmount(remainingAmount.toString());
    } else {
      setAmount('');
    }
  }, [sale, remainingAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (!isNaN(paymentAmount) && paymentAmount > 0) {
      onSave({ saleId: sale.id, amount: paymentAmount });
    }
  };
  
  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
          <DialogDescription>
            Facture n° {sale.invoice_number}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="text-sm">
            <p><strong>Total de la facture:</strong> {Number(sale.total).toLocaleString('fr-FR')} F CFA</p>
            <p><strong>Déjà payé:</strong> {Number(sale.amount_paid).toLocaleString('fr-FR')} F CFA</p>
            <p className="font-bold"><strong>Reste à payer:</strong> {Number(remainingAmount).toLocaleString('fr-FR')} F CFA</p>
          </div>
          <div>
            <Label htmlFor="amount">Montant du paiement (F CFA)</Label>
            <Input 
              id="amount" 
              type="number" 
              step="1" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              max={remainingAmount}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;