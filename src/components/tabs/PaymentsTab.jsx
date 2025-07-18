import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const PaymentsTab = ({ payments, onEditPayment, onDeletePayment }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardHeader>
          <CardTitle>Historique des Paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Facture N°</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Montant</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="py-3 px-4">{new Date(payment.created_at).toLocaleString('fr-FR')}</td>
                    <td className="py-3 px-4">{payment.customers?.name || 'N/A'}</td>
                    <td className="py-3 px-4">{payment.sales?.invoice_number || 'N/A'}</td>
                    <td className="py-3 px-4 text-right font-medium">{Number(payment.amount).toLocaleString('fr-FR')} F CFA</td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="icon" onClick={() => onEditPayment(payment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDeletePayment(payment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Aucun paiement enregistré.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentsTab;