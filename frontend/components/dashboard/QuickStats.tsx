import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Users } from 'lucide-react'
import { Document } from '@/lib/data'

function QuickStats({ documents, users, onlineUsers }: {
  documents: Document[],
  users: { id: string, name: string, avatar: string, role: 'admin' | 'editor' | 'viewer', status: 'online' | 'away' | 'offline' }[],
  onlineUsers: { id: string, name: string, avatar: string, role: 'admin' | 'editor' | 'viewer', status: 'online' | 'away' | 'offline' }[]
}) {
    console.log('QuickStats rendered with:', {
        totalDocuments: documents?.length,
        totalUsers: users?.length,
        onlineUsersCount: onlineUsers.length,
    });
  return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                      <p className="text-2xl font-bold">{documents?.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                      <p className="text-2xl font-bold">{users?.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Online Now</p>
                      <p className="text-2xl font-bold">{onlineUsers.length}</p>
                    </div>
                    <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <div className="h-3 w-3 bg-green-500 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
  )
}

export default QuickStats
