import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AuthPage = () => {
  const { project } = useParams();  // Récupère le projet depuis l'URL (ex. 'la-foi')
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPhonePrefix, setSignupPhonePrefix] = useState('+33');  // Préfixe par défaut (ex. France)
  const [signupPhoneNumber, setSignupPhoneNumber] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || `/${project.replace('-', '_')}`;  // Redirection vers la page du projet après auth

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password: loginPassword,
    });

    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Erreur de connexion", description: "Identifiant ou mot de passe incorrect." });
    } else {
      const userMetadata = data.user.user_metadata;
      const userProjects = userMetadata.projects || [];
      if (!userProjects.includes(project)) {
        await supabase.auth.updateUser({
          data: { projects: [...userProjects, project] }
        });
      }
      toast({ title: "Succès", description: "Connexion réussie. Bienvenue !" });
      navigate(from, { replace: true });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const phone = `${signupPhonePrefix}${signupPhoneNumber}`;  // Combine préfixe et numéro

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: signupFullName,
          username: signupUsername,
          phone: phone,
          projects: [project]
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
        <title>Authentification - JTS Services</title>
        <meta name="description" content={`Authentification pour ${project}`} />
      </Helmet>
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)' }}>
        <div className="absolute top-8 left-8 z-10">
          <Button variant="ghost" asChild className="text-gray-900 hover:bg-gray-200 hover:text-gray-900">
            <Link to="/">← Retour à l'accueil</Link>
          </Button>
        </div>
        
        <div className="w-full max-w-md z-10">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-blue-600">
                {project.charAt(0).toUpperCase() + project.slice(1)}
              </CardTitle>
              <CardDescription className="text-gray-600 pt-2">
                Accédez à votre compte ou créez-en un nouveau.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Se connecter</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">S'inscrire</TabsTrigger>
                </TabsList>
                <AnimatePresence mode="wait">
                  <motion.div
                    key="signin"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="signin" className="mt-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="login-identifier" className="text-gray-700">Email ou Nom d'utilisateur</Label>
                          <Input id="login-identifier" type="text" placeholder="votre@email.com" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-blue-500"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="login-password" className="text-gray-700">Mot de passe</Label>
                          <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-blue-500"/>
                        </div>
                        <div className="text-right -mt-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-500">Mot de passe oublié ?</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border-gray-200 text-gray-900">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Réinitialiser le mot de passe</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  Entrez votre adresse e-mail ci-dessous. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-2">
                                <Label htmlFor="reset-email" className="text-gray-700">E-mail</Label>
                                <Input
                                  id="reset-email"
                                  type="email"
                                  placeholder="votre@email.com"
                                  value={resetEmail}
                                  onChange={(e) => setResetEmail(e.target.value)}
                                  className="mt-2 bg-white text-gray-900 border-gray-300 focus:ring-blue-500"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-gray-100">Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handlePasswordReset} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                  {loading ? <Loader2 className="animate-spin" /> : 'Envoyer le lien'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg">
                          {loading ? <Loader2 className="animate-spin"/> : 'Se connecter'}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup" className="mt-4">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="signup-fullname" className="text-gray-700">Nom complet</Label>
                          <Input id="signup-fullname" type="text" placeholder="Jean Dupont" value={signupFullName} onChange={(e) => setSignupFullName(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-blue-500"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-username" className="text-gray-700">Nom d'utilisateur</Label>
                          <Input id="signup-username" type="text" placeholder="jeandupont" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-blue-500"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-email" className="text-gray-700">Email</Label>
                          <Input id="signup-email" type="email" placeholder="votre@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-blue-500"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-phone" className="text-gray-700">Contact</Label>
                          <div className="flex">
                            <Select value={signupPhonePrefix} onValueChange={setSignupPhonePrefix}>
                              <SelectTrigger className="w-[80px] bg-white text-gray-900 border-gray-300 focus:ring-blue-500">
                                <SelectValue placeholder="+" />
                              </SelectTrigger>
                              <SelectContent className="bg-white text-gray-900">
                                <SelectItem value="+33">+33 (FR)</SelectItem>
                                <SelectItem value="+1">+1 (US)</SelectItem>
                                <SelectItem value="+44">+44 (UK)</SelectItem>
                                {/* Ajoutez d'autres préfixes selon vos besoins */}
                              </SelectContent>
                            </Select>
                            <Input id="signup-phone" type="tel" placeholder="Numéro de téléphone" value={signupPhoneNumber} onChange={(e) => setSignupPhoneNumber(e.target.value)} required className="ml-2 bg-white text-gray-900 border-gray-300 focus:ring-blue-500 flex-1"/>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-password" className="text-gray-700">Mot de passe</Label>
                          <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-blue-500"/>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg">
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

export default AuthPage;