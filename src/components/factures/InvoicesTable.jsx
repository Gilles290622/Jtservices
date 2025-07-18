import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, FileText, Edit, Trash2 } from 'lucide-react';

const getStatusBadge = (status) => {
  const variants = {
    draft: 'secondary',
    sent: 'default',
    paid: 'success',
    cancelled: 'destructive',
    pending: 'warning'
  };
  const text = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    paid: 'Payé',
    cancelled: 'Annulé',
    pending: 'En attente'
  }
  return <Badge variant={variants[status] || 'outline'}>{text[status] || status}</Badge>;
};

const InvoicesTable = ({ loading, invoices, clients, searchQuery, onPreview, onEdit, onDelete }) => {
  if (loading) {
    return <p className="text-center py-8 text-muted-foreground">Chargement des données...</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Numéro</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
            <th className="text-right p-4 font-medium text-muted-foreground">Montant</th>
            <th className="text-center p-4 font-medium text-muted-foreground">Statut</th>
            <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b hover:bg-muted">
              <td className="p-4 capitalize">{invoice.type}</td>
              <td className="p-4 font-medium">{invoice.invoice_number}</td>
              <td className="p-4">{clients[invoice.client_id]?.name || 'N/A'}</td>
              <td className="p-4 text-muted-foreground">{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</td>
              <td className="p-4 text-right font-medium">{Number(invoice.total_amount).toLocaleString('fr-FR')} F CFA</td>
              <td className="p-4 text-center">{getStatusBadge(invoice.status)}</td>
              <td className="p-4 text-center">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onPreview(invoice)}>
                        <FileText className="mr-2 h-4 w-4" /> Aperçu
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(invoice)}>
                        <Edit className="mr-2 h-4 w-4" /> Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible et supprimera définitivement ce document.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(invoice.id)} variant="destructive">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invoices.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          {searchQuery ? "Aucun document ne correspond à votre recherche." : "Aucun document créé."}
        </p>
      )}
    </div>
  );
};

export default InvoicesTable;