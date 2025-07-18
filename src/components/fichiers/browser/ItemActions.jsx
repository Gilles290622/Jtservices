import React from 'react';
import { MoreVertical, Edit, Trash2, Download, Share2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import DirectFileShare from '@/components/fichiers/DirectFileShare';

const ItemActions = ({ item, type, handleRename, handleDelete, handleDownload, handleShare, handleOpenFile }) => {
  const isMobileShareAvailable = !!(navigator.share);

  return (
    <div className="absolute top-2 right-2 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {type === 'file' && (
            <>
              <DropdownMenuItem onSelect={() => handleOpenFile(item)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>Visualiser</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleDownload(item)}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleShare(item)}>
                <Share2 className="mr-2 h-4 w-4" />
                Partager lien
              </DropdownMenuItem>
              {isMobileShareAvailable && <DirectFileShare item={item} />}
            </>
          )}
          <DropdownMenuItem onSelect={() => handleRename(item)}>
            <Edit className="mr-2 h-4 w-4" />
            Renommer
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleDelete(item)} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ItemActions;