import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/lib/customSupabaseClient';
import ShareInterface from '@/components/fichiers/ShareInterface';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ShareDialog = ({ isOpen, setIsOpen, file }) => {
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && file) {
      const generateDirectSignedUrl = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.storage
            .from('jts-fichiers')
            .createSignedUrl(`${file.owner_id}/${file.id}`, 86400); 

          if (error) {
            throw error;
          }
          
          setFileUrl(data.signedUrl);

        } catch (error) {
          console.error("Failed to generate share link:", error);
          toast({
            variant: 'destructive',
            title: 'Erreur de partage',
            description: 'Impossible de générer le lien de partage direct.',
          });
          setIsOpen(false);
        } finally {
          setLoading(false);
        }
      };
      generateDirectSignedUrl();
    }
  }, [isOpen, file, toast, setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 w-full max-w-md">
        {loading ? (
          <div className="flex items-center justify-center h-48 bg-white rounded-2xl shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <ShareInterface fileUrl={fileUrl} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;