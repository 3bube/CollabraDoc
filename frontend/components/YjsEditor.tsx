'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Users, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import RichTextEditor from './RichTextEditor';

interface YjsEditorProps {
  documentId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onUsersChange?: (users: UserPresence[]) => void;
  onTextSelection?: (text: string, range: Range | null) => void;
  onClearSelection?: () => void;
}

interface UserPresence {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: number;
}

const YjsEditor: React.FC<YjsEditorProps> = ({ 
  documentId, 
  initialContent = '', 
  onSave,
  onUsersChange,
  onTextSelection,
  onClearSelection
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a random color for the user
  const userColor = useRef(`hsl(${Math.random() * 360}, 70%, 50%)`);

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket server
    const ws = new WebSocket(`ws://localhost:1234?d=${documentId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      
      // Send user presence
      ws.send(JSON.stringify({
        type: 'presence',
        userId: user.id,
        name: user.full_name || user.email,
        email: user.email,
        color: userColor.current
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'init':
            // Set initial content from server
            if (data.content && data.content !== content) {
              setContent(data.content);
            }
            break;
            
          case 'update':
            // Update content from other users
            if (data.content !== content) {
              setContent(data.content);
            }
            break;
            
          case 'presence':
            // Update active users
            const users: UserPresence[] = data.users
              .filter(([userId, userData]: [string, any]) => userId !== user.id)
              .map(([userId, userData]: [string, any]) => ({
                id: userId,
                name: userData.name,
                email: userData.email,
                color: userData.color
              }));
            setActiveUsers(users);
            if (onUsersChange) {
              onUsersChange(users);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [documentId, user]);

  const handleSave = async (contentToSave: string = content) => {
    if (!onSave) return;
    
    try {
      await onSave(contentToSave);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const handleTextChange = (newValue: string) => {
    setContent(newValue);
    
    // Send update to WebSocket server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update',
        content: newValue,
        documentId: documentId
      }));
    }
    
    // Auto-save after 2 seconds of inactivity
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newValue);
    }, 2000);
  };

  const handleCursorChange = (position: number) => {
    // Send cursor position to WebSocket server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor',
        userId: user?.id,
        position: position,
        documentId: documentId
      }));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {activeUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {activeUsers.length} active
                </span>
                <div className="flex -space-x-2">
                  {activeUsers.slice(0, 3).map((user) => (
                    <Avatar key={user.id} className="w-6 h-6 border-2 border-background">
                      <AvatarFallback 
                        className="text-xs"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {activeUsers.length > 3 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      +{activeUsers.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Editor */}
      <div className="flex-1">
        <RichTextEditor
          content={content}
          onChange={handleTextChange}
          onCursorChange={handleCursorChange}
          placeholder="Start writing your document..."
          onTextSelection={onTextSelection}
          onClearSelection={onClearSelection}
        />
      </div>

      {/* Active Users Sidebar */}
      {activeUsers.length > 0 && (
        <Card className="mt-4 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Active Users</span>
          </div>
          <div className="space-y-2">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback 
                    className="text-sm"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default YjsEditor; 