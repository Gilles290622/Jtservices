import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import useUserProfile from '@/hooks/useUserProfile';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import FactureDialog from '@/components/factures/FactureDialog';
import FacturesHeader from '@/components/factures/FacturesHeader';
import FacturesPageHeader from '@/components/factures/FacturesPageHeader';
import InvoicesTable from '@/components/factures/InvoicesTable';
import InvoicePreviewDialog from '@/components/factures/InvoicePreviewDialog';

const Factures = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useUserProfile();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState({});
  const [invoiceItems, setInvoiceItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const handleNetworkError = (error, action) => {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: "Impossible de contacter le serveur. Vérifiez votre connexion internet et désactivez les bloqueurs de publicité, puis réessayez.",
        duration: 10000,
      });
    } else {
      toast({ 
        variant: 'destructive', 
        title: 'Erreur', 
        description: `Impossible de ${action}: ${error.message}` 
      });
    }
    console.error(`Error during ${action}:`, error);
  };

  const fetchAllData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [invoicesRes, clientsRes, itemsRes] = await Promise.all([
        supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('factures_clients').select('*').eq('user_id', user.id),
        supabase.from('invoice_items').select('*').eq('user_id', user.id)
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setInvoices(invoicesRes.data);
      
      const clientsMap = clientsRes.data.reduce((acc, client) => {
        acc[client.id] = client;
        return acc;
      }, {});
      setClients(clientsMap);

      const itemsMap = itemsRes.data.reduce((acc, item) => {
        if (!acc[item.invoice_id]) acc[item.invoice_id] = [];
        acc[item.invoice_id].push(item);
        return acc;
      }, {});
      setInvoiceItems(itemsMap);

    } catch (error) {
      handleNetworkError(error, 'charger les données');
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleOpenFormDialog = (invoice = null) => {
    setSelectedInvoice(invoice);
    setIsFormDialogOpen(true);
  };
  
  const handleOpenPreviewDialog = (invoice) => {
    setPreviewInvoice(invoice);
  };

  const handleSaveInvoice = async (invoiceData) => {
    const { items, new_client_name, ...invoiceDetails } = invoiceData;
    let clientId = invoiceDetails.client_id;

    try {
      if (new_client_name) {
        const { data: newClient, error: clientError } = await supabase
          .from('factures_clients')
          .insert({ name: new_client_name, user_id: user.id })
          .select()
          .single();
        
        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      if (!clientId) {
        toast({ variant: 'destructive', title: 'Client manquant', description: "Veuillez sélectionner ou créer un client." });
        return;
      }

      const { data: savedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .upsert({ ...invoiceDetails, client_id: clientId, user_id: user.id })
        .select()
        .single();

      if (invoiceError) throw invoiceError;
      
      await supabase.from('invoice_items').delete().eq('invoice_id', savedInvoice.id);

      const itemsToInsert = items.map(item => ({
        ...item,
        invoice_id: savedInvoice.id,
        user_id: user.id,
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({ title: 'Succès', description: 'Document sauvegardé.' });
      fetchAllData();
      setIsFormDialogOpen(false);
    } catch (error) {
      handleNetworkError(error, "d'enregistrer le document");
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
      const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
      if (error) throw error;
      
      toast({ title: 'Succès', description: 'Document supprimé.' });
      fetchAllData();
    } catch (error) {
       handleNetworkError(error, 'supprimer le document');
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (clients[invoice.client_id]?.name && clients[invoice.client_id].name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Helmet>
        <title>Gestion des Factures</title>
        <meta name="description" content="Créez et gérez vos devis et factures professionnelles." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <FacturesHeader profile={profile} onProfileUpdate={refreshProfile} />
        <main className="container mx-auto p-4 md:p-8">
          <FacturesPageHeader onNewDocument={() => handleOpenFormDialog(null)} profile={profile} />
          
          <Card>
            <CardHeader>
              <CardTitle>Historique des documents</CardTitle>
              <CardDescription>Consultez et gérez tous vos documents ici.</CardDescription>
              <div className="relative mt-4 w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par N° ou client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <InvoicesTable
                loading={loading || profileLoading}
                invoices={filteredInvoices}
                clients={clients}
                searchQuery={searchQuery}
                onPreview={handleOpenPreviewDialog}
                onEdit={handleOpenFormDialog}
                onDelete={handleDeleteInvoice}
              />
            </CardContent>
          </Card>
        </main>
      </div>

      <FactureDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        invoice={selectedInvoice}
        onSave={handleSaveInvoice}
        supabase={supabase}
        user={user}
      />
      
      <InvoicePreviewDialog
        invoice={previewInvoice}
        client={clients[previewInvoice?.client_id]}
        items={invoiceItems[previewInvoice?.id] || []}
        profile={profile}
        onOpenChange={() => setPreviewInvoice(null)}
      />
    </>
  );
};

export default Factures;