import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Loader2, Star, CreditCard, ExternalLink, PartyPopper } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/streaming/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PricingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(null);
  const [transactionIds, setTransactionIds] = useState({});
  const [pendingSubscriptions, setPendingSubscriptions] = useState({});

  useEffect(() => {
    const fetchProductsAndPendingSubs = async () => {
      setLoading(true);
      const { data: productsData, error: productsError } = await supabase
        .from('subscription_products')
        .select(`
          *,
          prices:subscription_prices(*)
        `)
        .eq('active', true)
        .eq('prices.active', true)
        .order('unit_amount', { foreignTable: 'subscription_prices' });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les forfaits.' });
      } else {
        setProducts(productsData);
      }

      if (user) {
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'pending');
        
        if (subError) {
          console.error("Error fetching pending subscriptions:", subError);
        } else if (subData) {
          const pending = subData.reduce((acc, sub) => {
            acc[sub.amount] = true;
            return acc;
          }, {});
          setPendingSubscriptions(pending);
        }
      }
      setLoading(false);
    };
    fetchProductsAndPendingSubs();
  }, [toast, user]);

  const handleStripeSubscribe = (priceId) => {
    setIsSubscribing(priceId);
    toast({
      title: '🚧 Bientôt disponible !',
      description: "La redirection vers le paiement Stripe sera implémentée prochainement.",
    });
    setTimeout(() => setIsSubscribing(null), 2000);
  };

  const handleWavePay = (waveLink) => {
    window.open(waveLink, '_blank');
  };

  const handleTransactionIdChange = (productId, value) => {
    setTransactionIds(prev => ({ ...prev, [productId]: value.toUpperCase().replace(/[^A-Z0-9]/g, '') }));
  };

  const handlePaymentConfirmation = async (product) => {
    const price = product.prices[0];
    const transactionId = transactionIds[product.id];
    setIsSubscribing(price.id);

    const { error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      amount: price.unit_amount,
      transaction_id: transactionId,
      status: 'pending',
    });

    setIsSubscribing(null);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `Une erreur est survenue: ${error.message}` });
    } else {
      toast({ title: 'Confirmation reçue !', description: 'Votre paiement est en cours de vérification.' });
      setPendingSubscriptions(prev => ({ ...prev, [price.unit_amount]: true }));
      setTransactionIds(prev => ({ ...prev, [product.id]: '' }));
    }
  };

  const features = [
    'Accès illimité à tout le catalogue',
    'Streaming en haute définition',
    'Regardez sur tous vos appareils',
    'Sans publicité',
  ];

  return (
    <>
      <Helmet>
        <title>Nos Forfaits - La Foi Streaming</title>
        <meta name="description" content="Choisissez le forfait qui vous convient et commencez à regarder dès aujourd'hui." />
      </Helmet>
      <div className="bg-black min-h-screen text-white">
        <Header />
        <div className="pt-24 md:pt-32 pb-16 px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Choisissez votre forfait</h1>
            <p className="mt-4 text-lg text-gray-300">Rejoignez-nous dès aujourd'hui. Annulez à tout moment.</p>
          </div>

          {loading ? (
            <div className="flex justify-center mt-16">
              <Loader2 className="h-12 w-12 animate-spin text-red-600" />
            </div>
          ) : (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {products.map((product) => {
                const price = product.prices[0];
                const isPopular = product.name.toLowerCase().includes('annuel');
                const transactionId = transactionIds[product.id] || '';
                const isTransactionIdValid = /^[A-Z0-9]{17}$/.test(transactionId);
                const isPending = pendingSubscriptions[price.unit_amount];

                return (
                  <Card key={product.id} className={`bg-gray-900/50 border-gray-700 relative overflow-hidden flex flex-col ${isPopular ? 'border-red-500 border-2' : ''}`}>
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                        <Star className="h-4 w-4" /> POPULAIRE
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-3xl font-bold">{product.name}</CardTitle>
                      <CardDescription className="text-gray-400">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full flex-grow">
                      <div className="text-center my-4">
                        <span className="text-5xl font-extrabold">{(price.unit_amount / 100).toLocaleString('fr-FR')}</span>
                        <span className="text-gray-400"> XOF / {price.interval === 'month' ? 'mois' : 'an'}</span>
                      </div>
                      <ul className="space-y-3 my-6 flex-grow">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <Check className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {isPending ? (
                        <Alert className="bg-yellow-900/50 border-yellow-700 text-center p-4 mt-auto">
                          <PartyPopper className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                          <AlertTitle className="text-yellow-300 font-bold">Paiement en attente</AlertTitle>
                          <AlertDescription className="text-yellow-400 text-sm">
                            Votre paiement est en cours de vérification.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Tabs defaultValue="stripe" className="w-full mt-auto">
                          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                            <TabsTrigger value="stripe">Carte Bancaire</TabsTrigger>
                            <TabsTrigger value="wave">Wave</TabsTrigger>
                          </TabsList>
                          <TabsContent value="stripe" className="mt-4">
                             <Button
                                onClick={() => handleStripeSubscribe(price.id)}
                                disabled={isSubscribing === price.id}
                                className="w-full py-6 text-lg font-bold bg-white text-black hover:bg-gray-200"
                              >
                                {isSubscribing === price.id ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CreditCard className="mr-2 h-6 w-6" /> Payer via Stripe</>}
                              </Button>
                          </TabsContent>
                          <TabsContent value="wave" className="mt-4 space-y-4">
                            <Button onClick={() => handleWavePay(product.wave_payment_link)} className="w-full bg-cyan-400 text-black hover:bg-cyan-500 font-bold text-lg py-6">
                              <span className="font-mono mr-2">WAVE</span> Étape 1: Payer
                              <ExternalLink className="ml-2 h-5 w-5" />
                            </Button>
                            <div className="space-y-2 pt-2">
                              <Label htmlFor={`transaction-id-${product.id}`} className="text-center block text-sm font-medium text-gray-300">
                                Étape 2: Entrez l'ID de transaction
                              </Label>
                              <Input
                                id={`transaction-id-${product.id}`}
                                value={transactionId}
                                onChange={(e) => handleTransactionIdChange(product.id, e.target.value)}
                                maxLength={17}
                                placeholder="ID de 17 caractères"
                                className="text-center font-mono tracking-widest bg-gray-800 border-gray-600"
                              />
                            </div>
                            <Button onClick={() => handlePaymentConfirmation(product)} disabled={isSubscribing === price.id || !isTransactionIdValid} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg">
                              {isSubscribing === price.id ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Check className="mr-2 h-5 w-5" /> Étape 3: Confirmer</>}
                            </Button>
                          </TabsContent>
                        </Tabs>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PricingPage;