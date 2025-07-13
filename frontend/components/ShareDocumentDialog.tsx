'use client';

import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { X, Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ShareDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  isPublic: boolean;
  onUpdatePermissions?: (isPublic: boolean) => void;
}

interface SharedUser {
  id: string;
  email: string;
  permission: 'view' | 'edit' | 'admin';
}

export function ShareDocumentDialog({ 
  open, 
  onOpenChange, 
  documentId, 
  documentTitle,
  isPublic,
  onUpdatePermissions 
}: ShareDocumentDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([
    // Mock data - replace with real API call
    { id: '1', email: 'john@example.com', permission: 'edit' },
    { id: '2', email: 'jane@example.com', permission: 'view' },
  ]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement API call to share document
      // await shareDocumentApi.share(documentId, { email, permission });
      
      // Add to local state for now
      const newUser: SharedUser = {
        id: Date.now().toString(),
        email: email.trim(),
        permission
      };
      setSharedUsers(prev => [...prev, newUser]);
      
      setEmail('');
      setPermission('view');
      toast.success(`Document shared with ${email}`);
    } catch (err) {
      setError('Failed to share document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSharedUsers(prev => prev.filter(user => user.id !== userId));
    toast.success('User removed from document');
  };

  const handleUpdatePermission = (userId: string, newPermission: 'view' | 'edit' | 'admin') => {
    setSharedUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, permission: newPermission } : user
      )
    );
    toast.success('Permission updated');
  };

  const handleTogglePublic = async () => {
    try {
      const newIsPublic = !isPublic;
      // TODO: Implement API call to update document visibility
      // await documentApi.update(documentId, { isPublic: newIsPublic });
      
      if (onUpdatePermissions) {
        onUpdatePermissions(newIsPublic);
      }
      toast.success(`Document is now ${newIsPublic ? 'public' : 'private'}`);
    } catch (err) {
      toast.error('Failed to update document visibility');
    }
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/doc/${documentId}`;
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share "{documentTitle}"</DialogTitle>
          <DialogDescription>
            Share this document with others or make it public.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public/Private Toggle */}
          <div className="space-y-3">
            <Label>Document Visibility</Label>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">
                  {isPublic ? 'Public' : 'Private'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isPublic 
                    ? 'Anyone with the link can view this document'
                    : 'Only you and invited users can access this document'
                  }
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTogglePublic}
              >
                {isPublic ? 'Make Private' : 'Make Public'}
              </Button>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/doc/${documentId}`}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Invite Users */}
          <div className="space-y-3">
            <Label>Invite People</Label>
            <form onSubmit={handleShare} className="space-y-3">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Select value={permission} onValueChange={(value: 'view' | 'edit') => setPermission(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={isLoading}>
                  <Mail className="h-4 w-4 mr-2" />
                  {isLoading ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            </form>
          </div>

          {/* Shared Users List */}
          {sharedUsers.length > 0 && (
            <div className="space-y-3">
              <Label>People with access</Label>
              <div className="space-y-2">
                {sharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.permission === 'admin' ? 'Admin' : 
                           user.permission === 'edit' ? 'Can edit' : 'Can view'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={user.permission} 
                        onValueChange={(value: 'view' | 'edit' | 'admin') => 
                          handleUpdatePermission(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 