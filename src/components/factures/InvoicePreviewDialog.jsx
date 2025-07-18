import React, { useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Printer, Share2 } from 'lucide-react';
import InvoiceTemplate from '@/components/factures/InvoiceTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoicePreviewDialog = ({ invoice, client, items, profile, onOpenChange }) => {
  const { toast } = useToast();
  const invoiceTemplateRef = useRef();

  const generatePdf = async () => {
    const input = invoiceTemplateRef.current;
    if (!input) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Le modèle de facture est introuvable.' });
        return null;
    }

    const clone = input.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0px';
    clone.style.width = '794px'; 
    clone.style.height = 'auto';
    document.body.appendChild(clone);

    try {
        const canvas = await html2canvas(clone, {
          scale: 2, 
          useCORS: true,
          windowWidth: 794,
          width: 794,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasAspectRatio = canvasHeight / canvasWidth;
        
        let imgWidth = pdfWidth - 20;
        let imgHeight = imgWidth * canvasAspectRatio;
        
        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft > 0) {
            position = -heightLeft - 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);
        }
        
        return pdf;
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: 'destructive', title: 'Erreur PDF', description: "Une erreur est survenue lors de la génération du PDF." });
        return null;
    } finally {
        document.body.removeChild(clone);
    }
  };

  const handlePrint = async () => {
    const pdf = await generatePdf();
    if (pdf) {
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
    }
  };

  const handleShare = async () => {
    toast({ title: 'Préparation du partage...', description: 'Génération du PDF en cours.' });
    const pdf = await generatePdf();
    if (!pdf) return;
    
    const pdfBlob = pdf.output('blob');
    const pdfFile = new File([pdfBlob], `${invoice.type}-${invoice.invoice_number}.pdf`, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          title: `${invoice.type} ${invoice.invoice_number}`,
          text: `Voici le document ${invoice.type}: ${invoice.invoice_number} de la part de ${profile?.denomination || 'notre service'}.`,
          files: [pdfFile],
        });
        toast({ title: 'Succès', description: 'Document partagé.' });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast({ variant: 'destructive', title: 'Erreur de partage', description: error.message });
        }
      }
    } else {
      toast({ title: 'Partage non supporté', description: 'Téléchargement du PDF à la place.' });
      pdf.save(`${invoice.type}-${invoice.invoice_number}.pdf`);
    }
  };

  return (
    <Dialog open={!!invoice} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Aperçu du document</DialogTitle>
          <DialogDescription>
            Ceci est un aperçu de votre document. Vous pouvez l'imprimer ou le partager.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-auto bg-gray-200 dark:bg-gray-800 p-4 rounded-md flex justify-center items-start invoice-preview-container">
            <div ref={invoiceTemplateRef} className="w-[794px] flex-shrink-0 mx-auto">
                <InvoiceTemplate 
                    invoice={invoice} 
                    client={client} 
                    items={items}
                    profile={profile}
                />
            </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
          <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimer</Button>
          <Button onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Partager</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;