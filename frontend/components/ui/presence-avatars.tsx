import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { User } from '@/lib/data';

interface PresenceAvatarsProps {
  users: User[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-10 w-10'
};

const borderColors = {
  online: 'ring-2 ring-primary',
  away: 'ring-2 ring-yellow-400',
  offline: 'ring-2 ring-muted-foreground'
};

export function PresenceAvatars({ 
  users, 
  maxVisible = 4, 
  size = 'md',
  className 
}: PresenceAvatarsProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const overflowCount = Math.max(0, users.length - maxVisible);

  return (
    <TooltipProvider>
      <div className={cn('flex -space-x-2', className)}>
        {visibleUsers.map((user, index) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar 
                  className={cn(
                    sizeClasses[size],
                    borderColors[user.status],
                    'transition-transform hover:scale-110 hover:z-10'
                  )}
                  style={{ zIndex: visibleUsers.length - index }}
                >
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {/* Status indicator */}
                <div 
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background',
                    size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4',
                    user.status === 'online' && 'bg-green-500',
                    user.status === 'away' && 'bg-yellow-400',
                    user.status === 'offline' && 'bg-muted-foreground'
                  )}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-muted-foreground capitalize">{user.status}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {overflowCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar 
                className={cn(
                  sizeClasses[size],
                  'bg-muted hover:bg-muted/80 transition-colors cursor-pointer'
                )}
              >
                <AvatarFallback className="text-muted-foreground text-xs">
                  +{overflowCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="text-sm">
                {overflowCount} more {overflowCount === 1 ? 'person' : 'people'}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}