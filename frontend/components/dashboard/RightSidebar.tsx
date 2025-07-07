"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { RoleBadge } from '@/components/ui/role-badge'
import { Plus, Users, Search } from 'lucide-react'

import { useDialog } from '@/context/useDialog'

function RightSidebar({ onlineUsers }: {
  onlineUsers: { id: string, name: string, avatar: string, role: 'admin' | 'editor' | 'viewer', status: 'online' | 'away' | 'offline' }[],
}) {

  const { onOpenChange } = useDialog()
  return (
    <div className="space-y-6">
            {/* Team Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Activity</CardTitle>
                <CardDescription>Who's working on what</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onlineUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 ring-2 ring-primary">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <div className="flex items-center gap-2">
                          <RoleBadge role={user.role} />
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onOpenChange(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Document
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Search Docs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
  )
}

export default RightSidebar
