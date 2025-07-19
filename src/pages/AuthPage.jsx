import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Video, Folder, ShoppingCart, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Map des projets pour logos et couleurs
const projectData = {
  'la-foi': { icon: <Video className="h-8 w-8" />, color: 'orange-500' },
  'fichiers': { icon: <Folder className="h-8 w-8" />, color: 'blue-500' },
  'caisse': { icon: <ShoppingCart className="h-8 w-8" />, color: 'green-500' },
  'factures': { icon: <FileText className="h-8 w-8" />, color: 'indigo-500' },
  'journal-financiers': { icon: <FileText className="h-8 w-8" />, color: 'red-500' },
};

const AuthPage = () => {
  const { project } = useParams(); // Récupère le projet depuis l'URL (ex. 'la-foi')
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPhonePrefix, setSignupPhonePrefix] = useState('+33'); // Préfixe par défaut (ex. France)
  const [signupPhoneNumber, setSignupPhoneNumber] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || `/${project.replace('-', '_')}`; // Redirection vers la page du projet après auth

  const currentProject = projectData[project] || { icon: null, color: 'gray-500' }; // Fallback si projet inconnu

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

    const phone = `${signupPhonePrefix}${signupPhoneNumber}`; // Combine préfixe et numéro

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: signupFullName,
          username: signupUsername,
          phone: phone, // Stocke le numéro complet avec indicatif
          projects: [project]
        },
      },
    });

    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Erreur d'inscription", description: error.message });
    } else {
      toast({ title: "Inscription réussie !", description: "Veuillez consulter vos e-mails pour confirmer votre compte. Vous pouvez ensuite vous connecter." });
      // Optionnel : Rediriger après inscription si confirmé
      // navigate('/confirm-email');
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
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)' }}>
        <div className="absolute top-8 left-8 z-10">
          <Button variant="ghost" asChild className={`text-${currentProject.color} hover:bg-gray-200 hover:text-${currentProject.color.replace('500', '600')}`}>
            <Link to="/">← Retour à l'accueil</Link>
          </Button>
        </div>
        
        <div className="w-full max-w-md z-10">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className={`text-4xl font-bold text-${currentProject.color} flex items-center justify-center gap-2`}>
                {currentProject.icon}  
                {project.charAt(0).toUpperCase() + project.slice(1)}
              </CardTitle>
              <CardDescription className="text-gray-600 pt-2">
                Accédez à votre compte ou créez-en un nouveau.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className={`grid w-full grid-cols-2 bg-gradient-to-r from-${currentProject.color} to-${currentProject.color.replace('500', '300')} opacity-80`}>
                  <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Se connecter</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">S'inscrire</TabsTrigger>
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
                          <Input id="login-identifier" type="text" placeholder="votre@email.com" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-gray-500"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="login-password" className="text-gray-700">Mot de passe</Label>
                          <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-gray-500"/>
                        </div>
                        <div className="text-right -mt-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="link" className={`p-0 h-auto text-${currentProject.color}`}>Mot de passe oublié ?</Button>
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
                                  className="mt-2 bg-white text-gray-900 border-gray-300 focus:ring-gray-500"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-gray-100">Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handlePasswordReset} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                                  {loading ? <Loader2 className="animate-spin" /> : 'Envoyer le lien'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <Button type="submit" disabled={loading} className={`w-full bg-${currentProject.color} hover:bg-${currentProject.color.replace('500', '600')} text-white font-bold py-6 text-lg`}>
                          {loading ? <Loader2 className="animate-spin"/> : 'Se connecter'}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup" className="mt-4">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="signup-fullname" className="text-gray-700">Nom complet</Label>
                          <Input id="signup-fullname" type="text" placeholder="Jean Dupont" value={signupFullName} onChange={(e) => setSignupFullName(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-gray-500"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-username" className="text-gray-700">Nom d'utilisateur</Label>
                          <Input id="signup-username" type="text" placeholder="jeandupont" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-gray-500"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-email" className="text-gray-700">Email</Label>
                          <Input id="signup-email" type="email" placeholder="votre@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-gray-500"/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-phone" className="text-gray-700">Contact</Label>
                          <div className="flex">
                            <Select value={signupPhonePrefix} onValueChange={setSignupPhonePrefix}>
                              <SelectTrigger className="w-[80px] bg-white text-gray-900 border-gray-300 focus:ring-gray-500">
                                <SelectValue placeholder="+" />
                              </SelectTrigger>
                              <SelectContent className="bg-white text-gray-900 max-h-60 overflow-auto">
                                <SelectItem value="+33">+33 (France)</SelectItem>
                                <SelectItem value="+1">+1 (États-Unis)</SelectItem>
                                <SelectItem value="+44">+44 (Royaume-Uni)</SelectItem>
                                <SelectItem value="+223">+223 (Mali)</SelectItem>
                                <SelectItem value="+225">+225 (Côte d'Ivoire)</SelectItem>
                                <SelectItem value="+226">+226 (Burkina Faso)</SelectItem>
                                <SelectItem value="+227">+227 (Niger)</SelectItem>
                                <SelectItem value="+228">+228 (Togo)</SelectItem>
                                <SelectItem value="+229">+229 (Bénin)</SelectItem>
                                <SelectItem value="+231">+231 (Liberia)</SelectItem>
                                <SelectItem value="+232">+232 (Sierra Leone)</SelectItem>
                                <SelectItem value="+233">+233 (Ghana)</SelectItem>
                                <SelectItem value="+234">+234 (Nigeria)</SelectItem>
                                <SelectItem value="+235">+235 (Tchad)</SelectItem>
                                <SelectItem value="+236">+236 (République Centrafricaine)</SelectItem>
                                <SelectItem value="+237">+237 (Cameroun)</SelectItem>
                                <SelectItem value="+238">+238 (Cap-Vert)</SelectItem>
                                <SelectItem value="+239">+239 (São Tomé-et-Príncipe)</SelectItem>
                                <SelectItem value="+241">+241 (Gabon)</SelectItem>
                                <SelectItem value="+243">+243 (République Démocratique du Congo)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input id="signup-phone" type="tel" placeholder="Numéro de téléphone" value={signupPhoneNumber} onChange={(e) => setSignupPhoneNumber(e.target.value)} required className="ml-2 bg-white text-gray-900 border-gray-300 focus:ring-gray-500 flex-1"/>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-password" className="text-gray-700">Mot de passe</Label>
                          <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className="bg-white text-gray-900 border-gray-300 focus:ring-gray-500"/>
                        </div>
                        <Button type="submit" disabled={loading} className={`w-full bg-${currentProject.color} hover:bg-${currentProject.color.replace('500', '600')} text-white font-bold py-6 text-lg`}>
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