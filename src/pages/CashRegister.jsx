import React from 'react';
import { useCashRegister } from '@/hooks/useCashRegister';

import DashboardHeader from '@/components/DashboardHeader';
import StatCards from '@/components/StatCards';
import SalesTab from '@/components/tabs/SalesTab';
import StockTab from '@/components/tabs/StockTab';
import ExpensesTab from '@/components/tabs/ExpensesTab';
import InvoicesTab from '@/components/tabs/InvoicesTab';
import CustomersTab from '@/components/tabs/CustomersTab';
import SuppliersTab from '@/components/tabs/SuppliersTab';
import ProcurementsTab from '@/components/tabs/ProcurementsTab';
import PaymentsTab from '@/components/tabs/PaymentsTab';

import ProductDialog from '@/components/dialogs/ProductDialog';
import ExpenseDialog from '@/components/dialogs/ExpenseDialog';
import InvoiceDialog from '@/components/dialogs/InvoiceDialog';
import CustomerDialog from '@/components/dialogs/CustomerDialog';
import SupplierDialog from '@/components/dialogs/SupplierDialog';
import ProcurementDialog from '@/components/dialogs/ProcurementDialog';
import PaymentDialog from '@/components/dialogs/PaymentDialog';
import EditPaymentDialog from '@/components/dialogs/EditPaymentDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.jsx";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, Truck, Wrench, FileText, CreditCard, Users, Building } from 'lucide-react';

