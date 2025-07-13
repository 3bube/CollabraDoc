'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Search,
  Settings,
  FolderOpen,
  FileText,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { documentApi, folderApi, Document, Folder } from '@/lib/api';

const iconMap = { home: Home, search: Search, settings: Settings } as const;

interface Props {
  navigation: { title: string; url: string; icon: keyof typeof iconMap }[];
}

interface DocumentsByPath {
  [path: string]: Document[];
}

export default function SidebarNav({ navigation }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching documents and folders...');
        const [docsData, foldersData] = await Promise.all([
          documentApi.getAll(),
          folderApi.getAll()
        ]);
        console.log('Documents fetched:', docsData);
        console.log('Folders fetched:', foldersData);
        setDocuments(docsData);
        setFolders(foldersData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load documents and folders');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group documents by folder path
  const documentsByPath = documents.reduce<DocumentsByPath>((acc, doc) => {
    const folder = folders.find(f => f.id === doc.folder_id);
    const path = folder ? folder.name : 'Root';
    if (!acc[path]) {
      acc[path] = [];
    }
    acc[path].push(doc);
    return acc;
  }, {});

  return (
    <SidebarContent>
      {/* ----- Top nav links ----- */}
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigation.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                        pathname === item.url
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator />

      {/* ----- Documents list ----- */}
      <SidebarGroup>
        <SidebarGroupLabel>Documents</SidebarGroupLabel>
        <SidebarGroupContent>
          <ScrollArea className="h-96">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-destructive">
                {error}
              </div>
            ) : Object.keys(documentsByPath).length === 0 ? (
              <div className="p-4">
                <div className="text-sm text-muted-foreground mb-4">
                  No documents found. Create your first document!
                </div>
                {/* Test document for navigation testing */}
                <SidebarMenu>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground">
                      <FolderOpen className="h-3 w-3" />
                      Test
                    </div>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href="/doc/test-doc"
                          className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm hover:bg-muted/50 text-muted-foreground"
                          onClick={() => console.log('Navigating to test document')}
                        >
                          <FileText className="h-3 w-3" />
                          <span className="truncate">Test Document</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </div>
                </SidebarMenu>
              </div>
            ) : (
              <SidebarMenu>
                {Object.entries(documentsByPath).map(([path, docs]) => (
                  <div key={path} className="mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground">
                      <FolderOpen className="h-3 w-3" />
                      {path}
                    </div>

                    {docs.map((doc) => (
                      <SidebarMenuItem key={doc.id}>
                        <SidebarMenuButton asChild>
                          <Link
                            href={`/doc/${doc.id}`}
                            className={cn(
                              'ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm',
                              pathname === `/doc/${doc.id}`
                                ? 'bg-muted text-foreground'
                                : 'hover:bg-muted/50 text-muted-foreground'
                            )}
                            onClick={() => console.log('Navigating to document:', doc.id, doc.title)}
                          >
                            <FileText className="h-3 w-3" />
                            <span className="truncate">{doc.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </div>
                ))}
              </SidebarMenu>
            )}
          </ScrollArea>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
