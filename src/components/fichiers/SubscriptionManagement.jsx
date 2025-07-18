import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X } from 'lucide-react';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        profile:profiles!subscriptions_user_id_fkey(full_name, username)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: `Impossible de charger les abonnements: ${error.message}` });
    } else {
      setSubscriptions(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleReview = async (subscriptionId, newStatus) => {
    const { error } = await supabase.functions.invoke('approve-subscription', {
      body: { subscriptionId, newStatus },
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `L'opération a échoué: ${error.message}` });
    } else {
      toast({ title: 'Succès', description: `L'abonnement a été ${newStatus === 'approved' ? 'approuvé' : 'rejeté'}.` });
      fetchSubscriptions();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>ID Transaction</TableHead>
              <TableHead>Date de soumission</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center p-8">Chargement...</TableCell></TableRow>
            ) : (
              subscriptions.map(sub => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="font-medium">{sub.profile?.full_name}</div>
                    <div className="text-sm text-slate-500">{sub.profile?.username}</div>
                  </TableCell>
                  <TableCell>{sub.amount.toLocaleString('fr-FR')} XOF</TableCell>
                  <TableCell><span className="font-mono">{sub.transaction_id}</span></TableCell>
                  <TableCell>{format(new Date(sub.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell className="text-right">
                    {sub.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <Button onClick={() => handleReview(sub.id, 'approved')} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleReview(sub.id, 'rejected')} size="sm" variant="destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubscriptionManagement;