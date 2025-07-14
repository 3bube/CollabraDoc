'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { PresenceAvatars } from '@/components/ui/presence-avatars'
import { documentApi } from '@/lib/api'
import type { Document } from '@/lib/data'

function RecentDocuments() {
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);

  useEffect(() => {
    documentApi.getAll().then(docs => {
      // Transform docs to match frontend Document type if needed
      const transformed = docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        lastModified: new Date(doc.updated_at),
        author: { id: '', name: '', email: '', avatar: '', role: 'viewer' as 'viewer', status: 'offline' as 'offline' },
        collaborators: [],
        isPublic: doc.isPublic,
        tags: [],
        path: [],
        version: 1,
      }));
      // Sort by lastModified descending and take top 6
      setRecentDocs(transformed.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()).slice(0, 6));
    }).catch(() => setRecentDocs([]));
  }, []);

  return (
         <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Documents</CardTitle>
                    <CardDescription>
                      Documents you've worked on recently
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentDocs.map((doc) => (
                    <Link key={doc.id} href={`/doc/${doc.id}`}>
                      <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium line-clamp-1">{doc.title}</h3>
                            <Badge variant="secondary" className="text-xs ml-2">
                              v{doc.version}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {doc.content.split('\n')[0].replace(/#+\s*/, '')}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(doc.lastModified, { addSuffix: true })}
                            </div>
                            
                            <PresenceAvatars 
                              users={doc.collaborators} 
                              maxVisible={3}
                              size="sm"
                            />
                          </div>
                          
                          <div className="flex gap-1 mt-2">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
  )
}

export default RecentDocuments
