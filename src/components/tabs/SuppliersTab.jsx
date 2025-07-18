import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';

const SuppliersTab = ({ suppliers, onAddSupplierClick, onEditSupplierClick, onDeleteSupplierClick }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestion des Fournisseurs</CardTitle>
          <Button onClick={onAddSupplierClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Fournisseur
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Nom</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Téléphone</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Email</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b">
                  <td className="py-3 px-4">{supplier.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{supplier.contact_person}</td>
                  <td className="py-3 px-4 text-muted-foreground">{supplier.phone}</td>
                  <td className="py-3 px-4 text-muted-foreground">{supplier.email}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => onEditSupplierClick(supplier)} className="text-primary hover:bg-primary/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDeleteSupplierClick(supplier.id)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default SuppliersTab;