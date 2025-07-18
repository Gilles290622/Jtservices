import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';

const CustomersTab = ({ customers, onAddCustomerClick, onEditCustomerClick, onDeleteCustomerClick }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestion des Clients</CardTitle>
          <Button onClick={onAddCustomerClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Client
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Nom</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Téléphone</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Solde</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b">
                  <td className="py-3 px-4">{customer.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{customer.email}</td>
                  <td className="py-3 px-4 text-muted-foreground">{customer.phone}</td>
                  <td className={`py-3 px-4 text-right font-bold ${customer.balance > 0 ? 'text-destructive' : 'text-primary'}`}>
                    {Number(customer.balance).toLocaleString('fr-FR')} F CFA
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-1">
                       <Button asChild size="icon" variant="ghost" className="text-blue-600 hover:bg-blue-400/10" title="Relevé Client">
                        <Link to={`/customer-statement/${customer.id}`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onEditCustomerClick(customer)} className="text-primary hover:bg-primary/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDeleteCustomerClick(customer.id)} className="text-destructive hover:bg-destructive/10">
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

export default CustomersTab;