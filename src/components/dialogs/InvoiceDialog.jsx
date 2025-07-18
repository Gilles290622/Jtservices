import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';

const getPaymentStatusVariant = (status) => {
  switch (status) {
    case 'Payée':
      return 'default';
    case 'Partiellement payée':
      return 'secondary';
    case 'Non payée':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getSaleStatusVariant = (status) => {
  switch (status) {
    case 'validée':
      return 'secondary';
    case 'en attente':
      return 'outline';
    default:
      return 'outline';
  }
};

const InvoiceDialog = ({ open, onOpenChange, invoice, onPrint }) => {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Facture {invoice.invoice_number}</DialogTitle>
            <div className="flex items-center space-x-2">
               <Badge variant={getSaleStatusVariant(invoice.sale_status)}>{invoice.sale_status}</Badge>
               {invoice.sale_status === 'validée' && (
                <Badge variant={getPaymentStatusVariant(invoice.payment_status)}>{invoice.payment_status}</Badge>
               )}
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 max-h-[70vh] overflow-y-auto text-black">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold">JTS Services</h3>
              <p>Votre Adresse</p>
              <p>Votre Ville, Code Postal</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {new Date(invoice.created_at).toLocaleDateString('fr-FR')}</p>
              <p><strong>Heure:</strong> {new Date(invoice.created_at).toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>

          {invoice.customer_name && (
            <div className="mb-6">
              <h4 className="font-bold">Client:</h4>
              <p>{invoice.customer_name}</p>
            </div>
          )}

          <div>
            <h4 className="font-bold mb-2">Articles:</h4>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Produit</th>
                  <th className="border border-gray-300 p-2 text-right">Prix Unitaire</th>
                  <th className="border border-gray-300 p-2 text-center">Qté</th>
                  <th className="border border-gray-300 p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.sale_items || []).map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-2">{item.product_name}</td>
                    <td className="border border-gray-300 p-2 text-right">{Number(item.price).toLocaleString('fr-FR')} F CFA</td>
                    <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 text-right">{(item.price * item.quantity).toLocaleString('fr-FR')} F CFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right mt-6">
            <p className="text-muted-foreground">Montant payé: {Number(invoice.amount_paid).toLocaleString('fr-FR')} F CFA</p>
            <p className="text-2xl font-bold">Total: {Number(invoice.total).toLocaleString('fr-FR')} F CFA</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
          <Button onClick={() => onPrint(invoice)}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;