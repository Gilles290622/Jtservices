import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

const SendMessageDialog = ({ isOpen, setIsOpen, recipientId, recipientName, recipientRole }) => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSend = async () => {
        if (!message.trim()) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Le message ne peut pas être vide.' });
            return;
        }
        setLoading(true);

        let error;

        if (recipientId) {
            const { error: insertError } = await supabase.from('notifications').insert({
                sender_id: user.id,
                recipient_id: recipientId,
                message: message.trim()
            });
            error = insertError;
        } else if (recipientRole === 'admin') {
            const { error: rpcError } = await supabase.rpc('send_message_to_admins', {
                message_content: message.trim()
            });
            error = rpcError;
        }

        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'envoyer la notification." });
        } else {
            toast({ title: 'Succès', description: 'Votre message a été envoyé.' });
            setMessage('');
            setIsOpen(false);
        }
        setLoading(false);
    };

    const getDialogTitle = () => {
        if (recipientName) return `Envoyer un message à ${recipientName}`;
        if (recipientRole === 'admin') return "Contacter l'administrateur";
        return "Envoyer un message";
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                    <DialogDescription>Votre message sera envoyé comme une notification.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Écrivez votre message ici..."
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
                    <Button onClick={handleSend} disabled={loading}>{loading ? 'Envoi...' : 'Envoyer'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SendMessageDialog;