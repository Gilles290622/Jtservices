import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Download } from 'lucide-react';

const DataRecovery = () => {
  const [ownerId, setOwnerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const { toast } = useToast();

  const handleRecover = async () => {
    if (!ownerId) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Veuillez entrer l'ID de l'utilisateur.",
      });
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatusText("Initialisation...");

    try {
      // 1. Call the edge function to get signed URLs
      setStatusText('Récupération de la liste des fichiers...');
      const { data: files, error: functionError } = await supabase.functions.invoke('recover-orphaned-files', {
        body: { owner_id: ownerId },
      });

      if (functionError) throw new Error(`Erreur de la fonction Edge: ${functionError.message}`);
      if (!files || files.length === 0) {
        toast({
          variant: 'default',
          title: 'Information',
          description: 'Aucun fichier trouvé pour cet utilisateur.',
        });
        setLoading(false);
        return;
      }
      
      setStatusText(`Trouvé ${files.length} fichiers. Téléchargement en cours...`);
      setProgress(10);

      const zip = new JSZip();
      const totalFiles = files.length;

      // 2. Download each file
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setStatusText(`Téléchargement de ${file.name} (${i + 1}/${totalFiles})...`);
        
        try {
          // We fetch the file directly from the signed URL.
          // This relies on Supabase Storage setting correct CORS headers.
          const response = await fetch(file.signedURL);
          if (!response.ok) {
            throw new Error(`Échec du téléchargement de ${file.name}: ${response.statusText}`);
          }
          const blob = await response.blob();
          zip.file(file.name, blob);

        } catch (fetchError) {
          console.error(`Erreur lors du téléchargement de ${file.name}:`, fetchError);
          toast({
            variant: 'destructive',
            title: 'Erreur de téléchargement',
            description: `Impossible de télécharger ${file.name}. Il sera ignoré.`,
          });
        }
        
        setProgress(10 + Math.round(((i + 1) / totalFiles) * 80));
      }

      // 3. Generate and download the ZIP file
      setStatusText('Compression des fichiers en une archive ZIP...');
      setProgress(95);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      setStatusText('Téléchargement de l\'archive ZIP...');
      saveAs(zipBlob, `recuperation_${ownerId}.zip`);

      setProgress(100);
      setStatusText('Récupération terminée !');
      toast({
        title: 'Succès',
        description: 'Les fichiers ont été récupérés et téléchargés.',
      });

    } catch (error) {
      console.error("Erreur de récupération:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur de récupération',
        description: error.message || 'Une erreur inattendue est survenue.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Comment ça marche ?</AlertTitle>
        <AlertDescription>
          Cet outil vous permet de télécharger tous les fichiers d'un utilisateur supprimé. Vous devez fournir l'ID unique (UUID) de cet utilisateur. Vous pouvez trouver cet ID dans les logs de votre projet Supabase ou si vous l'aviez noté quelque part.
        </AlertDescription>
      </Alert>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="Entrez l'ID de l'utilisateur (UUID)"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          disabled={loading}
          className="bg-zinc-800 border-zinc-600 focus:ring-orange-500"
        />
        <Button onClick={handleRecover} disabled={loading}>
          {loading ? (
            'En cours...'
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Récupérer
            </>
          )}
        </Button>
      </div>
      {loading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">{statusText}</p>
        </div>
      )}
    </div>
  );
};

export default DataRecovery;