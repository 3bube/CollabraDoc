"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText } from 'lucide-react';
import { documentApi, folderApi, Folder, handleApiError } from '@/lib/api';
import { TemplateDialog } from './TemplateDialog';

interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDocumentDialog({ open, onOpenChange }: CreateDocumentDialogProps) {
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('none');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const router = useRouter();

  // Load folders when dialog opens
  useEffect(() => {
    if (open) {
      loadFolders();
    }
  }, [open]);

  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const foldersData = await folderApi.getAll();
      setFolders(foldersData);
    } catch (err) {
      console.error('Failed to load folders:', err);
      // Don't show error for folder loading, just log it
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Document title is required');
      return;
    }

    setIsLoading(true);

    try {
      const documentData = {
        title: title.trim(),
        folder_id: folder === 'none' ? undefined : folder,
        isPublic,
        content: ''
      };

      const newDocument = await documentApi.create(documentData);
      
      // Close dialog and navigate to the new document
      onOpenChange(false);
      router.push(`/doc/${newDocument.id}`);
      
      // Reset form
      setTitle('');
      setFolder('none');
      setIsPublic(false);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setFolder('none');
    setIsPublic(false);
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            Start a new document to collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Template (Optional)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTemplateDialogOpen(true)}
                disabled={isLoading}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                {selectedTemplate ? 'Change Template' : 'Choose Template'}
              </Button>
              {selectedTemplate && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedTemplate('')}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              )}
            </div>
            {selectedTemplate && (
              <p className="text-sm text-muted-foreground">
                Template: {selectedTemplate}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select value={folder} onValueChange={setFolder} disabled={isLoading || loadingFolders}>
              <SelectTrigger>
                <SelectValue placeholder={loadingFolders ? "Loading folders..." : "Select a folder (optional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((folderItem) => (
                  <SelectItem key={folderItem.id} value={folderItem.id}>
                    {folderItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="visibility">Public Document</Label>
              <div className="text-sm text-muted-foreground">
                Anyone in the workspace can view this document
              </div>
            </div>
            <Switch
              id="visibility"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Template Dialog */}
      <TemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onTemplateSelect={(template) => {
          setSelectedTemplate(template.name);
          // You can also pre-fill the content here if needed
        }}
      />
    </Dialog>
  );
}