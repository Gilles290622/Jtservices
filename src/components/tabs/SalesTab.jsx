import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ChevronDown, Pencil, Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const SalesTab = ({ products, cart, setCart, createPendingSale, customers, sales, handleDeleteSaleRequest, requestLoadSaleToCart }) => {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [lineItem, setLineItem] = useState({ productId: null, quantity: 1, price: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedSaleId, setExpandedSaleId] = useState(null);
  const [editingCartItemId, setEditingCartItemId] = useState(null);
  const [editingItemData, setEditingItemData] = useState({ quantity: '1', price: '0' });

  useEffect(() => {
    if (cart.length === 0) {
      setSelectedCustomer(null);
    }
  }, [cart]);

  const todaysSales = useMemo(() => {
    if (!sales) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return sales.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= today && saleDate < tomorrow;
    });
  }, [sales]);

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setLineItem({
        productId: product.id,
        quantity: 1,
        price: product.price.toFixed(0),
      });
    } else {
      setSelectedProduct(null);
      setLineItem({ productId: null, quantity: 1, price: '' });
    }
  };

  const handleAddLineItemToCart = () => {
    if (!selectedProduct) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un produit.', variant: 'destructive' });
      return;
    }
    const quantity = parseInt(lineItem.quantity, 10);
    const price = parseFloat(lineItem.price);

    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: 'Erreur', description: 'La quantité doit être un nombre positif.', variant: 'destructive' });
      return;
    }
    if (isNaN(price) || price < 0) {
      toast({ title: 'Erreur', description: 'Le prix doit être un nombre positif.', variant: 'destructive' });
      return;
    }

    const totalInCart = cart
      .filter(item => item.id === selectedProduct.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (totalInCart + quantity > selectedProduct.stock) {
      toast({ title: 'Stock insuffisant', description: `Il ne reste que ${selectedProduct.stock - totalInCart} unités en stock.`, variant: 'destructive' });
      return;
    }

    const newItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      quantity: quantity,
      price: price,
      stock: selectedProduct.stock,
      cartItemId: `${selectedProduct.id}-${Date.now()}`
    };

    setCart([...cart, newItem]);
    toast({ title: "Produit ajouté", description: `${newItem.name} ajouté au panier.` });

    setSelectedProduct(null);
    setLineItem({ productId: null, quantity: 1, price: '' });
  };
  
  const handleRemoveFromCart = (cartItemIdToRemove) => {
    setCart(cart.filter((item) => item.cartItemId !== cartItemIdToRemove));
  };

  const handleCreateSale = () => {
    if (!selectedCustomer) {
        toast({
            title: 'Client requis',
            description: 'Veuillez sélectionner un client pour cette vente.',
            variant: 'destructive',
        });
        return;
    }
    createPendingSale(selectedCustomer);
    setSelectedCustomer(null);
  };
  
  const handleEditClick = (item) => {
    setEditingCartItemId(item.cartItemId);
    setEditingItemData({
        quantity: item.quantity,
        price: item.price
    });
  };

  const handleCancelEdit = () => {
      setEditingCartItemId(null);
  };

  const handleUpdateCartItem = (cartItemIdToUpdate) => {
      const newQuantity = parseInt(editingItemData.quantity, 10);
      const newPrice = parseFloat(editingItemData.price);
      
      if (isNaN(newQuantity) || newQuantity <= 0) {
          toast({ title: 'Erreur', description: 'La quantité doit être un nombre positif.', variant: 'destructive' });
          return;
      }
      if (isNaN(newPrice) || newPrice < 0) {
          toast({ title: 'Erreur', description: 'Le prix doit être un nombre positif.', variant: 'destructive' });
          return;
      }

      const itemToUpdate = cart.find(item => item.cartItemId === cartItemIdToUpdate);
      const productInStock = products.find(p => p.id === itemToUpdate.id);

      const otherItemsOfSameProductInCart = cart
          .filter(item => item.id === itemToUpdate.id && item.cartItemId !== cartItemIdToUpdate)
          .reduce((sum, item) => sum + item.quantity, 0);

      if (otherItemsOfSameProductInCart + newQuantity > productInStock.stock) {
        toast({ title: 'Stock insuffisant', description: `La quantité totale dans le panier (${otherItemsOfSameProductInCart + newQuantity}) dépasse le stock disponible (${productInStock.stock}).`, variant: 'destructive' });
        return;
      }

      setCart(cart.map(item =>
          item.cartItemId === cartItemIdToUpdate
              ? { ...item, quantity: newQuantity, price: newPrice }
              : item
      ));
      setEditingCartItemId(null);
      toast({ title: "Panier mis à jour", description: `${itemToUpdate.name} a été modifié.` });
  };

  const handleEditSale = (sale) => {
    setSelectedCustomer(sale.customer_id);
    requestLoadSaleToCart(sale);
  };


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle Vente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Client</Label>
            <Select onValueChange={setSelectedCustomer} value={selectedCustomer || ''}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="border-y py-4 my-4">
            <Label>Ajouter un article</Label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-1">
              <div className="md:col-span-2">
                <Select onValueChange={handleProductSelect} value={lineItem.productId || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un produit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0}>
                        {p.name} ({p.stock} en stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Qté"
                  min="1"
                  value={lineItem.quantity}
                  onChange={e => setLineItem({ ...lineItem, quantity: e.target.value })}
                  disabled={!selectedProduct}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Prix"
                  step="1"
                  value={lineItem.price}
                  onChange={e => setLineItem({ ...lineItem, price: e.target.value })}
                  disabled={!selectedProduct}
                />
              </div>
              <Button onClick={handleAddLineItemToCart} disabled={!selectedProduct} className="md:col-span-1">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Panier</h3>
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Le panier est vide</p>
          ) : (
            <>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto p-1">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between items-center bg-muted rounded p-3">
                    {editingCartItemId === item.cartItemId ? (
                      <>
                        <div className="flex-grow">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <Input type="number" value={editingItemData.quantity} onChange={e => setEditingItemData({...editingItemData, quantity: e.target.value})} className="w-20 h-8" />
                                <span className="text-muted-foreground">x</span>
                                <Input type="number" value={editingItemData.price} onChange={e => setEditingItemData({...editingItemData, price: e.target.value})} className="w-24 h-8" />
                                <span className="text-muted-foreground">F CFA</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Button size="icon" variant="ghost" onClick={() => handleUpdateCartItem(item.cartItemId)} className="text-green-500 hover:text-green-500 hover:bg-green-500/10">
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.quantity} x {Number(item.price).toLocaleString('fr-FR')} F CFA</p>
                        </div>
                        <div className="text-right flex items-center">
                          <p className="font-bold text-primary mr-4">{(item.quantity * item.price).toLocaleString('fr-FR')} F CFA</p>
                          <Button size="icon" variant="ghost" onClick={() => handleEditClick(item)} className="text-muted-foreground hover:text-muted-foreground hover:bg-muted/50">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleRemoveFromCart(item.cartItemId)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-foreground">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('fr-FR')} F CFA
                  </span>
                </div>
                <Button onClick={handleCreateSale} className="w-full">
                  Créer la vente
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transactions du Jour</CardTitle>
        </CardHeader>
        <CardContent>
          {todaysSales.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucune transaction pour aujourd'hui.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
              {todaysSales.map(sale => (
                <div key={sale.id} className="bg-muted rounded-lg transition-all duration-300">
                  <div 
                    className="flex justify-between items-center p-3 cursor-pointer"
                    onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}
                  >
                    <div>
                        <p className="font-medium">{sale.invoice_number} - {sale.customer_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{new Date(sale.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right flex items-center space-x-2">
                        <p className="font-bold text-sm w-28 text-right">{Number(sale.total).toLocaleString('fr-FR')} F CFA</p>
                        <Badge variant={sale.sale_status === 'validée' ? 'default' : 'secondary'} className="w-24 justify-center">{sale.sale_status}</Badge>
                        
                        {sale.sale_status === 'en attente' && (
                          <>
                            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditSale(sale); }} className="h-8 w-8 text-blue-500 hover:text-blue-500 hover:bg-blue-500/10">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteSaleRequest(sale.id); }} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${expandedSaleId === sale.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  {expandedSaleId === sale.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-8 pr-4 pb-3 pt-1 border-t border-background">
                        <h4 className="font-semibold text-sm mb-2 text-foreground">Détails des articles</h4>
                        <ul className="space-y-1">
                          {sale.sale_items.map(item => (
                            <li key={item.id} className="flex justify-between text-sm text-muted-foreground">
                              <span>{item.product_name} <span className="text-xs">x{item.quantity}</span></span>
                              <span>{(item.quantity * item.price).toLocaleString('fr-FR')} F CFA</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SalesTab;