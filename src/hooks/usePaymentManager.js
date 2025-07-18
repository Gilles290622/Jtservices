import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';

export const usePaymentManager = ({ fetchData, dialogs, setDialogs, selectionState, setSelectionState, editState, setEditState }) => {
  const { toast } = useToast();

  const handleSavePayment = async ({ saleId, amount }) => {
    const { error } = await supabase.rpc('handle_sale_payment', { 
      sale_id_in: saleId, 
      payment_amount_in: amount 
    });
    if (error) {
      toast({ title: "Erreur de paiement", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Paiement enregistré", description: "Le paiement a été enregistré avec succès." });
      fetchData();
    }
    setDialogs(prev => ({ ...prev, showPaymentDialog: false }));
  };

  const handleUpdatePayment = async ({ paymentId, amount }) => {
    const { error } = await supabase.rpc('update_payment', { 
      payment_id_in: paymentId, 
      new_amount_in: amount 
    });
    if (error) {
      toast({ title: "Erreur de mise à jour", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Paiement mis à jour", description: "Le paiement a été mis à jour." });
      fetchData();
    }
    setDialogs(prev => ({ ...prev, showEditPaymentDialog: false }));
  };

  const handleDeletePaymentRequest = (paymentId) => {
    setSelectionState(prev => ({ ...prev, paymentToDelete: paymentId }));
    setDialogs(prev => ({ ...prev, showDeletePaymentDialog: true }));
  };

  const executeDeletePayment = async () => {
    if (!selectionState.paymentToDelete) return;
    const { error } = await supabase.rpc('delete_payment', { payment_id_in: selectionState.paymentToDelete });
    if (error) {
      toast({ title: "Erreur de suppression", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Paiement supprimé", description: "Le paiement a été supprimé." });
      fetchData();
    }
    setDialogs(prev => ({ ...prev, showDeletePaymentDialog: false }));
    setSelectionState(prev => ({ ...prev, paymentToDelete: null }));
  };

  return {
    handleSavePayment,
    handleUpdatePayment,
    handleDeletePaymentRequest,
    executeDeletePayment,
  };
};