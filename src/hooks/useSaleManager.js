import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';

export const useSaleManager = ({ products, customers, fetchData, dialogs, setDialogs, selectionState, setSelectionState }) => {
  const { toast } = useToast();
  const [cart, setCart] = useState([]);

  const createPendingSale = async (customerId) => {
    if (cart.length === 0) {
      toast({ title: "Panier vide", description: "Ajoutez des produits avant de créer une vente.", variant: "destructive" });
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      toast({ title: "Client non trouvé", description: "Le client sélectionné est invalide.", variant: "destructive" });
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const invoiceNumber = `INV-${Date.now()}`;

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        customer_id: customer.id,
        customer_name: customer.name,
        total: total,
        amount_paid: 0,
        payment_status: 'Non payée',
        sale_status: 'en attente',
        invoice_number: invoiceNumber,
      })
      .select()
      .single();

    if (saleError) {
      toast({ title: "Erreur lors de la création de la vente", description: saleError.message, variant: "destructive" });
      return;
    }

    const saleItems = cart.map(item => ({
      sale_id: saleData.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      product_name: item.name,
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);

    if (itemsError) {
      toast({ title: "Erreur lors de l'ajout des articles", description: itemsError.message, variant: "destructive" });
      await supabase.from('sales').delete().eq('id', saleData.id);
      return;
    }

    toast({ title: "Vente créée", description: `La vente ${saleData.invoice_number} a été créée avec succès.` });
    setCart([]);
    fetchData();
  };

  const executeLoadSaleToCart = async (sale) => {
    const saleToProcess = sale || selectionState.saleToLoad;
    if (!saleToProcess) return;

    const { error } = await supabase.rpc('delete_sale', { sale_id_in: saleToProcess.id });

    if (error) {
        toast({ title: "Erreur", description: `Impossible de supprimer l'ancienne vente pour modification: ${error.message}`, variant: 'destructive' });
        return;
    }

    setCart(saleToProcess.sale_items.map(item => ({
        id: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        stock: products.find(p => p.id === item.product_id)?.stock || 0,
        cartItemId: `${item.product_id}-${Date.now()}`
    })));
    
    toast({ title: "Prêt pour modification", description: "La vente a été chargée dans le panier. Vous pouvez la modifier et créer une nouvelle vente.", variant: 'info' });
    fetchData();
    
    if (dialogs.showConfirmLoadCartDialog) {
        setDialogs(prev => ({ ...prev, showConfirmLoadCartDialog: false }));
        setSelectionState(prev => ({ ...prev, saleToLoad: null }));
    }
  };

  const requestLoadSaleToCart = (sale) => {
    if (cart.length > 0) {
        setSelectionState(prev => ({ ...prev, saleToLoad: sale }));
        setDialogs(prev => ({ ...prev, showConfirmLoadCartDialog: true }));
    } else {
        executeLoadSaleToCart(sale);
    }
  };

  const validateSale = async (saleId) => {
    const { error } = await supabase.rpc('validate_sale', { sale_id_in: saleId });
    if (error) {
      toast({ title: "Erreur de validation", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vente validée", description: "La vente a été validée et le stock mis à jour." });
      fetchData();
    }
  };

  const handleDeleteSaleRequest = (saleId) => {
    setSelectionState(prev => ({ ...prev, saleToDelete: saleId }));
    setDialogs(prev => ({ ...prev, showDeleteSaleDialog: true }));
  };

  const executeDeleteSale = async () => {
    if (!selectionState.saleToDelete) return;
    const { error } = await supabase.rpc('delete_sale', { sale_id_in: selectionState.saleToDelete });
    if (error) {
      toast({ title: "Erreur de suppression", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vente supprimée", description: "La vente a été supprimée avec succès." });
      fetchData();
    }
    setDialogs(prev => ({ ...prev, showDeleteSaleDialog: false }));
    setSelectionState(prev => ({ ...prev, saleToDelete: null }));
  };

  return {
    cart,
    setCart,
    createPendingSale,
    requestLoadSaleToCart,
    executeLoadSaleToCart,
    validateSale,
    handleDeleteSaleRequest,
    executeDeleteSale,
  };
};