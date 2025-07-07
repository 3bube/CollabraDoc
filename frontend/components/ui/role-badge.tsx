import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: 'admin' | 'editor' | 'viewer';
  className?: string;
}

const roleConfig = {
  admin: {
    label: 'Admin',
    className: 'bg-primary text-primary-foreground hover:bg-primary/80'
  },
  editor: {
    label: 'Editor', 
    className: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
  },
  viewer: {
    label: 'Viewer',
    className: 'bg-muted text-muted-foreground hover:bg-muted/80'
  }
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role];
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}