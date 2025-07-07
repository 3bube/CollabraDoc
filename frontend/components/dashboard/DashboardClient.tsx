'use client';

import { useState, type PropsWithChildren } from 'react';
import { CreateDocumentDialog } from '@/components/create-document-dialog';
import { useDialog } from '@/context/useDialog';

export default function DashboardClient({ children }: PropsWithChildren) {
  const { open, onOpenChange } = useDialog();

  return (
    <>
      {children}

      <CreateDocumentDialog
        open={open}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
