import { useState, useCallback } from 'react';

export const useFileBrowserState = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemToRename, setItemToRename] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [fileToPreview, setFileToPreview] = useState(null);
  const [isMoveItemsOpen, setMoveItemsOpen] = useState(false);
  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleSelectionChange = useCallback((item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    view,
    setView,
    selectedItems,
    setSelectedItems,
    handleSelectionChange,
    clearSelection,
    itemToRename,
    setItemToRename,
    itemToDelete,
    setItemToDelete,
    fileToPreview,
    setFileToPreview,
    isMoveItemsOpen,
    setMoveItemsOpen,
    isCreateFolderOpen,
    setCreateFolderOpen,
    isUploadDialogOpen,
    setUploadDialogOpen,
  };
};