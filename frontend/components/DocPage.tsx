'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PresenceAvatars } from '@/components/ui/presence-avatars';
import { RoleBadge } from '@/components/ui/role-badge';
import { 
  MessageSquare, 
  History, 
  Users, 
  Share, 
  MoreHorizontal,
  Save,
  Play,
  Terminal,
  Loader2,
  Download
} from 'lucide-react';
import { VersionHistoryDialog } from './VersionHistoryDialog';
import { ShareDocumentDialog } from './ShareDocumentDialog';
import { CommentsPanel } from './CommentsPanel';
import { ExportDialog } from './ExportDialog';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { documentApi, Document } from '@/lib/api';
import YjsEditor from './YjsEditor';
import UserPresence from './UserPresence';

export default function DocumentEditor() {
  const params = useParams();
  const id = params.id as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [codeRunnerOpen, setCodeRunnerOpen] = useState(false);
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  
  const handleSaveDocument = async (content: string) => {
    if (!doc) return;
    
    setIsSaving(true);
    try {
      await documentApi.update(doc.id, { content });
      setLastSaved(new Date());
      // Update local document state
      setDoc(prev => prev ? { ...prev, content, updated_at: new Date().toISOString() } : null);
    } catch (err) {
      console.error('Failed to save document:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTextSelection = (text: string, range: Range | null) => {
    setSelectedText(text);
    setSelectionRange(range);
  };

  const clearTextSelection = () => {
    setSelectedText('');
    setSelectionRange(null);
  };
  
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        console.log('Fetching document with ID:', id);
        
        // Handle test document
        if (id === 'test-doc') {
          const testDoc: Document = {
            id: 'test-doc',
            title: 'Test Document',
            content: `# Test Document

This is a test document to verify navigation is working.

## Features
- Document navigation
- Content rendering
- API integration

## Code Example
\`\`\`javascript
console.log('Hello, CollabraDoc!');
\`\`\`

This document is for testing purposes only.`,
            folder_id: undefined,
            isPublic: true,
            owner_id: 'test-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setDoc(testDoc);
          setLoading(false);
          return;
        }
        
        const documentData = await documentApi.getById(id);
        console.log('Document data received:', documentData);
        setDoc(documentData);
      } catch (err) {
        console.error('Failed to fetch document:', err);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading document...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the document.</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Document not found</h2>
          <p className="text-muted-foreground">
            {error || "The document you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Document Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{doc.title}</h1>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Last updated {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                  </span>
                  <Badge variant="outline">
                    {doc.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
                {activeUsers.length > 0 && <UserPresence users={activeUsers} />}
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSaveDocument(doc.content)}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : lastSaved ? 'Saved' : 'Save'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setVersionHistoryOpen(true)}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCommentsOpen(!commentsOpen)}
                className={cn(commentsOpen && 'bg-primary text-primary-foreground')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setExportDialogOpen(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {/* Comments Panel */}
          <CommentsPanel
            documentId={doc.id}
            isOpen={commentsOpen}
            onToggle={() => setCommentsOpen(!commentsOpen)}
            selectedText={selectedText}
            selectionRange={selectionRange}
            onTextSelection={handleTextSelection}
            onClearSelection={clearTextSelection}
          />
          {/* Editor Canvas */}
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardContent className="p-8 h-full">
                <YjsEditor 
                  documentId={doc.id} 
                  initialContent={doc.content}
                  onSave={handleSaveDocument}
                  onUsersChange={setActiveUsers}
                  onTextSelection={handleTextSelection}
                  onClearSelection={clearTextSelection}
                />
              </CardContent>
            </Card>
          </div>

          {/* Code Runner Panel */}
          {codeRunnerOpen && (
            <div className="border-t border-border h-64">
              <div className="p-4 bg-card border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    <span className="font-medium">Code Runner</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCodeRunnerOpen(false)}
                  >
                    ×
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-muted/20 font-mono text-sm">
                <div className="text-green-600">$ Ready to execute code...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Code Runner Toggle */}
      <div className="border-t border-border bg-card p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Word count: {(doc.content || '').split(' ').length}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Characters: {(doc.content || '').length}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCodeRunnerOpen(!codeRunnerOpen)}
            className={cn(
              'transition-colors',
              codeRunnerOpen && 'bg-primary text-primary-foreground'
            )}
          >
            <Play className="h-4 w-4 mr-2" />
            Code Runner
          </Button>
        </div>
      </div>

      {/* Share Document Dialog */}
      <ShareDocumentDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        documentId={doc.id}
        documentTitle={doc.title}
        isPublic={doc.isPublic}
        onUpdatePermissions={(isPublic) => {
          setDoc(prev => prev ? { ...prev, isPublic } : null);
        }}
      />

      {/* Version History Dialog */}
      <VersionHistoryDialog
        open={versionHistoryOpen}
        onOpenChange={setVersionHistoryOpen}
        documentId={doc.id}
        documentTitle={doc.title}
        currentContent={doc.content}
        onRevert={async (versionId) => {
          // TODO: Implement version revert
          console.log('Reverting to version:', versionId);
        }}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        documentTitle={doc.title}
        documentContent={doc.content}
        documentAuthor={doc.owner_id}
        documentUpdatedAt={doc.updated_at}
      />
    </div>
  );
}