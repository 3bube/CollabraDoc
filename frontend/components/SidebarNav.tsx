'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = { home: Home, search: Search, settings: Settings } as const;

interface Props {
  navigation: { title: string; url: string; icon: keyof typeof iconMap }[];
  documentsByPath: Record<string, any[]>;
}

export default function SidebarNav({ navigation, documentsByPath }: Props) {
  const pathname     = usePathname();
  const searchParams = useSearchParams(); // to read ?doc=…

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
                            searchParams.get('doc') === doc.id
                              ? 'bg-muted text-foreground'
                              : 'hover:bg-muted/50 text-muted-foreground'
                          )}
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
          </ScrollArea>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
