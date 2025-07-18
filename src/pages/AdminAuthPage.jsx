import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';

const AdminAuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setLoading(false);
      toast({ variant: "destructive", title: "Erreur de connexion", description: "Email ou mot de passe incorrect." });
      return;
    }

    if (user) {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError || !profile || profile.role !== 'admin') {
            setLoading(false);
            toast({ variant: "destructive", title: "Accès non autorisé", description: "Vous n'avez pas les permissions nécessaires." });
            await supabase.auth.signOut();
        } else {
            setLoading(false);
            toast({ title: "Succès", description: "Connexion administrateur réussie." });
            navigate(from, { replace: true });
        }
    }
  };

  return (
    <>
      <Helmet>
        <title>Accès Administrateur - JTS Services</title>
        <meta name="description" content="Authentification pour le panneau d'administration." />
      </Helmet>
      <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-600 rounded-full p-3 w-fit mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Zone Administrateur
              </CardTitle>
              <CardDescription className="text-slate-400 pt-2">
                Veuillez vous authentifier pour continuer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="admin@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500"/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500"/>
                </div>
                <div className="flex justify-end pt-2">
                    <Button variant="link" asChild className="p-0 h-auto text-sm text-blue-400 hover:text-blue-300">
                        <Link to="/">Retour à l'accueil</Link>
                    </Button>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg">
                  {loading ? <Loader2 className="animate-spin"/> : 'Se connecter'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminAuthPage;