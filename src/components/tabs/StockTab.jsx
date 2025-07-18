import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';

const StockTab = ({ products, onAddProductClick, onEditProductClick, onDeleteProductClick }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestion du Stock</CardTitle>
          <Button onClick={onAddProductClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Produit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Nom</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Catégorie</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Prix de vente</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Stock</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Stock Min.</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{product.category}</td>
                  <td className="py-3 px-4 text-right font-medium">{Number(product.price).toLocaleString('fr-FR')} F CFA</td>
                  <td className={`py-3 px-4 text-right font-bold ${product.stock <= product.min_stock ? 'text-destructive' : 'text-green-600'}`}>
                    {product.stock}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{product.min_stock}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => onEditProductClick(product)} className="text-primary hover:bg-primary/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDeleteProductClick(product.id)} className="text-destructive hover:bg-destructive/10">
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

export default StockTab;