import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Printer, CreditCard, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const InvoicesTab = ({ 
  sales, 
  setSelectedInvoice, 
  setShowInvoiceDialog, 
  printInvoice, 
  setSelectedSaleForPayment, 
  setShowPaymentDialog,
  handleDeleteSaleRequest,
  validateSale 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSales = useMemo(() => {
    if (!searchQuery) {
      return sales;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return sales.filter(sale =>
      sale.invoice_number.toLowerCase().includes(lowercasedQuery) ||
      (sale.customer_name && sale.customer_name.toLowerCase().includes(lowercasedQuery))
    );
  }, [sales, searchQuery]);

  const getStatusBadge = (status) => {
    const variants = {
      'en attente': 'secondary',
      'validée': 'default'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const variants = {
      'Non payée': 'destructive',
      'Partiellement payée': 'secondary',
      'Payée': 'default'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Historique des Ventes & Factures</CardTitle>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par N° facture ou client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">N° Facture</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Client</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Total</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Statut</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Paiement</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Voir</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Imprimer</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Paiement</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{sale.invoice_number}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-4">{sale.customer_name || 'Client anonyme'}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {Number(sale.total).toLocaleString('fr-FR')} F CFA
                  </td>
                  <td className="py-3 px-4 text-center">
                    {sale.sale_status === 'en attente' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => validateSale(sale.id)}
                        className="text-xs"
                      >
                        Valider
                      </Button>
                    ) : (
                      getStatusBadge(sale.sale_status)
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getPaymentStatusBadge(sale.payment_status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedInvoice(sale);
                        setShowInvoiceDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => printInvoice(sale)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {sale.customer_id && sale.payment_status !== 'Payée' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSaleForPayment(sale);
                          setShowPaymentDialog(true);
                        }}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSaleRequest(sale.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? "Aucune vente ne correspond à votre recherche." : "Aucune vente enregistrée."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicesTab;