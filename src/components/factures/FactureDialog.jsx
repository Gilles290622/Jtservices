import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, PlusCircle, Trash2, UserPlus, List } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const FactureDialog = ({ open, onOpenChange, invoice, onSave, user, supabase }) => {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [clientMode, setClientMode] = useState('select'); // 'select' or 'create'
  const [newClientName, setNewClientName] = useState('');
  const [formData, setFormData] = useState({
    type: 'devis',
    status: 'draft',
    invoice_number: '',
    issue_date: new Date(),
    due_date: null,
    client_id: null,
    total_amount: 0,
    items: [{ description: '', quantity: 1, unit_price: 0 }]
  });

  useEffect(() => {
    const fetchClients = async () => {
      if (!user || !supabase) return;
      const { data, error } = await supabase.from('factures_clients').select('*').eq('user_id', user.id);
      if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les clients.' });
      } else {
        setClients(data);
      }
    };
    if (open) {
      fetchClients();
    }
  }, [user, toast, open, supabase]);

  useEffect(() => {
    if (invoice) {
      setClientMode('select');
      const fetchItems = async () => {
        if (!supabase) return;
        const { data: items, error } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoice.id);
        if (error) {
          console.error("Error fetching items", error);
          setFormData({
            ...invoice,
            issue_date: new Date(invoice.issue_date),
            due_date: invoice.due_date ? new Date(invoice.due_date) : null,
            items: [],
          });
        } else {
          setFormData({
            ...invoice,
            issue_date: new Date(invoice.issue_date),
            due_date: invoice.due_date ? new Date(invoice.due_date) : null,
            items: items.length > 0 ? items : [{ description: '', quantity: 1, unit_price: 0 }],
          });
        }
      };
      fetchItems();
    } else {
      setClientMode('select');
      setNewClientName('');
      setFormData({
        type: 'devis',
        status: 'draft',
        invoice_number: `DOC-${Date.now().toString().slice(-6)}`,
        issue_date: new Date(),
        due_date: null,
        client_id: null,
        total_amount: 0,
        items: [{ description: '', quantity: 1, unit_price: 0 }]
      });
    }
  }, [invoice, open, supabase]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index][name] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);
  }, [formData.items]);

  const handleSubmit = () => {
    const dataToSave = {
      ...formData,
      total_amount: totalAmount,
      user_id: user.id,
      new_client_name: clientMode === 'create' ? newClientName : null,
    };
    onSave(dataToSave);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Modifier le document' : 'Créer un nouveau document'}</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour {invoice ? 'modifier' : 'créer'} votre devis ou facture.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Numéro</Label>
              <Input id="invoice_number" name="invoice_number" value={formData.invoice_number} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="devis">Devis</SelectItem>
                  <SelectItem value="facture">Facture</SelectItem>
                  <SelectItem value="proforma">Facture Proforma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue_date">Date d'émission</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issue_date ? format(formData.issue_date, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.issue_date} onSelect={(date) => setFormData(prev => ({ ...prev, issue_date: date }))} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Date d'échéance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.due_date} onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))} /></PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_id">Client</Label>
            <div className="flex items-center gap-2">
              {clientMode === 'select' ? (
                <Select value={formData.client_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                  <SelectTrigger className="flex-grow"><SelectValue placeholder="Sélectionner un client existant" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(client => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input 
                  placeholder="Nom du nouveau client" 
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="flex-grow"
                />
              )}
              <Button variant="outline" size="icon" onClick={() => setClientMode(prev => prev === 'select' ? 'create' : 'select')}>
                {clientMode === 'select' ? <UserPlus className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-lg font-semibold">Articles</Label>
              <Button variant="outline" size="sm" onClick={addItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une ligne
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Description</TableHead>
                    <TableHead>Qté</TableHead>
                    <TableHead>Prix Unitaire</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input name="description" placeholder="Description de l'article" value={item.description} onChange={(e) => handleItemChange(index, e)} className="w-full" />
                      </TableCell>
                      <TableCell>
                        <Input name="quantity" type="number" placeholder="1" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className="w-20" />
                      </TableCell>
                      <TableCell>
                        <Input name="unit_price" type="number" placeholder="1000" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} className="w-32" />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={formData.items.length <= 1}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <div className="text-right">
              <p className="text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit}>Sauvegarder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FactureDialog;