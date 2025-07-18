import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ProductDialog = ({ open, onOpenChange, onSave, editingProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    min_stock: ''
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price,
        stock: editingProduct.stock,
        min_stock: editingProduct.min_stock
      });
    } else {
      setFormData({ name: '', category: '', price: '', stock: '', min_stock: '' });
    }
  }, [editingProduct, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      min_stock: parseInt(formData.min_stock)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
          <DialogDescription>
            {editingProduct ? "Modifiez les informations du produit ci-dessous." : "Remplissez les informations pour ajouter un nouveau produit."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Nom du produit</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Input id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="price">Prix (F CFA)</Label>
            <Input id="price" type="number" step="1" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="minStock">Stock minimum</Label>
            <Input id="minStock" type="number" value={formData.min_stock} onChange={(e) => setFormData({...formData, min_stock: e.target.value})} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit">{editingProduct ? 'Modifier' : 'Ajouter'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;