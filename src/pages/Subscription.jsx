import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, ExternalLink, PartyPopper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  const paymentLink = "https://pay.wave.com/m/M_ci_y9beit5q7GUj/c/ci/?amount=2500";
  const subscriptionAmount = 2500;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_expires_at, created_at')
          .eq('id', user.id)
          .single();

        if (profileData) setProfile(profileData);
        if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error fetching profile", profileError);
        }

        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (subError) {
          console.error("Error fetching pending subscription:", subError);
        } else if (subData && subData.length > 0) {
          setPendingSubscription(subData[0]);
        } else {
          setPendingSubscription(null);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handlePaymentConfirmation = async () => {
    setLoading(true);
    const { error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      amount: subscriptionAmount,
      transaction_id: transactionId,
      status: 'pending',
    });

    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `Une erreur est survenue: ${error.message}` });
    } else {
      toast({ title: 'Confirmation reçue !', description: 'Votre paiement est en cours de vérification par un administrateur.' });
      const { data: subData, error: subError } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(1);
      if (subError) {
        console.error("Error fetching pending subscription after submit:", subError);
      } else if (subData && subData.length > 0) {
        setPendingSubscription(subData[0]);
      }
    }
  };

  const isExpired = !profile || !profile.subscription_expires_at || new Date(profile.subscription_expires_at) < new Date();
  const expiryDate = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const isTransactionIdValid = /^[A-Z0-9]{17}$/.test(transactionId);

  return (
    <>
      <Helmet>
        <title>Abonnement - JTS Fichiers</title>
      </Helmet>
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-200 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-600">Période d'essai et Abonnement</CardTitle>
            <CardDescription>Activez votre abonnement pour un accès illimité après votre période d'essai.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile && (
              <Alert variant={isExpired ? 'destructive' : 'default'} className={!isExpired ? 'bg-green-50 border-green-200' : ''}>
                {isExpired ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                <AlertTitle className={!isExpired ? 'text-green-800' : ''}>
                  {isExpired ? 'Votre période d\'essai est terminée ou votre abonnement a expiré' : 'Votre compte est actif'}
                </AlertTitle>
                <AlertDescription className={!isExpired ? 'text-green-700' : ''}>
                  {isExpired
                    ? `Veuillez payer pour activer ou renouveler votre compte.`
                    : `Votre accès expirera ${formatDistanceToNow(expiryDate, { locale: fr, addSuffix: true })}.`}
                </AlertDescription>
              </Alert>
            )}

            {pendingSubscription ? (
              <Alert className="bg-yellow-50 border-yellow-200 text-center p-6">
                <PartyPopper className="h-10 w-10 text-yellow-600 mx-auto mb-4" />
                <AlertTitle className="text-yellow-800 text-xl font-bold">Confirmation reçue !</AlertTitle>
                <AlertDescription className="text-yellow-700 mt-2">
                  Votre paiement est en cours de vérification. L'accès à votre compte sera activé sous peu. Merci de votre patience !
                </AlertDescription>
              </Alert>
            ) : (
              <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                <h3 className="font-semibold text-center text-lg">Paiement de l'abonnement (30 jours)</h3>
                <p className="text-center text-2xl font-bold text-blue-600">{subscriptionAmount.toLocaleString('fr-FR')} XOF</p>
                
                <Button onClick={() => window.open(paymentLink, '_blank')} className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-bold text-lg py-6">
                  <span className="font-mono mr-2">WAVE</span> Étape 1: Payer maintenant
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>

                <div className="space-y-2 pt-4">
                  <Label htmlFor="transaction-id" className="text-center block text-sm font-medium text-slate-700">
                    Entrez le numéro de transaction (17 caractères)
                  </Label>
                  <Input
                    id="transaction-id"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    maxLength={17}
                    placeholder="EX: ABC123DEF456GHI78"
                    className="text-center font-mono tracking-widest"
                  />
                </div>

                <div className="text-center text-sm text-slate-500 mt-2">Après avoir payé et entré le numéro, confirmez ci-dessous.</div>

                <Button onClick={handlePaymentConfirmation} disabled={loading || !isTransactionIdValid} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {loading ? 'Confirmation...' : 'Étape 2: Confirmer le paiement'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SubscriptionPage;