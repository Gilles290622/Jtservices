import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, User as UserIcon, LogOut, Settings } from 'lucide-react';
import ProfileSettingsDialog from './ProfileSettingsDialog';

const FacturesHeader = ({ profile, onProfileUpdate }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/factures', { replace: true });
  };

  const themeColor = profile?.theme_color || '#F59E0B';

  return (
    <>
      <header className="bg-white dark:bg-gray-900/80 backdrop-blur-sm p-4 flex justify-between items-center sticky top-0 z-40 border-b">
        <div className="flex items-center gap-3">
          {profile?.logo_url ? (
            <img-replace src={profile.logo_url} alt="Logo" className="h-9 w-9 object-contain rounded-full" />
          ) : (
            <FileText className="h-8 w-8" style={{ color: themeColor }} />
          )}
          <div className="text-2xl font-bold" style={{ color: themeColor }}>
            {profile?.denomination || 'Facturation Pro'}
          </div>
        </div>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                <span>{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
      <ProfileSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        profile={profile}
        onProfileUpdate={onProfileUpdate}
      />
    </>
  );
};

export default FacturesHeader;