import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, CalendarPlus, MessageSquare, KeyRound, User, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import GrantDaysDialog from '@/components/fichiers/dialogs/GrantDaysDialog';
import SendMessageDialog from '@/components/fichiers/dialogs/SendMessageDialog';

const StreamingUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isGrantDaysOpen, setGrantDaysOpen] = useState(false);
  const [isSendMessageOpen, setSendMessageOpen] = useState(false);
  const [resetInfo, setResetInfo] = useState({ show: false, code: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les utilisateurs." });
    } else {
      setUsers(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleResetPassword = async (userId) => {
    const { data, error } = await supabase.functions.invoke('admin-reset-user-password', {
      body: { userId },
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `La réinitialisation a échoué: ${error.message}` });
    } else {
      setResetInfo({ show: true, code: data.resetCode });
      fetchUsers();
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Actif</Badge>;
      case 'inactive':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Inactif</Badge>;
      case 'pending_approval':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />En attente</Badge>;
      case 'reset_pending':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><AlertTriangle className="mr-1 h-3 w-3" />Réinitialisation</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderSubscriptionInfo = (user) => {
    if (user.role === 'admin') {
      return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">Admin</Badge>;
    }
    if (user.subscription_expires_at) {
      const expiryDate = new Date(user.subscription_expires_at);
      const isExpired = expiryDate < new Date();
      const distance = formatDistanceToNow(expiryDate, { addSuffix: true, locale: fr });
      
      return (
        <div className="flex flex-col">
          <span className={isExpired ? 'text-red-500' : 'text-green-600'}>
            {isExpired ? 'Expiré' : 'Expire'} {distance}
          </span>
          <span className="text-xs text-gray-400">
            ({format(expiryDate, 'dd/MM/yyyy', { locale: fr })})
          </span>
        </div>
      );
    }
    return <Badge variant="destructive">Aucun abonnement</Badge>;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><User className="mr-2 h-4 w-4 inline-block" />Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Abonnement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center p-8">Chargement des utilisateurs...</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-gray-400">{user.username}</div>
                  </TableCell>
                  <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'outline'} className={user.role === 'admin' ? 'bg-red-600' : ''}>{user.role}</Badge></TableCell>
                  <TableCell>{renderStatusBadge(user.status)}</TableCell>
                  <TableCell>{renderSubscriptionInfo(user)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                        <DropdownMenuItem onSelect={() => { setSelectedUser(user); setGrantDaysOpen(true); }} className="cursor-pointer">
                          <CalendarPlus className="mr-2 h-4 w-4 text-blue-400" />
                          <span>Accorder des jours</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setSelectedUser(user); setSendMessageOpen(true); }} className="cursor-pointer">
                          <MessageSquare className="mr-2 h-4 w-4 text-green-400" />
                          <span>Envoyer un message</span>
                        </DropdownMenuItem>
                        {user.role !== 'admin' && (
                          <>
                            <DropdownMenuSeparator className="bg-gray-600"/>
                            <DropdownMenuItem onSelect={() => handleResetPassword(user.id)} className="cursor-pointer">
                              <KeyRound className="mr-2 h-4 w-4 text-purple-400" />
                              <span>Réinitialiser MDP</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <>
          <GrantDaysDialog
            isOpen={isGrantDaysOpen}
            setIsOpen={setGrantDaysOpen}
            user={selectedUser}
            onSuccess={fetchUsers}
          />
          <SendMessageDialog
            isOpen={isSendMessageOpen}
            setIsOpen={setSendMessageOpen}
            recipientId={selectedUser.id}
          />
        </>
      )}

      <AlertDialog open={resetInfo.show} onOpenChange={(open) => !open && setResetInfo({ show: false, code: '' })}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Code de réinitialisation généré !</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Veuillez communiquer le code de réinitialisation suivant à l'utilisateur de manière sécurisée. Ce code est valable 15 minutes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-4 bg-gray-800 rounded-md">
            <p className="text-2xl font-mono font-bold text-center tracking-widest">{resetInfo.code}</p>
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(resetInfo.code);
              toast({ title: 'Copié !', description: 'Le code a été copié dans le presse-papiers.' });
            }}>Copier le code</Button>
            <AlertDialogCancel className="bg-gray-700 border-gray-600 hover:bg-gray-600">Fermer</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StreamingUserManagement;