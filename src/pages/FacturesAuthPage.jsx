import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';

const FacturesAuthPage = () => {
  // States for signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  
  // States for login form
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/factures';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    let loginEmail = identifier;

    // If identifier does not look like an email, assume it's a username
    if (!identifier.includes('@')) {
      const { data, error: rpcError } = await supabase.rpc('get_email_from_username', {
        p_username: identifier,
      });

      if (rpcError || !data) {
        setLoading(false);
        toast({ variant: 'destructive', title: 'Erreur de connexion', description: "Identifiant ou mot de passe incorrect." });
        console.error("Error fetching email from username:", rpcError);
        return;
      }
      loginEmail = data;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur de connexion', description: "Identifiant ou mot de passe incorrect." });
    } else {
      toast({ title: 'Connexion réussie', description: 'Vous êtes maintenant connecté.' });
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
          project_type: 'factures',
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur d\'inscription', description: error.message });
    } else {
      toast({ title: 'Inscription réussie', description: 'Veuillez vérifier votre e-mail pour confirmer votre compte.' });
      navigate(from, { replace: true });
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  return (
    <>
      <Helmet>
        <title>Authentification - Factures</title>
        <meta name="description" content="Connectez-vous ou inscrivez-vous pour accéder au module de facturation." />
      </Helmet>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <Link to="/" className="absolute top-8 left-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          &larr; Retour à l'accueil
        </Link>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md mx-auto shadow-2xl border-indigo-500/50">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center mb-4">
                <FileText className="h-12 w-12 text-indigo-500" />
              </div>
              <CardTitle className="text-3xl font-bold">Projet Factures</CardTitle>
              <CardDescription>Accédez à votre espace de facturation</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Se connecter</TabsTrigger>
                  <TabsTrigger value="signup">S'inscrire</TabsTrigger>
                </TabsList>
                <AnimatePresence mode="wait">
                  <TabsContent value="login">
                    <motion.form
                      key="login"
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      onSubmit={handleLogin}
                      className="space-y-4 mt-4"
                    >
                      <div className="space-y-1">
                        <Label htmlFor="login-identifier">Email ou Nom d'utilisateur</Label>
                        <Input id="login-identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="login-password">Mot de passe</Label>
                        <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                      </Button>
                    </motion.form>
                  </TabsContent>
                  <TabsContent value="signup">
                    <motion.form
                      key="signup"
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      onSubmit={handleSignup}
                      className="space-y-4 mt-4"
                    >
                      <div className="space-y-1">
                        <Label htmlFor="signup-fullname">Nom complet</Label>
                        <Input id="signup-fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signup-username">Nom d'utilisateur</Label>
                        <Input id="signup-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signup-password">Mot de passe</Label>
                        <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                        {loading ? 'Création du compte...' : 'S\'inscrire'}
                      </Button>
                    </motion.form>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default FacturesAuthPage;