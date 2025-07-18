import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { Helmet } from 'react-helmet';

const CustomerStatement = () => {
  const { customerId } = useParams();
  const { toast } = useToast();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatementData = async () => {
      setLoading(true);
      try {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();
        if (customerError) throw customerError;
        setCustomer(customerData);

        const { data: statementData, error: statementError } = await supabase.rpc('get_customer_statement', {
          p_customer_id: customerId
        });

        if (statementError) throw statementError;

        const formattedTransactions = statementData.map((tx, index) => ({
          id: `${tx.transaction_type}-${index}-${tx.transaction_date}`,
          date: new Date(tx.transaction_date),
          type: tx.transaction_type,
          description: tx.details,
          debit: tx.debit,
          credit: tx.credit,
        }));

        setTransactions(formattedTransactions);

      } catch (error) {
        toast({ title: 'Erreur', description: `Impossible de charger le relevé: ${error.message}`, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchStatementData();
    }
  }, [customerId, toast]);

  const statementWithBalance = useMemo(() => {
    if (!customer) return [];
    
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sortedTransactions.length === 0) {
        return [];
    }

    const totalDebit = sortedTransactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = sortedTransactions.reduce((sum, t) => sum + t.credit, 0);
    
    const initialBalance = customer.balance - totalDebit + totalCredit;

    let runningBalance = initialBalance;
    const processed = sortedTransactions.map(t => {
      runningBalance = runningBalance + t.debit - t.credit;
      return { ...t, balance: runningBalance };
    });

    return processed.reverse();
  }, [transactions, customer]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-background text-foreground">Chargement du relevé...</div>;
  }

  if (!customer) {
    return <div className="flex justify-center items-center h-screen bg-background text-foreground">Client non trouvé.</div>;
  }

  return (
    <>
      <Helmet>
        <title>Relevé de Compte - {customer.name}</title>
        <meta name="description" content={`Relevé de compte détaillé pour le client ${customer.name}.`} />
        <style type="text/css">{`
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
            .card-print {
                border: none;
                box-shadow: none;
            }
          }
        `}</style>
      </Helmet>
      <div className="container mx-auto p-6">
        <div className="mb-6 flex justify-between items-center no-print">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </div>
        <Card className="card-print">
          <CardHeader>
            <CardTitle className="text-3xl">Relevé de Compte</CardTitle>
            <CardDescription>
              <p className="text-lg font-semibold">{customer.name}</p>
              <p>{customer.email} | {customer.phone}</p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-right mb-4">
                <p className="text-muted-foreground">Solde Actuel (dû par le client)</p>
                <p className="text-2xl font-bold text-destructive">{Number(customer.balance).toLocaleString('fr-FR')} F CFA</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Débit (Vente)</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Crédit (Paiement)</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Solde Dû</th>
                  </tr>
                </thead>
                <tbody>
                  {statementWithBalance.map((t) => (
                    <tr key={t.id} className="border-b">
                      <td className="py-3 px-4 text-muted-foreground">{t.date.toLocaleString('fr-FR')}</td>
                      <td className="py-3 px-4">{t.description}</td>
                      <td className="py-3 px-4 text-right text-red-600">{t.debit > 0 ? `${Number(t.debit).toLocaleString('fr-FR')} F CFA` : '-'}</td>
                      <td className="py-3 px-4 text-right text-green-600">{t.credit > 0 ? `${Number(t.credit).toLocaleString('fr-FR')} F CFA` : '-'}</td>
                      <td className="py-3 px-4 text-right font-bold">{Number(t.balance).toLocaleString('fr-FR')} F CFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
               {statementWithBalance.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-8">Aucune transaction pour ce client.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CustomerStatement;