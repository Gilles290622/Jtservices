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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ProcurementDialog = ({ open, onOpenChange, onSave, suppliers, products }) => {
  const { toast } = useToast();
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([]);
  const [amountPaid, setAmountPaid] = useState('');
  
  const [lineItem, setLineItem] = useState({ productId: '', quantity: '1', purchase_price: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const resetDialog = () => {
    setSupplierId('');
    setItems([]);
    setAmountPaid('');
    setLineItem({ productId: '', quantity: '1', purchase_price: '' });
    setSelectedProduct(null);
  };
  
  useEffect(() => {
    if (open) {
      resetDialog();
    }
  }, [open]);

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setLineItem(prev => ({ ...prev, productId: productId, purchase_price: product ? (product.price * 0.75).toFixed(0) : '' })); // Suggest a purchase price
  };

  const handleAddLineItem = () => {
    if (!lineItem.productId || !lineItem.quantity || !lineItem.purchase_price) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs de l\'article.', variant: 'destructive' });
      return;
    }
    const product = products.find(p => p.id === lineItem.productId);
    setItems([...items, { ...lineItem, productName: product.name, id: Date.now() }]);
    setLineItem({ productId: '', quantity: '1', purchase_price: '' });
    setSelectedProduct(null);
  };
  
  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un fournisseur.', variant: 'destructive' });
      return;
    }
    if (items.length === 0) {
      toast({ title: 'Erreur', description: 'Veuillez ajouter au moins un article.', variant: 'destructive' });
      return;
    }

    onSave({
      supplier_id_in: supplierId,
      items_in: items.map(({ productId, quantity, purchase_price }) => ({
        product_id: productId,
        quantity: parseInt(quantity, 10),
        purchase_price: parseFloat(purchase_price)
      })),
      amount_paid_in: parseFloat(amountPaid) || 0
    });
  };

  const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.purchase_price), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvel Approvisionnement</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour enregistrer une nouvelle entrée de stock.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div>
            <Label htmlFor="supplier">Fournisseur</Label>
            <Select onValueChange={setSupplierId} value={supplierId}>
              <SelectTrigger id="supplier">
                <SelectValue placeholder="Sélectionner un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold">Ajouter un article</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div className="md:col-span-2">
                <Label>Produit</Label>
                <Select onValueChange={handleProductSelect} value={lineItem.productId}>
                  <SelectTrigger><SelectValue placeholder="Choisir..."/></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantité</Label>
                <Input type="number" min="1" value={lineItem.quantity} onChange={e => setLineItem({...lineItem, quantity: e.target.value})} />
              </div>
              <div>
                <Label>Prix d'achat</Label>
                <Input type="number" step="1" value={lineItem.purchase_price} onChange={e => setLineItem({...lineItem, purchase_price: e.target.value})} />
              </div>
            </div>
            <Button type="button" size="sm" onClick={handleAddLineItem}><Plus className="h-4 w-4 mr-2" />Ajouter au lot</Button>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Articles de l'approvisionnement</h4>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-muted p-2 rounded">
                  <p>{item.productName} ({item.quantity} x {Number(item.purchase_price).toLocaleString('fr-FR')} F CFA)</p>
                  <div className="flex items-center">
                    <p className="font-medium mr-4">{(item.quantity * item.purchase_price).toLocaleString('fr-FR')} F CFA</p>
                    <Button size="icon" variant="ghost" type="button" onClick={() => handleRemoveItem(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-muted-foreground text-center">Aucun article ajouté.</p>}
            </div>
          </div>
          
          <div className="border-t pt-4 space-y-4">
             <div className="flex justify-end items-center text-lg font-bold">
              Total: <span className="ml-2 text-primary">{totalAmount.toLocaleString('fr-FR')} F CFA</span>
            </div>
            <div>
              <Label htmlFor="amountPaid">Montant Payé (Optionnel)</Label>
              <Input id="amountPaid" type="number" step="1" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="0" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit">Enregistrer l'approvisionnement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProcurementDialog;