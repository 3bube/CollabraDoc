'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileText, Folder as FolderIcon, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { documentApi, folderApi, Document, Folder } from '@/lib/api';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  type: 'document' | 'folder';
  title: string;
  content?: string;
  folder?: string;
  updated_at: string;
  owner?: string;
  isPublic: boolean;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'documents' | 'folders'>('all');
  const router = useRouter();

  useEffect(() => {
    if (open && query.trim()) {
      performSearch();
    } else if (open && !query.trim()) {
      setResults([]);
    }
  }, [query, searchType, open]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search documents
      if (searchType === 'all' || searchType === 'documents') {
        try {
          const documents = await documentApi.getAll();
          const filteredDocs = documents.filter(doc => 
            doc.title.toLowerCase().includes(query.toLowerCase()) ||
            (doc.content && doc.content.toLowerCase().includes(query.toLowerCase()))
          );
          
          searchResults.push(...filteredDocs.map(doc => ({
            id: doc.id,
            type: 'document' as const,
            title: doc.title,
            content: doc.content,
            folder: doc.folder_id, // You might want to resolve folder names
            updated_at: doc.updated_at,
            owner: doc.owner_id,
            isPublic: doc.isPublic
          })));
        } catch (error) {
          console.error('Error searching documents:', error);
        }
      }

      // Search folders
      if (searchType === 'all' || searchType === 'folders') {
        try {
          const folders = await folderApi.getAll();
          const filteredFolders = folders.filter(folder => 
            folder.name.toLowerCase().includes(query.toLowerCase())
          );
          
          searchResults.push(...filteredFolders.map(folder => ({
            id: folder.id,
            type: 'folder' as const,
            title: folder.name,
            updated_at: folder.updated_at,
            owner: folder.owner_id,
            isPublic: false // Folders are typically private
          })));
        } catch (error) {
          console.error('Error searching folders:', error);
        }
      }

      // Sort by relevance and recency
      searchResults.sort((a, b) => {
        // Exact title matches first
        const aTitleMatch = a.title.toLowerCase() === query.toLowerCase();
        const bTitleMatch = b.title.toLowerCase() === query.toLowerCase();
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        // Then by recency
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'document') {
      router.push(`/doc/${result.id}`);
    } else {
      // Navigate to folder view (you might want to implement this)
      router.push(`/folder/${result.id}`);
    }
    onOpenChange(false);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Search Documents</DialogTitle>
          <DialogDescription>
            Search through your documents and folders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search documents and folders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Search Type Filter */}
          <div className="flex gap-2">
            <Button
              variant={searchType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('all')}
            >
              All
            </Button>
            <Button
              variant={searchType === 'documents' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('documents')}
            >
              Documents
            </Button>
            <Button
              variant={searchType === 'folders' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('folders')}
            >
              Folders
            </Button>
          </div>

          {/* Results */}
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result) => (
                  <Card 
                    key={result.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {result.type === 'document' ? (
                            <FileText className="h-5 w-5 text-blue-500" />
                          ) : (
                            <FolderIcon className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">
                              {highlightText(result.title, query)}
                            </h3>
                            <Badge variant={result.isPublic ? 'default' : 'secondary'} className="text-xs">
                              {result.isPublic ? 'Public' : 'Private'}
                            </Badge>
                          </div>
                          
                          {result.content && (
                            <p className="text-sm text-muted-foreground mb-2 overflow-hidden" style={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {highlightText(result.content.substring(0, 150), query)}
                              {result.content.length > 150 && '...'}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(result.updated_at), { addSuffix: true })}
                            </div>
                            {result.owner && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {result.owner}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results found for "{query}"</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Start typing to search</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
} 