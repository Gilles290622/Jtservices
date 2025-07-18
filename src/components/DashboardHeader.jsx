import React from 'react';
import { Box } from 'lucide-react';

const DashboardHeader = () => (
  <header className="mb-8">
    <div className="flex items-center space-x-3 mb-2">
      <Box className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold text-foreground">JTS Services - Caisse</h1>
    </div>
    <p className="text-muted-foreground">Bienvenue sur votre tableau de bord de gestion.</p>
  </header>
);

export default DashboardHeader;