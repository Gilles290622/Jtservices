import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-tomorrow.css'; 

const getLanguage = (mimeType = '') => {
  if (mimeType.includes('javascript')) return 'javascript';
  if (mimeType.includes('css')) return 'css';
  if (mimeType.includes('html') || mimeType.includes('xml')) return 'markup';
  if (mimeType.includes('json')) return 'json';
  if (mimeType.includes('sql')) return 'sql';
  return 'clike';
};

const TextPreviewDialog = ({ isOpen, setIsOpen, file }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const language = getLanguage(file?.mime_type);

  useEffect(() => {
    if (!isOpen || !file || !file.url) {
      return;
    }

    const fetchTextContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const textContent = await response.text();
        setContent(textContent);
      } catch (e) {
        setError('Impossible de charger le contenu du fichier.');
        console.error(e);
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger le contenu du fichier.' });
      } finally {
        setLoading(false);
      }
    };

    fetchTextContent();
  }, [isOpen, file, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl w-full flex flex-col h-[85vh]">
        <DialogHeader>
          <DialogTitle className="truncate">{file?.name}</DialogTitle>
          <DialogDescription>
            Aperçu du fichier texte.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow my-4 overflow-hidden border rounded-md">
            {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
            ) : error ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-50"><p className="text-red-500">{error}</p></div>
            ) : (
                <pre className="w-full h-full overflow-auto p-4 bg-[#2d2d2d] rounded-md">
                    <code 
                        className={`language-${language} font-mono text-sm`}
                        dangerouslySetInnerHTML={{ __html: highlight(content, languages[language] || languages.clike, language) }}
                    />
                </pre>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextPreviewDialog;