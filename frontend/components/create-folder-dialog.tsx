"use client";

import React, { useState, useEffect } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { folderApi, Folder, handleApiError } from '@/lib/api';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated?: (folder: Folder) => void;
}

export function CreateFolderDialog({ open, onOpenChange, onFolderCreated }: CreateFolderDialogProps) {
  const [name, setName] = useState('');
  const [parentFolder, setParentFolder] = useState('none');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

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

    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }

    // Check if folder name already exists in the same parent
    const existingFolder = folders.find(
      folder => folder.name.toLowerCase() === name.trim().toLowerCase() && 
      folder.parent_id === (parentFolder === 'none' ? undefined : parentFolder)
    );

    if (existingFolder) {
      setError('A folder with this name already exists in this location');
      return;
    }

    setIsLoading(true);

    try {
      const folderData = {
        name: name.trim(),
        parent_id: parentFolder === 'none' ? null : parentFolder
      };

      const newFolder = await folderApi.create(folderData);
      
      // Close dialog
      onOpenChange(false);
      
      // Call callback if provided
      if (onFolderCreated) {
        onFolderCreated(newFolder);
      }
      
      // Reset form
      setName('');
      setParentFolder('none');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setParentFolder('none');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your documents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Folder Name *</Label>
            <Input
              id="name"
              placeholder="Enter folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Folder</Label>
            <Select value={parentFolder} onValueChange={setParentFolder} disabled={isLoading || loadingFolders}>
              <SelectTrigger>
                <SelectValue placeholder={loadingFolders ? "Loading folders..." : "Select a parent folder (optional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent folder</SelectItem>
                {folders.map((folderItem) => (
                  <SelectItem key={folderItem.id} value={folderItem.id}>
                    {folderItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 