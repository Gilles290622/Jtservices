import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }
      
      if (data && (data.logo_url === 'https://i.imgur.com/pB6zYwH.png' || data.logo_url === 'https://i.imgur.com/kQ3J3A0.png')) {
        data.logo_url = 'https://i.ibb.co/6wmT2Ld/cloud-logo.png';
      }
      setProfile(data);

    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        toast({
          variant: 'destructive',
          title: 'Erreur de connexion',
          description: "Impossible de charger votre profil. Vérifiez votre connexion internet.",
          duration: 10000,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur de profil',
          description: "Une erreur est survenue lors du chargement de votre profil.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshProfile = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refreshProfile };
};

export default useUserProfile;