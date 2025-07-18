import React, { useState, useMemo } from 'react';
import { Folder, ChevronRight, ChevronDown } from 'lucide-react';

const TreeNode = ({ node, onSelect, selectedFolderId, defaultOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || (node.children && node.children.length > 0));
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(node);
  };

  return (
    <div className="ml-2">
      <div 
        className={`flex items-center p-1 rounded-md cursor-pointer my-1 ${selectedFolderId === node.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200'}`}
        onClick={handleSelect}
      >
        {hasChildren ? (
          <div onClick={handleToggle} className="p-1 hover:bg-slate-300 rounded">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        ) : (
          <div className="w-6"></div>
        )}
        <Folder size={16} className="mr-2 text-blue-500 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{node.name}</span>
      </div>
      {isOpen && hasChildren && (
        <div className="border-l-2 border-slate-200 ml-3">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} onSelect={onSelect} selectedFolderId={selectedFolderId} defaultOpen={false} />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTree = ({ allFolders, onSelect, currentFolder }) => {
  const tree = useMemo(() => {
    if (!allFolders || allFolders.length === 0) return [];
    
    const folderMap = {};
    const roots = [];

    allFolders.forEach(folder => {
      folderMap[folder.id] = { ...folder, children: [] };
    });

    allFolders.forEach(folder => {
      if (folder.parent_id && folderMap[folder.parent_id]) {
        folderMap[folder.parent_id].children.push(folderMap[folder.id]);
      } else if (folder.parent_id === null) {
        roots.push(folderMap[folder.id]);
      }
    });
    return roots;
  }, [allFolders]);

  if (tree.length === 0) {
    return <div className="text-sm text-slate-500">Aucun dossier.</div>;
  }

  return (
    <div>
      <h3 className="text-base font-semibold mb-2 p-1 text-slate-700">Navigation</h3>
      {tree.map(rootNode => (
        <TreeNode key={rootNode.id} node={rootNode} onSelect={onSelect} selectedFolderId={currentFolder?.id} defaultOpen={true} />
      ))}
    </div>
  );
};

export default FolderTree;