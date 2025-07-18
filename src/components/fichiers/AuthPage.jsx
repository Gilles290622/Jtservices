import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    let emailToLogin = loginIdentifier;

    if (!loginIdentifier.includes('@') && loginIdentifier.length > 0) {
      const { data, error: rpcError } = await supabase.rpc('get_email_from_username', { p_username: loginIdentifier });
      
      if (rpcError || !data) {
        toast({ variant: "destructive", title: "Erreur de connexion", description: "Nom d'utilisateur ou mot de passe incorrect." });
        setLoading(false);
        return;
      }
      emailToLogin = data;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password: loginPassword,
    });

    if (error) {
      toast({ variant: "destructive", title: "Erreur de connexion", description: "Identifiant ou mot de passe incorrect." });
    } else {
      toast({ title: "Succès", description: "Connexion réussie. Bienvenue !" });
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: fullName,
          username: username,
          project_type: 'fichiers'
        },
      },
    });
    if (error) {
      toast({ variant: "destructive", title: "Erreur d'inscription", description: error.message });
    } else {
      toast({ title: "Inscription réussie !", description: "Vous allez être redirigé pour activer votre abonnement." });
    }
    setLoading(false);
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('request-password-reset', {
      body: { identifier: resetIdentifier },
    });
    setLoading(false);
    setShowResetDialog(false);
    setResetIdentifier('');

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
      toast({ title: 'Demande envoyée', description: data.message });
    }
  };

  return (
    <>
      <Card className="w-full max-w-sm shadow-lg border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">JTS Fichiers</CardTitle>
          <CardDescription>Accédez à votre espace sécurisé</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Se connecter</TabsTrigger>
              <TabsTrigger value="signup">S'inscrire</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <Input type="text" placeholder="Email ou Nom d'utilisateur" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required />
                <Input type="password" placeholder="Mot de passe" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                <div className="flex justify-between items-center text-sm">
                  <Button type="button" variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700" onClick={() => setShowResetDialog(true)}>
                    Demander une réinitialisation
                  </Button>
                  <Button type="button" variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700" onClick={() => navigate('/reset-password')}>
                    Utiliser un code
                  </Button>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? 'Chargement...' : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <Input type="text" placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <Input type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <Input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                <Input type="password" placeholder="Mot de passe" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? 'Création...' : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demander une réinitialisation</AlertDialogTitle>
            <AlertDialogDescription>
              Entrez votre email ou nom d'utilisateur. Si un compte correspondant est trouvé, une demande de réinitialisation sera envoyée à un administrateur pour approbation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleRequestReset}>
            <div className="my-4">
              <Input 
                placeholder="Email ou nom d'utilisateur" 
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
                required
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
              <Button type="submit" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer la demande'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AuthPage;