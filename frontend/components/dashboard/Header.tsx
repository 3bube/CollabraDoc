"use client";

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { useDialog } from '@/context/useDialog'

function Header() {

    const { onOpenChange } = useDialog();

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
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => onOpenChange(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search documents... (⌘K)" 
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>
  )
}

export default Header
