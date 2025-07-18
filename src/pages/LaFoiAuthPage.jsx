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
import { Loader2 } from 'lucide-react';

const LaFoiAuthPage = () => {
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
  const from = location.state?.from?.pathname || '/la-foi';

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
          project_type: 'lafoi'
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
        toast({ title: "E-mail envoyé", description: "Veuillez consulter votre boîte de réception pour les instructions de réinitialisation." });
        setResetEmail('');
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur inattendue", description: "Une erreur inattendue est survenue. Veuillez réessayer." });
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Authentification - La Foi</title>
        <meta name="description" content="Connectez-vous ou inscrivez-vous pour accéder à La Foi." />
      </Helmet>
      <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="absolute top-8 left-8 z-10">
          <Button variant="ghost" asChild className="text-white hover:bg-gray-800 hover:text-white">
            <Link to="/">&larr; Retour à l'accueil</Link>
          </Button>
        </div>
        
        <div className="w-full max-w-md z-10">
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-orange-500">
                La Foi
              </CardTitle>
              <CardDescription className="text-gray-400 pt-2">
                Accédez à votre compte ou créez-en un nouveau.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800/80">
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
                          <Input id="login-identifier" type="text" placeholder="votre@email.com" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required className="bg-white text-black"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="login-password">Mot de passe</Label>
                          <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="bg-white text-black"/>
                        </div>
                        <div className="text-right -mt-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="link" className="p-0 h-auto text-sm text-orange-500 hover:text-orange-400">Mot de passe oublié ?</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Réinitialiser le mot de passe</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Entrez votre adresse e-mail ci-dessous. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
                                  className="mt-2 bg-white text-black"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-gray-700">Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handlePasswordReset} disabled={loading} className="bg-red-600 hover:bg-red-700">
                                  {loading ? <Loader2 className="animate-spin" /> : 'Envoyer le lien'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg">
                          {loading ? <Loader2 className="animate-spin"/> : 'Se connecter'}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup" className="mt-4">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="signup-fullname">Nom complet</Label>
                          <Input id="signup-fullname" type="text" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-white text-black"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-username">Nom d'utilisateur</Label>
                          <Input id="signup-username" type="text" placeholder="jeandupont" value={username} onChange={(e) => setUsername(e.target.value)} required className="bg-white text-black"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input id="signup-email" type="email" placeholder="votre@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className="bg-white text-black"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-password">Mot de passe</Label>
                          <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className="bg-white text-black"/>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg">
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

export default LaFoiAuthPage;