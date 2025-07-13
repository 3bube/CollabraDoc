'use client';

import { useState } from 'react';
import Header from './Header';
import { CreateFolderDialog } from '@/components/create-folder-dialog';
import { Folder } from '@/lib/api';

export default function HeaderWrapper() {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const handleCreateFolder = () => {
    setFolderDialogOpen(true);
  };

  const handleFolderCreated = (folder: Folder) => {
    // You can add logic here to refresh the folder list or show a success message
    console.log('Folder created:', folder);
  };

  return (
    <>
      <Header onCreateFolder={handleCreateFolder} />
      
      <CreateFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        onFolderCreated={handleFolderCreated}
      />
    </>
  );
} 