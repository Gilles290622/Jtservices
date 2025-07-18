import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';

const ProfileSettingsDialog = ({ open, onOpenChange, profile, onProfileUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    denomination: '',
    tagline: '',
    theme_color: '#F59E0B',
    theme_color_secondary: '#10B981',
    logo_url: '',
    headquarters: '',
    contact_info: '',
    email: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile && user) {
      setFormData({
        denomination: profile.denomination || '',
        tagline: profile.tagline || '',
        theme_color: profile.theme_color || '#F59E0B',
        theme_color_secondary: profile.theme_color_secondary || '#10B981',
        logo_url: profile.logo_url || '',
        headquarters: profile.headquarters || '',
        contact_info: profile.contact_info || '',
        email: user.email || '',
      });
      setPreviewUrl(profile.logo_url || '');
    }
  }, [profile, user, open]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    let newLogoUrl = formData.logo_url;
    let emailChanged = false;

    if (formData.email && formData.email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
      if (emailError) {
        toast({ variant: 'destructive', title: 'Erreur de changement d\'email', description: emailError.message });
        setIsSaving(false);
        return;
      }
      emailChanged = true;
    }

    if (logoFile) {
      setIsUploading(true);
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: true,
        });

      setIsUploading(false);
      if (uploadError) {
        toast({ variant: 'destructive', title: 'Erreur de téléversement', description: uploadError.message });
        setIsSaving(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
      newLogoUrl = `${publicUrl}?t=${new Date().getTime()}`;
    }

    const profileDataToUpdate = {
      denomination: formData.denomination,
      tagline: formData.tagline,
      theme_color: formData.theme_color,
      theme_color_secondary: formData.theme_color_secondary,
      logo_url: newLogoUrl,
      headquarters: formData.headquarters,
      contact_info: formData.contact_info,
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(profileDataToUpdate)
      .eq('id', user.id);

    setIsSaving(false);
    if (updateError) {
      toast({ variant: 'destructive', title: 'Erreur de sauvegarde', description: updateError.message });
    } else {
      if (emailChanged) {
        toast({ title: 'Vérifiez vos e-mails', description: 'Un lien de confirmation a été envoyé à vos anciennes et nouvelles adresses e-mail.' });
      } else {
        toast({ title: 'Succès', description: 'Votre profil a été mis à jour.' });
      }
      onProfileUpdate();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paramètres du profil</DialogTitle>
          <DialogDescription>
            Personnalisez l'apparence de votre espace de travail et de vos factures.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="denomination" className="text-right">
              Dénomination
            </Label>
            <Input id="denomination" value={formData.denomination} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tagline" className="text-right">
              Slogan
            </Label>
            <Input id="tagline" value={formData.tagline} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="headquarters" className="text-right">
              Siège
            </Label>
            <Input id="headquarters" value={formData.headquarters} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact_info" className="text-right">
              Contacts
            </Label>
            <Input id="contact_info" value={formData.contact_info} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme_color" className="text-right">
              Couleur 1
            </Label>
            <Input id="theme_color" type="color" value={formData.theme_color} onChange={handleInputChange} className="col-span-3 p-1 h-10" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme_color_secondary" className="text-right">
              Couleur 2
            </Label>
            <Input id="theme_color_secondary" type="color" value={formData.theme_color_secondary} onChange={handleInputChange} className="col-span-3 p-1 h-10" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Logo</Label>
            <div className="col-span-3 flex items-center gap-4">
              {previewUrl && <img-replace src={previewUrl} alt="Aperçu du logo" className="h-12 w-12 rounded-full object-cover" />}
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Changer
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/svg+xml" className="hidden" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsDialog;