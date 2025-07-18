import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Progress } from '@/components/ui/progress';
import { Check, ChevronsUpDown, UploadCloud, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const VideoDialog = ({ isOpen, setIsOpen, video, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [openCategorySelector, setOpenCategorySelector] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDropThumbnail = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setThumbnailUrl('');
  }, []);

  const onDropVideo = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    setVideoFile(file);
    setVideoUrl('');
  }, []);

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps, isDragActive: isThumbnailDragActive } = useDropzone({ onDrop: onDropThumbnail, accept: { 'image/*': ['.jpeg', '.png', '.webp'] }, maxFiles: 1 });
  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } = useDropzone({ onDrop: onDropVideo, accept: { 'video/*': ['.mp4', '.mov', '.webm'] }, maxFiles: 1 });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (error) console.error("Error fetching categories", error);
      else setAllCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setDescription(video.description || '');
      setThumbnailUrl(video.thumbnail_url || '');
      setVideoUrl(video.video_url || '');
      setReleaseDate(video.release_date || '');
      setSelectedCategories(video.categories?.map(c => c.id) || []);
      setThumbnailPreview(video.thumbnail_url || '');
    } else {
      setTitle('');
      setDescription('');
      setThumbnailUrl('');
      setVideoUrl('');
      setReleaseDate('');
      setSelectedCategories([]);
      setThumbnailFile(null);
      setVideoFile(null);
      setThumbnailPreview('');
      setUploadProgress(0);
    }
  }, [video, isOpen]);

  const uploadFile = async (file, bucket, path) => {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        onProgress: (event) => {
          if (bucket === 'videos') {
            setUploadProgress((event.loaded / event.total) * 100);
          }
        }
      });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || (!videoUrl && !videoFile)) {
        toast({ variant: 'destructive', title: 'Champs requis', description: 'Le titre et une vidéo (fichier ou URL) sont requis.' });
        return;
    }
    setLoading(true);
    setUploadProgress(0);

    try {
      let finalThumbnailUrl = thumbnailUrl;
      if (thumbnailFile) {
        const thumbnailPath = `public/${Date.now()}_${thumbnailFile.name}`;
        finalThumbnailUrl = await uploadFile(thumbnailFile, 'thumbnails', thumbnailPath);
      }

      let finalVideoUrl = videoUrl;
      if (videoFile) {
        const videoPath = `public/${Date.now()}_${videoFile.name}`;
        finalVideoUrl = await uploadFile(videoFile, 'videos', videoPath);
      }

      const videoData = {
        title,
        description,
        thumbnail_url: finalThumbnailUrl,
        video_url: finalVideoUrl,
        release_date: releaseDate || null,
      };
      if (video?.id) videoData.id = video.id;

      const { data: upsertedVideo, error: videoError } = await supabase.from('videos').upsert(videoData).select().single();
      if (videoError) throw videoError;

      const videoId = upsertedVideo.id;
      await supabase.from('video_categories').delete().eq('video_id', videoId);

      if (selectedCategories.length > 0) {
        const newRelations = selectedCategories.map(catId => ({ video_id: videoId, category_id: catId }));
        const { error: insertRelationsError } = await supabase.from('video_categories').insert(newRelations);
        if (insertRelationsError) throw insertRelationsError;
      }

      toast({ title: 'Succès', description: `Vidéo ${video ? 'mise à jour' : 'créée'} avec succès.` });
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl bg-gray-800 border-gray-700 text-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{video ? 'Modifier la vidéo' : 'Ajouter une vidéo'}</DialogTitle>
          <DialogDescription>Remplissez les informations de la vidéo. Fournissez un fichier ou une URL.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-700 border-gray-600" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
          
          <div>
            <Label>Miniature</Label>
            <div {...getThumbnailRootProps()} className={cn("mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-600 px-6 pt-5 pb-6 cursor-pointer hover:border-red-500", isThumbnailDragActive && "border-red-500")}>
              <div className="space-y-1 text-center">
                {thumbnailPreview ? (
                  <div className="relative group">
                    <img src={thumbnailPreview} alt="Aperçu" className="mx-auto h-24 w-auto rounded-md" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); setThumbnailFile(null); setThumbnailPreview(video?.thumbnail_url || ''); setThumbnailUrl(video?.thumbnail_url || ''); }} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white opacity-0 group-hover:opacity-100">
                      <XCircle className="h-5 w-5"/>
                    </button>
                  </div>
                ) : <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />}
                <div className="flex text-sm text-gray-500">
                  <p className="pl-1">{thumbnailFile ? thumbnailFile.name : "Glissez-déposez ou cliquez pour choisir une image"}</p>
                </div>
              </div>
              <input {...getThumbnailInputProps()} />
            </div>
            <Input id="thumbnailUrl" placeholder="Ou collez une URL de miniature" value={thumbnailUrl} onChange={(e) => { setThumbnailUrl(e.target.value); setThumbnailFile(null); setThumbnailPreview(e.target.value); }} className="mt-2 bg-gray-700 border-gray-600" disabled={!!thumbnailFile} />
          </div>

          <div>
            <Label>Vidéo</Label>
            <div {...getVideoRootProps()} className={cn("mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-600 px-6 pt-5 pb-6 cursor-pointer hover:border-red-500", isVideoDragActive && "border-red-500")}>
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-500">
                  <p className="pl-1">{videoFile ? videoFile.name : "Glissez-déposez ou cliquez pour choisir une vidéo"}</p>
                </div>
              </div>
              <input {...getVideoInputProps()} />
            </div>
            <Input id="videoUrl" placeholder="Ou collez une URL de vidéo" value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value); setVideoFile(null); }} className="mt-2 bg-gray-700 border-gray-600" disabled={!!videoFile} />
          </div>

          {loading && videoFile && <Progress value={uploadProgress} className="w-full" />}

          <div>
            <Label htmlFor="releaseDate">Date de sortie</Label>
            <Input id="releaseDate" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
          <div>
            <Label>Catégories</Label>
            <Popover open={openCategorySelector} onOpenChange={setOpenCategorySelector}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between bg-gray-700 hover:bg-gray-600">
                  {selectedCategories.length > 0 ? `${selectedCategories.length} catégorie(s)` : "Sélectionner..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-gray-800 border-gray-700 text-white">
                <Command>
                  <CommandInput placeholder="Rechercher..." />
                  <CommandList>
                    <CommandEmpty>Aucune catégorie.</CommandEmpty>
                    <CommandGroup>
                      {allCategories.map((cat) => (
                        <CommandItem key={cat.id} value={cat.id} onSelect={(currentValue) => setSelectedCategories(prev => prev.includes(currentValue) ? prev.filter(c => c !== currentValue) : [...prev, currentValue])}>
                          <Check className={cn("mr-2 h-4 w-4", selectedCategories.includes(cat.id) ? "opacity-100" : "opacity-0")} />
                          {cat.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VideoDialog;