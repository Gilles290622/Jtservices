import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const CustomerStatementDialog = ({ open, onOpenChange, customer, statementData, loading }) => {
  if (!customer) return null;

  const calculateRunningBalance = () => {
    if (!statementData) return [];

    let runningBalance = customer.balance;
    const transactionsWithBalance = [];

    for (const tx of statementData) {
      transactionsWithBalance.push({ ...tx, balance: runningBalance });
      runningBalance = runningBalance + (tx.credit || 0) - (tx.debit || 0);
    }
    return transactionsWithBalance;
  };

  const transactions = calculateRunningBalance();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Relevé de Compte - {customer.name}</DialogTitle>
          <DialogDescription>
            Solde actuel: {Number(customer.balance).toLocaleString('fr-FR')} F CFA
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Détails</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Débit</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Crédit</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Solde</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">{new Date(tx.transaction_date).toLocaleString('fr-FR')}</td>
                    <td className="py-3 px-4">
                        <span className={`font-semibold ${tx.transaction_type === 'Vente' ? 'text-destructive' : 'text-green-600'}`}>
                            {tx.transaction_type}
                        </span>
                    </td>
                    <td className="py-3 px-4">{tx.details}</td>
                    <td className="py-3 px-4 text-right text-destructive">
                      {tx.debit > 0 ? `${Number(tx.debit).toLocaleString('fr-FR')} F CFA` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {tx.credit > 0 ? `${Number(tx.credit).toLocaleString('fr-FR')} F CFA` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      {Number(tx.balance).toLocaleString('fr-FR')} F CFA
                    </td>
                  </tr>
                ))}
                 {transactions.length === 0 && (
                    <tr>
                        <td colSpan="6" className="text-center py-8 text-muted-foreground">Aucune transaction pour ce client.</td>
                    </tr>
                 )}
              </tbody>
            </table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerStatementDialog;