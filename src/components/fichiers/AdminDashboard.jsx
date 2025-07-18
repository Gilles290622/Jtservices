import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Users, BookOpen, ArchiveRestore } from 'lucide-react';
import UserManagement from '@/components/fichiers/UserManagement';
import Guide from '@/components/fichiers/Guide';
import DataRecovery from '@/components/fichiers/DataRecovery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = ({ user, onLogout }) => {
  return (
    <div className="container mx-auto p-4 sm:p-8 text-white">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-zinc-400">Connecté en tant que {user?.full_name || 'Admin'}</p>
        </div>
        <Button onClick={onLogout} variant="outline" className="bg-transparent border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </header>

      <main>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-800 mb-4">
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Gestion des Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="recovery">
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Récupération de Données
            </TabsTrigger>
            <TabsTrigger value="guide">
              <BookOpen className="mr-2 h-4 w-4" />
              Guide d'utilisation
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-zinc-200 flex items-center">
                  Utilisateurs inscrits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recovery">
             <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-zinc-200 flex items-center">
                  Récupérer les fichiers d'un utilisateur supprimé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataRecovery />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="guide">
             <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-zinc-200 flex items-center">
                  Guide pas-à-pas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Guide />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;