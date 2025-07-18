import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getStatusVariant = (status) => {
  switch (status) {
    case 'Payée':
      return 'default';
    case 'Partiellement payée':
      return 'secondary';
    case 'Non payée':
      return 'destructive';
    default:
      return 'outline';
  }
};

const ProcurementsTab = ({ procurements, onAddProcurementClick }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestion des Approvisionnements</CardTitle>
          <Button onClick={onAddProcurementClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Approvisionnement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Fournisseur</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Montant Total</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Montant Payé</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {procurements.map((proc) => (
                <tr key={proc.id} className="border-b">
                  <td className="py-3 px-4 text-muted-foreground">{new Date(proc.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4">{proc.suppliers?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-right font-medium">{Number(proc.total_amount).toLocaleString('fr-FR')} F CFA</td>
                  <td className="py-3 px-4 text-right">{Number(proc.amount_paid).toLocaleString('fr-FR')} F CFA</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={getStatusVariant(proc.status)}>{proc.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default ProcurementsTab;