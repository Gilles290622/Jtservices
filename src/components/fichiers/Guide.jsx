import React from 'react';
import { Users, FolderKanban, Database, CheckCircle, Upload, Edit, Trash2 } from 'lucide-react';

const Guide = () => {
  return (
    <div className="space-y-6 text-slate-600">
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-blue-600 flex items-center">
          <Users className="mr-3 h-6 w-6" />
          1. Gestion des Utilisateurs
        </h2>
        <p className="mb-4">
          La section "Gestion des Utilisateurs" vous permet de voir et de gérer toutes les personnes inscrites sur la plateforme.
        </p>
        <div className="space-y-4 ml-6 pl-6 border-l-2 border-slate-300">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" />Approuver un nouvel utilisateur</h3>
            <p className="text-slate-500">Quand un nouvel utilisateur s'inscrit, son statut est "En attente". Vous verrez un bouton "Approuver" à côté de son nom. Cliquez dessus pour activer son compte. Il pourra alors se connecter.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Changer un rôle</h3>
            <p className="text-slate-500">Vous pouvez changer le rôle d'un utilisateur (de "Utilisateur" à "Admin" et vice-versa) en utilisant le menu déroulant dans la colonne "Rôle". Un administrateur a accès à ce tableau de bord.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-blue-600 flex items-center">
          <FolderKanban className="mr-3 h-6 w-6" />
          2. Utilisation du Gestionnaire de Fichiers
        </h2>
        <p className="mb-4">
          Le gestionnaire de fichiers est l'espace où les utilisateurs (y compris vous) peuvent stocker et organiser leurs documents. Chaque utilisateur a son propre espace privé.
        </p>
        <div className="space-y-4 ml-6 pl-6 border-l-2 border-slate-300">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center"><Upload className="text-sky-500 mr-2 h-5 w-5" />Téléverser des Fichiers</h3>
            <p className="text-slate-500">Utilisez le bouton "Téléverser" pour ouvrir une fenêtre où vous pouvez sélectionner un ou plusieurs fichiers depuis votre ordinateur.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center"><Edit className="text-yellow-500 mr-2 h-5 w-5" />Renommer</h3>
            <p className="text-slate-500">Cliquez sur les trois points à droite d'un fichier ou d'un dossier, puis sélectionnez "Renommer" pour lui donner un nouveau nom.</p>
          </div>
           <div>
            <h3 className="font-semibold text-slate-800 flex items-center"><Trash2 className="text-red-500 mr-2 h-5 w-5" />Supprimer</h3>
            <p className="text-slate-500">De la même manière, vous pouvez supprimer un fichier ou un dossier. Attention, cette action est irréversible.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-blue-600 flex items-center">
          <Database className="mr-3 h-6 w-6" />
          3. Les Tables dans Supabase
        </h2>
        <p className="mb-4">
          Votre application utilise plusieurs tables dans la base de données Supabase pour fonctionner. Voici les plus importantes :
        </p>
        <div className="space-y-4 ml-6 pl-6 border-l-2 border-slate-300">
          <div>
            <h3 className="font-semibold text-slate-800">`profiles`</h3>
            <p className="text-slate-500">Contient les informations des utilisateurs : nom d'utilisateur, rôle (`admin`/`user`) et statut (`active`/`pending`). C'est la table centrale pour la gestion des accès.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">`folders`</h3>
            <p className="text-slate-500">Stocke les informations sur les dossiers créés par les utilisateurs. Chaque dossier est lié à un propriétaire et peut avoir un dossier parent.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">`files`</h3>
            <p className="text-slate-500">Contient les métadonnées de chaque fichier téléversé (nom, taille, type) et le lie à un dossier et à un propriétaire. Les fichiers eux-mêmes sont dans le "Storage" de Supabase.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Guide;