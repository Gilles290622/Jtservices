import React, { useState, useEffect, useCallback } from 'react';
import FileBrowser from './FileBrowser';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import FolderTree from './FolderTree';
import { formatFileSize } from '@/lib/utils';
import CircularProgress from './CircularProgress';
import NotificationBell from '@/components/fichiers/NotificationBell';

const FileManager = ({ user, onLogout, isAdminView = false }) => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const { toast } = useToast();
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 500 * 1024 * 1024 });

  const fetchFolderContents = useCallback(async (folderId) => {
    if (!user || !user.id) return;
    setLoading(true);
    
    const { data: foldersData, error: foldersError } = await supabase
      .from('folders')
      .select('*')
      .eq('parent_id', folderId)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    const { data: filesData, error: filesError } = await supabase
      .from('files')
      .select('*')
      .eq('folder_id', folderId)
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false });

    if (foldersError || filesError) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de charger le contenu du dossier.",
      });
      setFolders([]);
      setFiles([]);
    } else {
      setFolders(foldersData);
      setFiles(filesData);
    }
    setLoading(false);
  }, [user, toast]);

  const buildPath = useCallback((folderId, allUserFolders) => {
    const foldersMap = allUserFolders.reduce((acc, f) => {
      acc[f.id] = f;
      return acc;
    }, {});
    
    const newPath = [];
    let current = foldersMap[folderId];
    while (current) {
      newPath.unshift(current);
      current = current.parent_id ? foldersMap[current.parent_id] : null;
    }
    return newPath;
  }, []);

  const refreshData = useCallback((folderId) => {
    if (!user || !user.id || !folderId) return;
    fetchFolderContents(folderId);
    const fetchUsage = async () => {
      const { data, error } = await supabase.rpc('get_my_storage_usage');
      if (!error) {
        setStorageUsage(prev => ({ ...prev, used: data }));
      }
    };
    fetchUsage();
  }, [fetchFolderContents, user]);

  useEffect(() => {
    if (!user || !user.id) {
        setLoading(false);
        return;
    }

    const initialize = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('folders')
        .select('id, name, parent_id, owner_id')
        .eq('owner_id', user.id);

      if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger la structure des dossiers." });
        setLoading(false);
        return;
      }
      
      setAllFolders(data);
      const rootFolder = data.find(f => f.parent_id === null);

      if (rootFolder) {
        setCurrentFolder(rootFolder);
        setPath([rootFolder]);
        refreshData(rootFolder.id);
      } else {
        setLoading(false);
      }
    };

    const fetchAdminRoot = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('folders')
            .select('id, name, parent_id, owner_id')
            .eq('owner_id', user.id)
            .is('parent_id', null)
            .single();
        if(data) {
            setCurrentFolder(data);
            setPath([data]);
            fetchFolderContents(data.id);
        } else {
            setLoading(false);
        }
    };

    if (!isAdminView) {
      initialize();
    } else {
        fetchAdminRoot();
    }
  }, [user, toast, isAdminView]);
  
  const handleTreeSelect = (folder) => {
    setCurrentFolder(folder);
    const newPath = buildPath(folder.id, allFolders);
    setPath(newPath);
    fetchFolderContents(folder.id);
  };
  
  return (
    <div className={`w-full h-full flex flex-col ${isAdminView ? '' : 'p-2 sm:p-4 md:p-8'}`}>
        {!isAdminView && (
            <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center pb-4 mb-4 border-b text-center sm:text-left">
                <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Mon Espace</h1>
                <p className="text-slate-500">Connecté en tant que {user?.full_name || 'Utilisateur'}</p>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <NotificationBell />
                  <Button onClick={onLogout} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                  </Button>
                </div>
            </header>
        )}
      
      <div className="flex-grow flex bg-white rounded-lg shadow-md overflow-hidden">
        <div className="w-64 h-full p-4 border-r bg-slate-50 overflow-y-auto flex-col hidden sm:flex">
          {!isAdminView && (
            <div className="mb-6">
              <CircularProgress 
                  progress={(storageUsage.used / storageUsage.total) * 100}
                  usedStorage={formatFileSize(storageUsage.used)}
                  totalStorage={formatFileSize(storageUsage.total)}
              />
            </div>
          )}
          <div className="flex-grow">
            <FolderTree allFolders={allFolders} onSelect={handleTreeSelect} currentFolder={currentFolder} />
          </div>
        </div>

        <div className="flex-grow flex flex-col p-2 sm:p-4 overflow-hidden">
          {currentFolder ? (
            <FileBrowser
              key={currentFolder.id}
              currentFolder={currentFolder}
              folders={folders}
              files={files}
              path={path}
              loading={loading}
              userId={user.id}
              userProfile={user}
              onNavigate={handleTreeSelect}
              onBreadcrumbClick={handleTreeSelect}
              onUploadComplete={() => refreshData(currentFolder.id)}
              onDeleteComplete={() => refreshData(currentFolder.id)}
              onRenameComplete={(isFolder) => {
                 if (isFolder) {
                    const fetchAll = async () => {
                      const { data, error } = await supabase.from('folders').select('id, name, parent_id, owner_id').eq('owner_id', user.id);
                      if (!error) setAllFolders(data);
                    };
                    fetchAll();
                 }
                 refreshData(currentFolder.id);
              }}
              onCreateFolderComplete={() => {
                const fetchAll = async () => {
                  const { data, error } = await supabase.from('folders').select('id, name, parent_id, owner_id').eq('owner_id', user.id);
                  if (!error) setAllFolders(data);
                };
                fetchAll();
                refreshData(currentFolder.id);
              }}
              storageUsage={storageUsage}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              {loading ? "Chargement..." : "Sélectionnez un dossier pour commencer."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;