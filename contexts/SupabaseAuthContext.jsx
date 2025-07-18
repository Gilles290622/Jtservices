import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    let signOutError = null;
    try {
      const { error } = await supabase.auth.signOut();
      if (error && error.code !== 403 && error.error_code !== 'session_not_found') {
        throw error;
      }
    } catch (error) {
      signOutError = error;
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: "Impossible de contacter le serveur. Vérifiez votre connexion réseau.",
      });
    } finally {
      handleSession(null);
    }
    return { error: signOutError };
  }, [toast, handleSession]);
  
  const resetPasswordForEmail = useCallback(async (email, options) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, options);

    if (error) {
      toast({
        variant: "destructive",
        title: "Réinitialisation de mot de passe échouée",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);


  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPasswordForEmail,
  }), [user, session, loading, signUp, signIn, signOut, resetPasswordForEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};