'use client';

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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  User, 
  RotateCcw, 
  Eye, 
  FileText,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Version {
  id: string;
  version: number;
  content: string;
  created_at: string;
  created_by: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  change_summary?: string;
  word_count: number;
  character_count: number;
}

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  currentContent: string;
  onRevert?: (versionId: string) => void;
}

export function VersionHistoryDialog({ 
  open, 
  onOpenChange, 
  documentId, 
  documentTitle,
  currentContent,
  onRevert 
}: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

  // Mock data - replace with real API call
  useEffect(() => {
    if (open) {
      loadVersions();
    }
  }, [open, documentId]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const versionsData = await versionApi.getVersions(documentId);
      
      // Mock data
      const mockVersions: Version[] = [
        {
          id: 'v1',
          version: 1,
          content: currentContent,
          created_at: new Date().toISOString(),
          created_by: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: undefined
          },
          change_summary: 'Initial version',
          word_count: currentContent.split(' ').length,
          character_count: currentContent.length
        },
        {
          id: 'v2',
          version: 2,
          content: currentContent + '\n\nAdded some new content.',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          created_by: {
            id: 'user2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            avatar: undefined
          },
          change_summary: 'Added new section',
          word_count: (currentContent + '\n\nAdded some new content.').split(' ').length,
          character_count: (currentContent + '\n\nAdded some new content.').length
        },
        {
          id: 'v3',
          version: 3,
          content: currentContent + '\n\nAdded some new content.\n\nMore updates here.',
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          created_by: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: undefined
          },
          change_summary: 'Updated formatting and content',
          word_count: (currentContent + '\n\nAdded some new content.\n\nMore updates here.').split(' ').length,
          character_count: (currentContent + '\n\nAdded some new content.\n\nMore updates here.').length
        }
      ];
      
      setVersions(mockVersions);
      setSelectedVersion(mockVersions[0]); // Select current version
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async () => {
    if (!selectedVersion || !onRevert) return;
    
    setIsReverting(true);
    try {
      await onRevert(selectedVersion.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to revert version:', error);
    } finally {
      setIsReverting(false);
    }
  };

  const getChangeSummary = (version: Version) => {
    if (version.change_summary) return version.change_summary;
    
    // Auto-generate summary based on content changes
    const prevVersion = versions.find(v => v.version === version.version - 1);
    if (!prevVersion) return 'Initial version';
    
    const wordDiff = version.word_count - prevVersion.word_count;
    if (wordDiff > 0) return `Added ${wordDiff} words`;
    if (wordDiff < 0) return `Removed ${Math.abs(wordDiff)} words`;
    return 'Minor edits';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Version History - {documentTitle}</DialogTitle>
          <DialogDescription>
            View and restore previous versions of this document
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[600px]">
          {/* Version List */}
          <div className="w-1/3 border-r pr-4">
            <h3 className="font-medium mb-3">Versions</h3>
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading versions...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <Card 
                      key={version.id}
                      className={`cursor-pointer transition-colors ${
                        selectedVersion?.id === version.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                v{version.version}
                              </Badge>
                              {version.version === 1 && (
                                <Badge variant="secondary" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm font-medium mb-1">
                              {getChangeSummary(version)}
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={version.created_by.avatar} />
                                <AvatarFallback className="text-xs">
                                  {version.created_by.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {version.created_by.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Version Content */}
          <div className="flex-1">
            {selectedVersion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Version {selectedVersion.version}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedVersion.created_at), 'PPP p')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedVersion.word_count} words
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedVersion.character_count} chars
                    </Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/20">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {selectedVersion.content}
                    </pre>
                  </div>
                </div>

                {selectedVersion.version > 1 && onRevert && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRevert}
                      disabled={isReverting}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {isReverting ? 'Reverting...' : 'Revert to this version'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      This will replace the current content with this version
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a version to view</p>
              </div>
            )}
          </div>
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