import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CreditCard, FolderKanban, Home, Video, ShoppingCart, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Re-using components from the 'fichiers' project for a unified admin experience
import UserManagement from '@/components/fichiers/UserManagement';
import StreamingUserManagement from '@/components/streaming/admin/StreamingUserManagement';
import CategoryManagement from '@/components/streaming/admin/CategoryManagement';
import VideoManagement from '@/components/streaming/admin/VideoManagement';
import StreamingSubscriptionManagement from '@/components/streaming/admin/StreamingSubscriptionManagement';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error && error.code !== 403 && error.error_code !== 'session_not_found') {
        toast({
            variant: "destructive",
            title: "Erreur de déconnexion",
            description: error.message || "Une erreur est survenue.",
        });
    } else {
        toast({ title: "Déconnexion réussie." });
    }
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Panneau Administrateur</title>
        <meta name="description" content="Gestion globale de JTS Services." />
      </Helmet>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin</h1>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/')}><Home className="mr-2 h-4 w-4" /> Accueil</Button>
                <Button variant="destructive" onClick={handleLogout}>Se déconnecter</Button>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Utilisateurs</TabsTrigger>
              <TabsTrigger value="lafoi"><Video className="mr-2 h-4 w-4" />La Foi</TabsTrigger>
              <TabsTrigger value="fichiers"><FolderKanban className="mr-2 h-4 w-4" />Fichiers</TabsTrigger>
              <TabsTrigger value="caisse"><ShoppingCart className="mr-2 h-4 w-4" />Caisse</TabsTrigger>
              <TabsTrigger value="factures"><FileText className="mr-2 h-4 w-4" />Factures</TabsTrigger>
              <TabsTrigger value="subscriptions"><CreditCard className="mr-2 h-4 w-4" />Abonnements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Utilisateurs (Tous Projets)</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lafoi" className="mt-6 space-y-6">
              <Card>
                <CardHeader><CardTitle>Gestion des Utilisateurs (La Foi)</CardTitle></CardHeader>
                <CardContent><StreamingUserManagement /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Gestion des Catégories</CardTitle></CardHeader>
                <CardContent><CategoryManagement /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Gestion des Vidéos</CardTitle></CardHeader>
                <CardContent><VideoManagement /></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fichiers" className="mt-6">
               <Card>
                <CardHeader><CardTitle>Gestion des Fichiers (Admin)</CardTitle></CardHeader>
                <CardContent><p>Le panneau d'administration pour la gestion des fichiers sera bientôt disponible ici.</p></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="caisse" className="mt-6">
               <Card>
                <CardHeader><CardTitle>Gestion de la Caisse (Admin)</CardTitle></CardHeader>
                <CardContent><p>Le panneau d'administration pour la caisse sera bientôt disponible ici.</p></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="factures" className="mt-6">
               <Card>
                <CardHeader><CardTitle>Gestion des Factures (Admin)</CardTitle></CardHeader>
                <CardContent><p>Le panneau d'administration pour les factures sera bientôt disponible ici.</p></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Gestion des Abonnements (Stripe)</CardTitle></CardHeader>
                <CardContent><StreamingSubscriptionManagement /></CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AdminPage;