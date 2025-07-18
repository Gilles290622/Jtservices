import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FolderPlus,
  Upload,
  Search,
  LayoutGrid,
  List,
  ArrowLeft
} from 'lucide-react';

const Breadcrumbs = ({ path, onBreadcrumbClick }) => (
  <nav className="flex items-center text-sm sm:text-base text-slate-600 mb-4 overflow-x-auto whitespace-nowrap py-2">
    {path.length > 1 && (
      <button onClick={() => onBreadcrumbClick(path[path.length - 2])} className="p-1 mr-2 rounded-md hover:bg-slate-200">
        <ArrowLeft size={16} />
      </button>
    )}
    {path.map((folder, index) => (
      <React.Fragment key={folder.id}>
        <button
          onClick={() => onBreadcrumbClick(folder)}
          className={`px-2 py-1 rounded-md ${index === path.length - 1 ? 'font-bold text-blue-600' : 'hover:bg-slate-200'}`}
        >
          {folder.name}
        </button>
        {index < path.length - 1 && <span className="mx-2">/</span>}
      </React.Fragment>
    ))}
  </nav>
);

const BrowserHeader = ({ path, onBreadcrumbClick, searchTerm, onSearchTermChange, view, onViewChange, onCreateFolder, onUpload }) => {
  return (
    <header className="p-4 border-b">
      <Breadcrumbs path={path} onBreadcrumbClick={onBreadcrumbClick} />
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
        <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="search"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 items-center">
           <div className="flex items-center rounded-md border bg-slate-100 p-0.5">
              <Button onClick={() => onViewChange('grid')} variant={view === 'grid' ? 'secondary' : 'ghost'} size="sm" className="px-2">
                  <LayoutGrid size={20} />
              </Button>
              <Button onClick={() => onViewChange('list')} variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" className="px-2">
                  <List size={20} />
              </Button>
          </div>
          <Button onClick={onCreateFolder} variant="outline">
            <FolderPlus className="mr-2 h-4 w-4" /> Nouveau dossier
          </Button>
          <Button onClick={onUpload}>
            <Upload className="mr-2 h-4 w-4" /> Téléverser
          </Button>
        </div>
      </div>
    </header>
  );
};

export default BrowserHeader;