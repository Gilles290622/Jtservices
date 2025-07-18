
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/utils';
import { MoreHorizontal, Search, UserPlus, MessageSquare, Trash2, CheckCircle, XCircle, Clock, Star, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GrantDaysDialog from './dialogs/GrantDaysDialog';
import SendMessageDialog from './dialogs/SendMessageDialog';
import { differenceInDays } from 'date-fns';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isGrantDaysOpen, setGrantDaysOpen] = useState(false);
  const [isSendMessageOpen, setSendMessageOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileError) {
      toast({
        variant: "destructive",
        title: "Erreur de chargement des profils",
        description: profileError.message,
      });
      setLoading(false);
      return;
    }

    const { data: storageData, error: rpcError } = await supabase.rpc('get_users_with_storage');
    
    if (rpcError) {
      toast({
        variant: "default",
        title: "Avertissement",
        description: `Impossible de charger l'utilisation du stockage: ${rpcError.message}`,
      });
      setUsers(profiles);
    } else {
      const storageMap = new Map(storageData.map(u => [u.id, u.storage_used]));
      const mergedUsers = profiles.map(p => ({
        ...p,
        storage_used: storageMap.get(p.id) || 0,
      }));
      setUsers(mergedUsers);
    }

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (userId) => {
    const { error } = await supabase.functions.invoke('approve-user', { body: { userId }});
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: "Succès", description: "Utilisateur approuvé." });
      fetchUsers();
    }
  };

  const handleDisapprove = async (userId) => {
    const { error } = await supabase.functions.invoke('disapprove-user', { body: { userId }});
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: "Succès", description: "Utilisateur désactivé." });
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(user =>
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getProjectStatuses = (user) => {
    if (user.role === 'admin') {
      return [{ name: 'Tous', status: 'admin', key: 'admin' }];
    }
  
    const projects = [
      { key: 'lafoi', name: 'La Foi', expiry: user.lafoi_subscription_expires_at },
      { key: 'fichiers', name: 'Fichiers', expiry: user.fichiers_subscription_expires_at },
      { key: 'caisse', name: 'Caisse', expiry: user.caisse_subscription_expires_at },
      { key: 'factures', name: 'Factures', expiry: user.factures_subscription_expires_at },
    ];
  
    const now = new Date();
  
    return projects.map(p => {
      if (!p.expiry) {
        return { name: p.name, status: 'none', key: p.key };
      }
      const expiryDate = new Date(p.expiry);
      if (expiryDate < now) {
        return { name: p.name, status: 'expired', key: p.key };
      }
      
      const creationDate = new Date(user.created_at);
      const totalDuration = differenceInDays(expiryDate, creationDate);
      const isTrial = totalDuration >= 0 && totalDuration <= 8; // a bit of leeway for timing issues

      return { name: p.name, status: isTrial ? 'trial' : 'active', key: p.key };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou pseudo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        <Button onClick={() => toast({ title: '🚧 Bientôt disponible !', description: 'La fonctionnalité d\'invitation sera bientôt ajoutée.' })}>
          <UserPlus className="mr-2 h-4 w-4" />
          Inviter un utilisateur
        </Button>
      </div>
      <div className="border border-zinc-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/50">
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 font-semibold text-zinc-400">Utilisateur</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-400">Statut Compte</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-400">Statut des Projets</th>
                <th className="text-right py-3 px-4 font-semibold text-zinc-400">Stockage</th>
                <th className="text-center py-3 px-4 font-semibold text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-8 text-zinc-400">Chargement des utilisateurs...</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{user.full_name}</div>
                    <div className="text-xs text-zinc-400">@{user.username}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {getProjectStatuses(user).map(proj => {
                        let badgeClass = '';
                        let text = proj.name;
                        let icon = null;

                        switch (proj.status) {
                            case 'admin': badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/40'; text = 'Admin'; icon = <Star className="h-3 w-3 mr-1"/>; break;
                            case 'trial': badgeClass = 'bg-teal-500/20 text-teal-300 border-teal-500/40'; icon = <Sparkles className="h-3 w-3 mr-1"/>; break;
                            case 'active': badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40'; break;
                            case 'expired': badgeClass = 'bg-red-500/20 text-red-400 border-red-500/40'; break;
                            case 'none': badgeClass = 'bg-zinc-700/50 text-zinc-400 border-zinc-600'; break;
                        }
                        return <Badge key={proj.key} variant="outline" className={`text-xs font-normal ${badgeClass}`}>{icon}{text}</Badge>;
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-zinc-400 text-xs">{formatFileSize(user.storage_used)}</td>
                  <td className="py-3 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700 text-zinc-200">
                        <DropdownMenuLabel>Actions pour {user.username}</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => { setSelectedUser(user); setGrantDaysOpen(true); }} className="hover:!bg-zinc-800">
                          <Clock className="mr-2 h-4 w-4 text-sky-400" />
                          <span>Accorder des jours</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setSelectedUser(user); setSendMessageOpen(true); }} className="hover:!bg-zinc-800">
                          <MessageSquare className="mr-2 h-4 w-4 text-green-400" />
                          <span>Envoyer un message</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-700"/>
                        {user.status !== 'active' && (
                          <DropdownMenuItem onSelect={() => handleApprove(user.id)} className="hover:!bg-zinc-800">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span>Activer le compte</span>
                          </DropdownMenuItem>
                        )}
                        {user.status === 'active' && (
                          <DropdownMenuItem onSelect={() => handleDisapprove(user.id)} className="hover:!bg-zinc-800">
                            <XCircle className="mr-2 h-4 w-4 text-orange-500" />
                            <span>Désactiver le compte</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            recipient={selectedUser}
          />
        </>
      )}
    </div>
  );
};

export default UserManagement;
