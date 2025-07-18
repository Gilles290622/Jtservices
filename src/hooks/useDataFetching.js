import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";

export const useDataFetching = () => {
  const { toast } = useToast();
  const [data, setData] = useState({
    products: [],
    sales: [],
    expenses: [],
    customers: [],
    suppliers: [],
    procurements: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: productsData, error: productsError },
        { data: salesData, error: salesError },
        { data: expensesData, error: expensesError },
        { data: customersData, error: customersError },
        { data: suppliersData, error: suppliersError },
        { data: procurementsData, error: procurementsError },
        { data: paymentsData, error: paymentsError },
      ] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('sales').select('*, sale_items(*)').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('name'),
        supabase.from('suppliers').select('*').order('name'),
        supabase.from('procurements').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*, customers(name), sales(invoice_number)').order('created_at', { ascending: false }),
      ]);

      if (productsError) throw productsError;
      if (salesError) throw salesError;
      if (expensesError) throw expensesError;
      if (customersError) throw customersError;
      if (suppliersError) throw suppliersError;
      if (procurementsError) throw procurementsError;
      if (paymentsError) throw paymentsError;

      setData({
        products: productsData,
        sales: salesData,
        expenses: expensesData,
        customers: customersData,
        suppliers: suppliersData,
        procurements: procurementsData,
        payments: paymentsData,
      });

    } catch (error) {
      toast({ title: "Erreur de chargement", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, fetchData };
};