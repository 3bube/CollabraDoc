'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

interface UserPresenceProps {
  users: User[];
}

export default function UserPresence({ users }: UserPresenceProps) {
  if (users.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Editing:</span>
        <div className="flex -space-x-2">
          {users.map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <Avatar 
                  className="h-6 w-6 border-2 border-background"
                  style={{ 
                    borderColor: user.color,
                    boxShadow: `0 0 0 2px ${user.color}`
                  }}
                >
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-muted-foreground">Currently editing</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <Badge variant="outline" className="text-xs">
          {users.length} active
        </Badge>
      </div>
    </TooltipProvider>
  );
} 