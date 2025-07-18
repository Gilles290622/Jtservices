import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Share } from 'lucide-react';

const DirectFileShare = ({ item }) => {
  const { toast } = useToast();
  const [isPreparing, setIsPreparing] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    if (isPreparing) return;
    
    setIsPreparing(true);
    toast({ title: 'Préparation du partage...', description: 'Veuillez patienter, téléchargement en cours.' });

    try {
      const { data: blob, error: downloadError } = await supabase.storage
        .from('jts-fichiers')
        .download(`${item.owner_id}/${item.id}`);

      if (downloadError) throw downloadError;

      const fileToShare = new File([blob], item.name, { type: item.mime_type });

      if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
        await navigator.share({
          files: [fileToShare],
          title: item.name,
          text: `Fichier partagé : ${item.name}`,
        });
      } else {
        toast({ variant: 'destructive', title: 'Non supporté', description: "Le partage de ce type de fichier n'est pas pris en charge." });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Échec du partage direct:", error);
        toast({ variant: 'destructive', title: 'Erreur de partage', description: error.message || 'Une erreur est survenue.' });
      }
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <DropdownMenuItem onSelect={handleShare} disabled={isPreparing}>
      <Share className="mr-2 h-4 w-4" />
      <span>{isPreparing ? 'Préparation...' : 'Partager fichier (natif)'}</span>
    </DropdownMenuItem>
  );
};

export default DirectFileShare;