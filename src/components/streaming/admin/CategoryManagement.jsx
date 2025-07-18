import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CategoryDialog from './CategoryDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const CategoryManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
      setCategories(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };
  
  const handleDeleteCategory = async (categoryId) => {
    const { error: relationError } = await supabase.from('video_categories').delete().eq('category_id', categoryId);
    if (relationError) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer les liens vidéo : " + relationError.message });
        return;
    }

    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
        toast({ title: 'Succès', description: 'Catégorie supprimée.' });
        fetchCategories();
    }
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestion des Catégories</CardTitle>
            <CardDescription className="text-gray-400">Gérez les catégories de vos vidéos.</CardDescription>
          </div>
          <Button onClick={handleAddCategory} className="bg-red-600 hover:bg-red-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter une catégorie
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-12">Chargement des catégories...</p>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Aucune catégorie trouvée.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-700/50">
                  <TableHead className="text-white">Nom</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell>{category.name}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditCategory(category)} className="hover:!bg-gray-700 cursor-pointer">
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
                                Cette action est irréversible. La catégorie sera définitivement supprimée.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent hover:bg-gray-700">Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
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
      <CategoryDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        category={selectedCategory}
        onSuccess={fetchCategories}
      />
    </>
  );
};

export default CategoryManagement;