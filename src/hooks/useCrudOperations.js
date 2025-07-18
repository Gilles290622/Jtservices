import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';

export const useCrudOperations = ({ fetchData, setDialogs }) => {
  const { toast } = useToast();

  const genericSave = async (tableName, data, successMessage) => {
    const { data: responseData, error } = await supabase
      .from(tableName)
      .upsert(data)
      .select()
      .single();

    if (error) {
      toast({ title: `Erreur ${tableName}`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: successMessage, description: `${responseData.name || responseData.description} a été sauvegardé.` });
      fetchData();
    }
    setDialogs(prev => ({
      ...prev,
      [`show${tableName.charAt(0).toUpperCase() + tableName.slice(1, -1)}Dialog`]: false
    }));
  };

  const genericDelete = async (tableName, id, successMessage) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      toast({ title: "Erreur de suppression", description: error.message, variant: "destructive" });
    } else {
      toast({ title: successMessage });
      fetchData();
    }
  };

  const saveProduct = (productData) => genericSave('products', productData, 'Produit sauvegardé');
  const deleteProduct = (productId) => genericDelete('products', productId, 'Produit supprimé');

  const saveExpense = (expenseData) => genericSave('expenses', expenseData, 'Dépense sauvegardée');
  const deleteExpense = (expenseId) => genericDelete('expenses', expenseId, 'Dépense supprimée');

  const saveCustomer = (customerData) => genericSave('customers', customerData, 'Client sauvegardé');
  const deleteCustomer = (customerId) => genericDelete('customers', customerId, 'Client supprimé');

  const saveSupplier = (supplierData) => genericSave('suppliers', supplierData, 'Fournisseur sauvegardé');
  const deleteSupplier = (supplierId) => genericDelete('suppliers', supplierId, 'Fournisseur supprimé');

  const saveProcurement = async (procurementData) => {
    const { supplier_id, items, amount_paid } = procurementData;
    const { error } = await supabase.rpc('handle_create_procurement', {
      supplier_id_in: supplier_id,
      items_in: items,
      amount_paid_in: amount_paid
    });

    if (error) {
      toast({ title: "Erreur d'approvisionnement", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Approvisionnement enregistré" });
      fetchData();
    }
    setDialogs(prev => ({ ...prev, showProcurementDialog: false }));
  };

  return {
    saveProduct,
    deleteProduct,
    saveExpense,
    deleteExpense,
    saveCustomer,
    deleteCustomer,
    saveSupplier,
    deleteSupplier,
    saveProcurement,
  };
};