"use client";

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, FolderPlus } from 'lucide-react'
import { useDialog } from '@/context/useDialog'
import { SearchDialog } from '@/components/SearchDialog'

interface HeaderProps {
  onCreateFolder?: () => void;
}

function Header({ onCreateFolder }: HeaderProps) {
  const { onOpenChange } = useDialog();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  return (
    <div className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground mt-1">
              Continue working on your technical documentation
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={onCreateFolder}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => onOpenChange(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents... (⌘K)" 
              className="pl-10"
              onClick={() => setSearchDialogOpen(true)}
              readOnly
            />
          </div>
        </div>
      </div>
      
      {/* Search Dialog */}
      <SearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
      />
    </div>
  )
}

export default Header
