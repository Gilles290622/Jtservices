import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { AuthApiError } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

const ProtectedRoute = ({ children, project }) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading ] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      if (authLoading) return;

      if (!user) {
        navigate(`/auth/${project}`, { state: { from: location } });
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session) {
          await signOut();
          navigate(`/auth/${project}`, { state: { from: location } });
          return;
        }

        const userProjects = user.user_metadata?.projects || [];
        if (!userProjects.includes(project)) {
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas accès à ce projet.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Erreur de session:', error);
        if (error instanceof AuthApiError) {
          await signOut();
        }
        toast({
          title: "Erreur d'authentification",
          description: error.message,
          variant: "destructive",
        });
        navigate(`/auth/${project}`, { state: { from: location } });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [user, authLoading, navigate, project, location, toast, signOut]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;