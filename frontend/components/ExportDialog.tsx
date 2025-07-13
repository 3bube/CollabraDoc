'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  FileDown, 
  Settings,
  Check,
  Clock,
  User
} from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle: string;
  documentContent: string;
  documentAuthor?: string;
  documentUpdatedAt?: string;
}

interface ExportOption {
  id: string;
  name: string;
  description: string;
  format: string;
  icon: React.ReactNode;
  features: string[];
  estimatedTime: string;
}

const exportOptions: ExportOption[] = [
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'Export as a professional PDF document',
    format: 'PDF',
    icon: <FileText className="h-6 w-6" />,
    features: [
      'Preserves formatting and styling',
      'Includes document metadata',
      'Professional layout',
      'Print-ready'
    ],
    estimatedTime: '2-5 seconds'
  },
  {
    id: 'markdown',
    name: 'Markdown File',
    description: 'Export as a Markdown (.md) file',
    format: 'MD',
    icon: <FileDown className="h-6 w-6" />,
    features: [
      'Plain text format',
      'Version control friendly',
      'Easy to edit',
      'Platform independent'
    ],
    estimatedTime: '1-2 seconds'
  },
  {
    id: 'html',
    name: 'HTML Document',
    description: 'Export as a web-ready HTML file',
    format: 'HTML',
    icon: <FileText className="h-6 w-6" />,
    features: [
      'Web-compatible format',
      'Preserves styling',
      'Can be opened in browsers',
      'Easy to share online'
    ],
    estimatedTime: '1-3 seconds'
  }
];

export function ExportDialog({ 
  open, 
  onOpenChange, 
  documentTitle,
  documentContent,
  documentAuthor,
  documentUpdatedAt 
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeComments, setIncludeComments] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const selectedOption = exportOptions.find(option => option.id === selectedFormat);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create export content
      let exportContent = documentContent;
      
      if (includeMetadata) {
        const metadata = `---
title: ${documentTitle}
author: ${documentAuthor || 'Unknown'}
updated: ${documentUpdatedAt || new Date().toISOString()}
exported: ${new Date().toISOString()}
---

`;
        exportContent = metadata + exportContent;
      }
      
      // Create and download file
      const blob = new Blob([exportContent], { 
        type: selectedFormat === 'pdf' ? 'application/pdf' : 
              selectedFormat === 'markdown' ? 'text/markdown' : 'text/html' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${
        selectedFormat === 'pdf' ? 'pdf' : 
        selectedFormat === 'markdown' ? 'md' : 'html'
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedOption = exportOptions.find(option => option.id === selectedFormat);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription>
            Choose a format to export "{documentTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Options */}
          <div className="space-y-3">
            <h3 className="font-medium">Export Format</h3>
            <div className="grid gap-3">
              {exportOptions.map((option) => (
                <Card 
                  key={option.id}
                  className={`cursor-pointer transition-colors ${
                    selectedFormat === option.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedFormat(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{option.name}</h4>
                          <Badge variant="outline">{option.format}</Badge>
                          {selectedFormat === option.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {option.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {option.estimatedTime}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {option.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Export Options */}
          <div className="space-y-3">
            <h3 className="font-medium">Export Options</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Include Metadata</div>
                  <div className="text-sm text-muted-foreground">
                    Add document title, author, and timestamps
                  </div>
                </div>
                <Button
                  variant={includeMetadata ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIncludeMetadata(!includeMetadata)}
                >
                  {includeMetadata ? 'Yes' : 'No'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Include Comments</div>
                  <div className="text-sm text-muted-foreground">
                    Export document comments and annotations
                  </div>
                </div>
                <Button
                  variant={includeComments ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIncludeComments(!includeComments)}
                >
                  {includeComments ? 'Yes' : 'No'}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedOption && (
            <div className="space-y-3">
              <h3 className="font-medium">Preview</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{documentTitle}</span>
                    </div>
                    {documentAuthor && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{documentAuthor}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Estimated time: {selectedOption.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span>Format: {selectedOption.format}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {selectedOption?.format}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 