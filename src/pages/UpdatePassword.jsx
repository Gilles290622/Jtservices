import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // This effect checks if the user landed on this page with a valid recovery token in the URL hash.
    // The Supabase client handles the session automatically from the hash.
    // If there's no token, this page is not accessible.
    if (!window.location.hash.includes('access_token')) {
      toast({
        variant: "destructive",
        title: "Lien invalide",
        description: "Le lien de réinitialisation est invalide ou a expiré.",
      });
      navigate('/auth');
    }
  }, [navigate, toast]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }

    setLoading(true);

    // Supabase client automatically uses the session from the URL fragment for this call.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré." });
    } else {
      toast({ title: "Succès", description: "Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter." });
      // Sign out to clear the recovery session before redirecting to login.
      await supabase.auth.signOut();
      navigate('/auth');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Nouveau mot de passe - La Foi</title>
      </Helmet>
      <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-gray-700 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-orange-500">
              Nouveau mot de passe
            </CardTitle>
            <CardDescription className="text-gray-400">
              Entrez votre nouveau mot de passe ci-dessous.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input id="new-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white text-black mt-1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-white text-black mt-1" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg">
                {loading ? <Loader2 className="animate-spin" /> : 'Mettre à jour le mot de passe'}
              </Button>
            </form>
            <div className="mt-4 text-center">
                <Button variant="link" asChild className="text-gray-400">
                    <Link to="/auth">Retour à la connexion</Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UpdatePasswordPage;