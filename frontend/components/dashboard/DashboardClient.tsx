'use client';

import { useState, type PropsWithChildren } from 'react';
import { CreateDocumentDialog } from '@/components/create-document-dialog';
import { CreateFolderDialog } from '@/components/create-folder-dialog';
import { useDialog } from '@/context/useDialog';
import { Folder } from '@/lib/api';

export default function DashboardClient({ children }: PropsWithChildren) {
  const { open, onOpenChange } = useDialog();
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
      {children}

      <CreateDocumentDialog
        open={open}
        onOpenChange={onOpenChange}
      />

      <CreateFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        onFolderCreated={handleFolderCreated}
      />
    </>
  );
}
