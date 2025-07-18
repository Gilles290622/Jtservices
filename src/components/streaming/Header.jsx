import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Search, User, LogOut, CreditCard, LayoutDashboard } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const Header = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile for header:", error);
        } else {
          setProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error && error.code !== 403 && error.error_code !== 'session_not_found') {
        toast({
            variant: "destructive",
            title: "Erreur de déconnexion",
            description: error.message || "Une erreur est survenue.",
        });
    } else {
        toast({ title: "Déconnexion réussie." });
    }
    navigate('/auth/la-foi', { replace: true });
  };

  const handleNotImplemented = () => {
    toast({
      title: '🚧 Bientôt disponible !',
      description: "Cette fonctionnalité n'est pas encore implémentée.",
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-10 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent transition-all duration-300">
      <div className="flex items-center gap-8">
        <Link to="/la-foi" className="text-2xl font-extrabold text-red-600">
          LA FOI
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/la-foi" className="text-sm font-medium text-gray-200 hover:text-white">Accueil</Link>
          <button onClick={handleNotImplemented} className="text-sm font-medium text-gray-200 hover:text-white">Séries</button>
          <button onClick={handleNotImplemented} className="text-sm font-medium text-gray-200 hover:text-white">Films</button>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleNotImplemented} className="text-white hover:bg-white/10">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNotImplemented} className="text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                {profile?.avatar_url ? (
                  <img-replace src={profile.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full" />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 text-white">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onSelect={() => navigate('/pricing')} className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Mon Abonnement</span>
              </DropdownMenuItem>
              {profile?.role === 'admin' && (
                <DropdownMenuItem onSelect={() => navigate('/admin')} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer text-red-400 focus:bg-red-900/50 focus:text-red-300">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => navigate('/auth/la-foi')} className="bg-red-600 hover:bg-red-700 text-white font-bold">
            S'identifier
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;