function CashRegister() {
  const hook = useCashRegister();

  const TABS = [
    { value: 'sales', label: 'Ventes', icon: ShoppingCart },
    { value: 'stock', label: 'Stock', icon: Package },
    { value: 'procurements', label: 'Appro.', icon: Truck },
    { value: 'expenses', label: 'Dépenses', icon: Wrench },
    { value: 'invoices', label: 'Factures', icon: FileText },
    { value: 'payments', label: 'Paiements', icon: CreditCard },
    { value: 'customers', label: 'Clients', icon: Users },
    { value: 'suppliers', label: 'Fournisseurs', icon: Building },
  ];

  const totalRevenue = hook.sales.filter(s => s.sale_status === 'validée').reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = hook.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const lowStockProducts = hook.products.filter(p => p.stock <= p.min_stock);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <DashboardHeader />
        <StatCards stats={{ totalRevenue, totalExpenses, profit, lowStockProductsCount: lowStockProducts.length }} />
        
        <Tabs value={hook.activeTab} onValueChange={hook.setActiveTab} className="w-full mt-6">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="sales"><SalesTab products={hook.products} cart={hook.cart} setCart={hook.setCart} createPendingSale={hook.createPendingSale} customers={hook.customers} sales={hook.sales} handleDeleteSaleRequest={hook.handleDeleteSaleRequest} requestLoadSaleToCart={hook.requestLoadSaleToCart} /></TabsContent>
          <TabsContent value="stock"><StockTab products={hook.products} onAddProductClick={() => { hook.setEditState(p => ({...p, editingProduct: null})); hook.setDialogs(d => ({...d, showProductDialog: true})); }} onEditProductClick={(product) => { hook.setEditState(p => ({...p, editingProduct: product})); hook.setDialogs(d => ({...d, showProductDialog: true})); }} onDeleteProductClick={hook.deleteProduct} /></TabsContent>
          <TabsContent value="procurements"><ProcurementsTab procurements={hook.procurements} onAddProcurementClick={() => hook.setDialogs(d => ({...d, showProcurementDialog: true}))} /></TabsContent>
          <TabsContent value="expenses"><ExpensesTab expenses={hook.expenses} onAddExpenseClick={() => { hook.setEditState(p => ({...p, editingExpense: null})); hook.setDialogs(d => ({...d, showExpenseDialog: true})); }} onEditExpenseClick={(expense) => { hook.setEditState(p => ({...p, editingExpense: expense})); hook.setDialogs(d => ({...d, showExpenseDialog: true})); }} onDeleteExpenseClick={hook.deleteExpense} /></TabsContent>
          <TabsContent value="invoices">
            <InvoicesTab 
              sales={hook.sales}
              setSelectedInvoice={(invoice) => hook.setSelectionState(s => ({...s, selectedInvoice: invoice}))}
              setShowInvoiceDialog={(show) => hook.setDialogs(d => ({...d, showInvoiceDialog: show}))}
              printInvoice={hook.printInvoice}
              setSelectedSaleForPayment={(sale) => hook.setSelectionState(s => ({...s, selectedSaleForPayment: sale}))}
              setShowPaymentDialog={(show) => hook.setDialogs(d => ({...d, showPaymentDialog: show}))}
              handleDeleteSaleRequest={hook.handleDeleteSaleRequest}
              validateSale={hook.validateSale}
            />
          </TabsContent>
          <TabsContent value="payments"><PaymentsTab payments={hook.payments} onEditPayment={(payment) => { hook.setEditState(p => ({...p, editingPayment: payment})); hook.setDialogs(d => ({...d, showEditPaymentDialog: true})); }} onDeletePayment={hook.handleDeletePaymentRequest} /></TabsContent>
          <TabsContent value="customers"><CustomersTab customers={hook.customers} onAddCustomerClick={() => { hook.setEditState(p => ({...p, editingCustomer: null})); hook.setDialogs(d => ({...d, showCustomerDialog: true})); }} onEditCustomerClick={(customer) => { hook.setEditState(p => ({...p, editingCustomer: customer})); hook.setDialogs(d => ({...d, showCustomerDialog: true})); }} onDeleteCustomerClick={hook.deleteCustomer} /></TabsContent>
          <TabsContent value="suppliers"><SuppliersTab suppliers={hook.suppliers} onAddSupplierClick={() => { hook.setEditState(p => ({...p, editingSupplier: null})); hook.setDialogs(d => ({...d, showSupplierDialog: true})); }} onEditSupplierClick={(supplier) => { hook.setEditState(p => ({...p, editingSupplier: supplier})); hook.setDialogs(d => ({...d, showSupplierDialog: true})); }} onDeleteSupplierClick={hook.deleteSupplier} /></TabsContent>
        </Tabs>

        <ProductDialog open={hook.showProductDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showProductDialog: show}))} onSave={hook.saveProduct} editingProduct={hook.editingProduct} />
        <ExpenseDialog open={hook.showExpenseDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showExpenseDialog: show}))} onSave={hook.saveExpense} editingExpense={hook.editingExpense} />
        <InvoiceDialog open={hook.showInvoiceDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showInvoiceDialog: show}))} invoice={hook.selectedInvoice} onPrint={hook.printInvoice} />
        <CustomerDialog open={hook.showCustomerDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showCustomerDialog: show}))} onSave={hook.saveCustomer} editingCustomer={hook.editingCustomer} />
        <SupplierDialog open={hook.showSupplierDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showSupplierDialog: show}))} onSave={hook.saveSupplier} editingSupplier={hook.editingSupplier} />
        <ProcurementDialog open={hook.showProcurementDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showProcurementDialog: show}))} onSave={hook.saveProcurement} suppliers={hook.suppliers} products={hook.products} />
        <PaymentDialog open={hook.showPaymentDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showPaymentDialog: show}))} onSave={hook.handleSavePayment} sale={hook.selectedSaleForPayment} />
        <EditPaymentDialog open={hook.showEditPaymentDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showEditPaymentDialog: show}))} onSave={hook.handleUpdatePayment} payment={hook.editingPayment} />

        <AlertDialog open={hook.showDeleteSaleDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showDeleteSaleDialog: show}))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. La facture sera définitivement supprimée et les stocks seront réajustés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={hook.executeDeleteSale}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={hook.showDeletePaymentDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showDeletePaymentDialog: show}))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce paiement ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le paiement sera supprimé et le solde du client sera mis à jour.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={hook.executeDeletePayment}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={hook.showConfirmLoadCartDialog} onOpenChange={(show) => hook.setDialogs(d => ({...d, showConfirmLoadCartDialog: show}))}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Écraser le panier actuel ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Votre panier contient des articles. Voulez-vous le vider et le remplacer par le contenu de la vente sélectionnée pour modification ?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => hook.executeLoadSaleToCart()}>Confirmer</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default CashRegister;