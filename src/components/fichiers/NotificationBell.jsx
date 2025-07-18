import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { toast } = useToast();

    const safeSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error && error.code !== 403 && error.error_code !== 'session_not_found') {
          console.error('Error during safe sign out from notification bell:', error);
        }
    };

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                if (error.message === 'Failed to fetch') {
                    toast({
                        variant: 'destructive',
                        title: 'Erreur de Réseau',
                        description: 'Impossible de charger les notifications. Vérifiez votre connexion internet.',
                    });
                } else if (error.message.includes("JWT") || error.message.includes("Invalid Refresh Token")) {
                    console.error("Auth error fetching notifications, signing out:", error);
                    await safeSignOut();
                } else {
                    console.error('Error fetching notifications:', error);
                }
                return;
            }
            
            setNotifications(data);
            const unread = data.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        };

        fetchNotifications();

        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` },
                (payload) => {
                    fetchNotifications();
                    if(payload.eventType === 'INSERT') {
                      toast({
                        title: "Nouvelle notification",
                        description: payload.new.message,
                      })
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, toast]);

    const handleMarkAsRead = async (notificationId) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking notification as read:', error);
        }
    };
    
    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if(unreadIds.length === 0) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de marquer les notifications comme lues.' });
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[90vw] max-w-sm sm:w-80" align="end">
                <div className="flex justify-between items-center mb-2 px-2">
                    <h4 className="font-medium text-sm">Notifications</h4>
                    <Button variant="link" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0} className="h-auto p-0 text-xs">
                        Tout marquer comme lu
                    </Button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <div key={notification.id} 
                                className={cn("p-2 rounded-md cursor-pointer hover:bg-slate-100", !notification.is_read && 'bg-blue-50')}
                                onClick={() => handleMarkAsRead(notification.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 pt-1">
                                      <Mail className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                      <p className="text-sm">{notification.message}</p>
                                      <p className="text-xs text-slate-400 mt-1">
                                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                                      </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-slate-500 p-4">Aucune notification</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;