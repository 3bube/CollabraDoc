'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Code,
  Link,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange?: (position: number) => void;
  onTextSelection?: (selectedText: string, range: Range | null) => void;
  onClearSelection?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onCursorChange,
  onTextSelection,
  onClearSelection,
  placeholder = "Start writing your document...",
  disabled = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      if (newContent !== content) {
        onChange(newContent);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            execCommand('redo');
          } else {
            execCommand('undo');
          }
          break;
      }
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    let currentSelectedText = '';
    let currentRange: Range | null = null;

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Check if selection is within our editor
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        currentSelectedText = range.toString().trim();
        currentRange = range.cloneRange();
        
        // Update cursor position
        if (onCursorChange) {
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(editorRef.current);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          onCursorChange(preCaretRange.toString().length);
        }
      }
    }

    // Update state and notify parent
    setSelectedText(currentSelectedText);
    setSelectionRange(currentRange);
    
    if (onTextSelection) {
      onTextSelection(currentSelectedText, currentRange);
    }
  };

  const clearSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    setSelectedText('');
    setSelectionRange(null);
    if (onTextSelection) {
      onTextSelection('', null);
    }
    if (onClearSelection) {
      onClearSelection();
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <Card className="p-2 mb-2">
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('bold')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('italic')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('underline')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', '<h1>')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', '<h2>')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', '<h3>')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', '<blockquote>')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', '<pre>')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyLeft')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyCenter')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyRight')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('undo')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('redo')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={insertLink}
            disabled={disabled}
            className="h-8 px-2"
            title="Insert Link"
          >
            <Link className="h-4 w-4 mr-1" />
            Link
          </Button>
        </div>
      </Card>

      {/* Editor */}
      <Card className="flex-1 p-4">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          className={cn(
            "w-full h-full min-h-[400px] outline-none resize-none",
            "prose prose-sm max-w-none",
            "text-foreground placeholder:text-muted-foreground",
            isFocused && "ring-2 ring-ring ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ 
            fontFamily: 'inherit', 
            fontSize: 'inherit', 
            lineHeight: '1.6',
            overflowY: 'auto'
          }}
          data-placeholder={placeholder}
        />
      </Card>
    </div>
  );
};

export default RichTextEditor; 