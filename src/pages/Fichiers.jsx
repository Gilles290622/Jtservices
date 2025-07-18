import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import AuthPage from '@/components/fichiers/AuthPage';
import FileManager from '@/components/fichiers/FileManager';
import AdminDashboard from '@/components/fichiers/AdminDashboard';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Fichiers() {
  const { user, session, loading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
             if (error.code === 'PGRST116') {
                console.error("Profile not found for user:", user.id);
                toast({ 
                  variant: "destructive", 
                  title: "Profil utilisateur introuvable", 
                  description: "Votre profil n'a pas pu être chargé. Déconnexion en cours." 
                });
                await signOut();
                return;
              }
            throw error;
          }

          setProfile(data);
          if (data && data.role === 'user' && data.subscription_expires_at && new Date(data.subscription_expires_at) < new Date()) {
            navigate('/subscription');
          }
        } catch (error) {
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.error("Network error while fetching profile. Signing out.", error);
            toast({
              variant: "destructive",
              title: "Erreur de connexion",
              description: "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez. Déconnexion en cours.",
              duration: 10000,
            });
            await signOut();
            return;
          }
          
          if (error.code === 'PGRST301' || error.status === 401 || (error.message && (error.message.includes("JWT") || error.message.includes("Invalid Refresh Token")))) {
            console.error("Authentication error detected. Signing out.", error);
            await signOut();
          } else if (error.code !== 'PGRST116') {
            console.error("Error fetching profile:", error);
          }
        }
      };
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user, navigate, toast, signOut]);

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Déconnexion réussie." });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div key="loading">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (!session || !user) {
      return (
        <motion.div
          key="auth-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center w-full px-4"
        >
          <AuthPage />
        </motion.div>
      );
    }
    
    if (!profile) {
       return (
        <div key="loading-profile">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (profile.status !== 'active') {
       return (
         <motion.div 
            key="status" 
            className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-lg shadow-xl max-w-md mx-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            >
            <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4"/>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-800">Compte en attente</h1>
            <p className="mb-8 text-slate-600">Votre compte est en attente de validation par un administrateur ou a été désactivé. Veuillez patienter ou contacter le support.</p>
            <Button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">Se déconnecter</Button>
         </motion.div>
       );
    }

    if (profile.role === 'admin') {
      return (
        <motion.div
          key="admin-dashboard"
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <AdminDashboard user={profile} onLogout={handleLogout} />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="filemanager"
        className="w-full h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <FileManager user={profile} onLogout={handleLogout} />
      </motion.div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Fichiers - Gestionnaire de Fichiers Sécurisé</title>
        <meta name="description" content="Application moderne de gestion de fichiers avec authentification sécurisée et interface intuitive" />
      </Helmet>
      
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-200 p-0 sm:p-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </>
  );
}

export default Fichiers;