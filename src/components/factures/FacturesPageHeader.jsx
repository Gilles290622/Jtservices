import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const FacturesPageHeader = ({ onNewDocument, profile }) => {
    const themeColor = profile?.theme_color || '#F59E0B';

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    Tableau de bord
                </h1>
                <p className="mt-1 text-lg" style={{ color: themeColor }}>
                    {profile?.tagline || 'Gérez vos devis et factures en toute simplicité.'}
                </p>
            </div>
            <Button onClick={onNewDocument} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Créer un document
            </Button>
        </div>
    );
};

export default FacturesPageHeader;