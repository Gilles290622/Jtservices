import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import FileIcon from '@/components/fichiers/FileIcon';
import CustomFolderIcon from '@/components/fichiers/icons/CustomFolderIcon';
import ItemActions from './ItemActions';

const GridView = ({ folders, files, onNavigate, selectedItems, onSelectionChange, handleOpenFile, handleDownload, handleShare, handleRename, handleDelete }) => {

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const isSelected = (item) => selectedItems.some(i => i.id === item.id);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-2">
      {folders.map(folder => (
        <motion.div
          key={folder.id}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className={`group relative flex flex-col items-center p-4 bg-slate-50 rounded-lg transition-all duration-200 border-2 ${isSelected(folder) ? 'border-blue-500 bg-blue-100' : 'border-transparent hover:bg-blue-50'}`}
        >
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected(folder)}
              onCheckedChange={() => onSelectionChange(folder)}
            />
          </div>
          <div className="w-full h-full flex flex-col items-center" onClick={() => onNavigate(folder)}>
            <CustomFolderIcon className="h-16 w-16 mb-2" />
            <span className="text-sm font-medium text-center break-words w-full text-slate-700">{folder.name}</span>
          </div>
          <ItemActions item={folder} type="folder" handleRename={handleRename} handleDelete={handleDelete} />
        </motion.div>
      ))}

      {files.map(file => (
        <motion.div
          key={file.id}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className={`group relative flex flex-col items-center p-4 bg-slate-50 rounded-lg transition-all duration-200 border-2 ${isSelected(file) ? 'border-blue-500 bg-blue-100' : 'border-transparent hover:bg-blue-50'}`}
        >
           <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected(file)}
              onCheckedChange={() => onSelectionChange(file)}
            />
          </div>
          <div className="w-full h-full flex flex-col items-center" onClick={() => handleOpenFile(file)}>
            <FileIcon mimeType={file.mime_type} />
            <span className="text-sm font-medium text-center break-words w-full text-slate-700">{file.name}</span>
            <p className="text-xs text-slate-400 mt-1">{format(new Date(file.created_at), 'dd/MM/yy')}</p>
          </div>
           <ItemActions item={file} type="file" handleOpenFile={handleOpenFile} handleDownload={handleDownload} handleShare={handleShare} handleRename={handleRename} handleDelete={handleDelete} />
        </motion.div>
      ))}
    </div>
  );
};

export default GridView;