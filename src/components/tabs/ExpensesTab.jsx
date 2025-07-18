import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ExpensesTab = ({ expenses, onAddExpenseClick, onEditExpenseClick, onDeleteExpenseClick }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestion des Dépenses</CardTitle>
          <Button onClick={onAddExpenseClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Dépense
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Catégorie</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Montant</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b">
                  <td className="py-3 px-4 text-muted-foreground">{new Date(expense.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4">{expense.description}</td>
                  <td className="py-3 px-4 text-muted-foreground">{expense.category}</td>
                  <td className="py-3 px-4 text-right font-medium">{Number(expense.amount).toLocaleString('fr-FR')} F CFA</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => onEditExpenseClick(expense)} className="text-primary hover:bg-primary/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDeleteExpenseClick(expense.id)} className="text-destructive hover:bg-destructive/10">
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

export default ExpensesTab;