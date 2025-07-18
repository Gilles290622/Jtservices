import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useDataFetching } from './useDataFetching';
import { useDialogManager } from './useDialogManager';
import { useSaleManager } from './useSaleManager';
import { usePaymentManager } from './usePaymentManager';
import { useCrudOperations } from './useCrudOperations';

export const useCashRegister = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sales');
  
  const { products, sales, expenses, customers, suppliers, procurements, payments, loading, fetchData } = useDataFetching();
  
  const { dialogs, setDialogs, ...dialogState } = useDialogManager();

  const saleManager = useSaleManager({
    products,
    customers,
    fetchData,
    dialogs,
    setDialogs,
    selectionState: {
      saleToLoad: dialogState.saleToLoad,
      saleToDelete: dialogState.saleToDelete,
    },
    setSelectionState: dialogState.setSelectionState,
  });

  const paymentManager = usePaymentManager({
    fetchData,
    dialogs,
    setDialogs,
    selectionState: {
      paymentToDelete: dialogState.paymentToDelete,
    },
    setSelectionState: dialogState.setSelectionState,
  });

  const crudOperations = useCrudOperations({
    fetchData,
    setDialogs,
  });

  const printInvoice = (invoice) => {
    toast({ title: "Fonctionnalité à venir", description: "L'impression de factures sera bientôt disponible." });
  };

  return {
    activeTab, setActiveTab,
    products, sales, expenses, customers, suppliers, procurements, payments,
    loading,
    ...dialogs,
    setDialogs,
    ...dialogState,
    ...saleManager,
    ...paymentManager,
    ...crudOperations,
    printInvoice
  };
};