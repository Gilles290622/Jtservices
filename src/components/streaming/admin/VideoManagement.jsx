import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import VideoDialog from './VideoDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

const VideoManagement = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('videos')
      .select('*, categories ( id, name )')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
      setVideos(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleAddVideo = () => {
    setSelectedVideo(null);
    setIsDialogOpen(true);
  };

  const handleEditVideo = (video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };
  
  const handleDeleteVideo = async (videoId) => {
    const { error: relationError } = await supabase.from('video_categories').delete().eq('video_id', videoId);
    if (relationError) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer les relations de catégorie: " + relationError.message });
        return;
    }

    const { error } = await supabase.from('videos').delete().eq('id', videoId);
    if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
        toast({ title: 'Succès', description: 'Vidéo supprimée.' });
        fetchVideos();
    }
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestion des Vidéos</CardTitle>
            <CardDescription className="text-gray-400">Ajoutez, modifiez ou supprimez des vidéos.</CardDescription>
          </div>
          <Button onClick={handleAddVideo} className="bg-red-600 hover:bg-red-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter une vidéo
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-12">Chargement des vidéos...</p>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Aucune vidéo trouvée.</p>
              <p className="text-sm">Utilisez le bouton "Ajouter une vidéo" pour commencer.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-700/50">
                  <TableHead className="text-white">Titre</TableHead>
                  <TableHead className="text-white hidden md:table-cell">Catégories</TableHead>
                  <TableHead className="text-white hidden lg:table-cell">Date de sortie</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                            {video.categories.map(cat => <Badge key={cat.id} variant="secondary">{cat.name}</Badge>)}
                        </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{video.release_date ? new Date(video.release_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                            <DropdownMenuItem onClick={() => handleEditVideo(video)} className="hover:!bg-gray-700 cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                             <AlertDialogTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:!bg-red-800/80 !text-red-500 cursor-pointer">
                                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                               </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                Cette action est irréversible. La vidéo et ses associations seront définitivement supprimées.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent hover:bg-gray-700">Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteVideo(video.id)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                       </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <VideoDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        video={selectedVideo}
        onSuccess={fetchVideos}
      />
    </>
  );
};

export default VideoManagement;