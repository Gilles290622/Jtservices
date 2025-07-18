import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, ShoppingCart } from 'lucide-react';

const CaisseAuthPage = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/caisse';

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

    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Erreur de connexion", description: "Identifiant ou mot de passe incorrect." });
    } else {
      toast({ title: "Succès", description: "Connexion réussie. Bienvenue !" });
      navigate(from, { replace: true });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: fullName,
          username: username,
          project_type: 'caisse'
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Erreur d'inscription", description: error.message });
    } else {
      toast({ title: "Inscription réussie !", description: "Veuillez consulter vos e-mails pour confirmer votre compte. Vous pouvez ensuite vous connecter." });
    }
  };
  
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez entrer une adresse e-mail." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast({ variant: "destructive", title: "Erreur", description: error.message });
      } else {
        toast({ title: "E-mail envoyé", description: "Veuillez consulter votre boîte de réception." });
        setResetEmail('');
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur inattendue", description: "Une erreur est survenue." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Authentification - Caisse</title>
        <meta name="description" content="Connectez-vous ou inscrivez-vous pour accéder à la Caisse." />
      </Helmet>
      <div className="min-h-screen w-full bg-emerald-900/10 text-gray-800 flex flex-col items-center justify-center p-4">
        <div className="absolute top-8 left-8 z-10">
          <Button variant="ghost" asChild className="text-gray-600 hover:bg-emerald-100 hover:text-emerald-800">
            <Link to="/">&larr; Retour à l'accueil</Link>
          </Button>
        </div>
        
        <div className="w-full max-w-md z-10">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto bg-emerald-100 p-3 rounded-full w-fit mb-4">
                 <ShoppingCart className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-emerald-800">
                JTS Caisse
              </CardTitle>
              <CardDescription className="text-gray-600 pt-2">
                Accédez à votre point de vente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-emerald-100 text-emerald-800">
                  <TabsTrigger value="signin">Se connecter</TabsTrigger>
                  <TabsTrigger value="signup">S'inscrire</TabsTrigger>
                </TabsList>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={ "signin"}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="signin" className="mt-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="login-identifier">Email ou Nom d'utilisateur</Label>
                          <Input id="login-identifier" type="text" placeholder="votre@email.com" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="login-password">Mot de passe</Label>
                          <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                        </div>
                        <div className="text-right -mt-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="link" className="p-0 h-auto text-sm text-emerald-600 hover:text-emerald-700">Mot de passe oublié ?</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Réinitialiser le mot de passe</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Entrez votre adresse e-mail. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-2">
                                <Label htmlFor="reset-email">E-mail</Label>
                                <Input
                                  id="reset-email"
                                  type="email"
                                  placeholder="votre@email.com"
                                  value={resetEmail}
                                  onChange={(e) => setResetEmail(e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handlePasswordReset} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                  {loading ? <Loader2 className="animate-spin" /> : 'Envoyer le lien'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg">
                          {loading ? <Loader2 className="animate-spin"/> : 'Se connecter'}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup" className="mt-4">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="signup-fullname">Nom complet</Label>
                          <Input id="signup-fullname" type="text" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-username">Nom d'utilisateur</Label>
                          <Input id="signup-username" type="text" placeholder="jeandupont" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input id="signup-email" type="email" placeholder="votre@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-password">Mot de passe</Label>
                          <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg">
                          {loading ? <Loader2 className="animate-spin" /> : "Créer un compte"}
                        </Button>
                      </form>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CaisseAuthPage;