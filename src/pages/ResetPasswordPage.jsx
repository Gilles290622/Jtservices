import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword.length < 6) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Le mot de passe doit contenir au moins 6 caractères.",
        });
        setLoading(false);
        return;
    }

    const { error } = await supabase.functions.invoke('user-confirm-password-reset', {
      body: { identifier, resetCode, newPassword }
    });
    
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de réinitialisation",
        description: error.message || "Une erreur est survenue.",
      });
    } else {
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.",
      });
      navigate('/fichiers');
    }
  };

  return (
    <>
      <Helmet>
        <title>Réinitialiser le mot de passe - JTS Fichiers</title>
      </Helmet>
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-200 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-sm shadow-lg border-none">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-blue-600">Réinitialiser le mot de passe</CardTitle>
              <CardDescription>Entrez votre email, le code fourni et votre nouveau mot de passe.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email ou Nom d'utilisateur</Label>
                  <Input 
                    id="email" 
                    type="text" 
                    placeholder="john.doe@exemple.com" 
                    value={identifier} 
                    onChange={(e) => setIdentifier(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-code">Code de réinitialisation</Label>
                  <Input 
                    id="reset-code" 
                    type="text" 
                    placeholder="######" 
                    value={resetCode} 
                    onChange={(e) => setResetCode(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </Button>
                <Button type="button" variant="link" className="w-full" onClick={() => navigate('/fichiers')}>
                  Retour à la connexion
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;