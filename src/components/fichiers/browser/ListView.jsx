import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import FileIcon from '@/components/fichiers/FileIcon';
import CustomFolderIcon from '@/components/fichiers/icons/CustomFolderIcon';
import ItemActions from './ItemActions';
import { formatFileSize } from '@/lib/utils';

const ListView = ({ folders, files, onNavigate, selectedItems, onSelectionChange, handleOpenFile, handleDownload, handleShare, handleRename, handleDelete }) => {

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const isSelected = (item) => selectedItems.some(i => i.id === item.id);

  return (
    <div className="flex flex-col p-2">
      <div className="flex items-center p-2 border-b font-medium text-sm text-slate-500 sticky top-0 bg-white z-10">
        <div className="w-12 flex-shrink-0"></div>
        <div className="flex-grow pl-2">Nom</div>
        <div className="w-40 hidden sm:block flex-shrink-0">Dernière modification</div>
        <div className="w-24 hidden sm:block text-right flex-shrink-0">Taille</div>
        <div className="w-10 flex-shrink-0"></div>
      </div>
      {folders.map(folder => (
        <motion.div
          key={folder.id}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className={`group flex items-center p-2 rounded-md transition-colors ${isSelected(folder) ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
        >
          <div className="w-12 flex-shrink-0 flex justify-center">
            <Checkbox checked={isSelected(folder)} onCheckedChange={() => onSelectionChange(folder)} />
          </div>
          <div onClick={() => onNavigate(folder)} className="flex-grow flex items-center cursor-pointer gap-3 truncate">
            <CustomFolderIcon className="h-6 w-6 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-800 truncate">{folder.name}</span>
          </div>
          <div className="w-40 hidden sm:block text-sm text-slate-500 flex-shrink-0">{format(new Date(folder.created_at), 'dd MMM yyyy', { locale: fr })}</div>
          <div className="w-24 hidden sm:block text-right text-sm text-slate-500 flex-shrink-0">--</div>
          <div className="w-10 flex-shrink-0"><ItemActions item={folder} type="folder" handleRename={handleRename} handleDelete={handleDelete} /></div>
        </motion.div>
      ))}
      {files.map(file => (
        <motion.div
          key={file.id}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className={`group flex items-center p-2 rounded-md transition-colors ${isSelected(file) ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
        >
          <div className="w-12 flex-shrink-0 flex justify-center">
            <Checkbox checked={isSelected(file)} onCheckedChange={() => onSelectionChange(file)} />
          </div>
          <div onClick={() => handleOpenFile(file)} className="flex-grow flex items-center cursor-pointer gap-3 truncate">
            <FileIcon mimeType={file.mime_type} className="h-6 w-6 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-800 truncate">{file.name}</span>
          </div>
          <div className="w-40 hidden sm:block text-sm text-slate-500 flex-shrink-0">{format(new Date(file.created_at), 'dd MMM yyyy', { locale: fr })}</div>
          <div className="w-24 hidden sm:block text-right text-sm text-slate-500 flex-shrink-0">{formatFileSize(file.size)}</div>
          <div className="w-10 flex-shrink-0"><ItemActions item={file} type="file" handleOpenFile={handleOpenFile} handleDownload={handleDownload} handleShare={handleShare} handleRename={handleRename} handleDelete={handleDelete} /></div>
        </motion.div>
      ))}
    </div>
  );
};

export default ListView;