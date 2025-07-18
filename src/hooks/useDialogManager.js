import { useState } from 'react';

export const useDialogManager = () => {
  const [dialogs, setDialogs] = useState({
    showProductDialog: false,
    showExpenseDialog: false,
    showInvoiceDialog: false,
    showCustomerDialog: false,
    showSupplierDialog: false,
    showProcurementDialog: false,
    showPaymentDialog: false,
    showEditPaymentDialog: false,
    showDeleteSaleDialog: false,
    showDeletePaymentDialog: false,
    showConfirmLoadCartDialog: false,
  });

  const [editState, setEditState] = useState({
    editingProduct: null,
    editingExpense: null,
    editingCustomer: null,
    editingSupplier: null,
    editingPayment: null,
  });

  const [selectionState, setSelectionState] = useState({
    selectedInvoice: null,
    selectedSaleForPayment: null,
    saleToDelete: null,
    paymentToDelete: null,
    saleToLoad: null,
  });

  const openDialog = (dialogName, stateToSet = null) => {
    setDialogs(prev => ({ ...prev, [dialogName]: true }));
    if (stateToSet) {
      const { key, value } = stateToSet;
      if (key.startsWith('editing')) {
        setEditState(prev => ({ ...prev, [key]: value }));
      } else {
        setSelectionState(prev => ({ ...prev, [key]: value }));
      }
    }
  };

  const closeDialog = (dialogName) => {
    setDialogs(prev => ({ ...prev, [dialogName]: false }));
  };

  return {
    dialogs,
    setDialogs,
    ...editState,
    setEditState,
    ...selectionState,
    setSelectionState,
    openDialog,
    closeDialog,
  };
};