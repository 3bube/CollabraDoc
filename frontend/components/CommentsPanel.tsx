'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Reply, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Check,
  X,
  Plus,
  Highlighter,
  MapPin,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth-context';
import { commentApi, Comment, TextSelection, handleApiError } from '@/lib/api';
import { toast } from 'sonner';

interface CommentsPanelProps {
  documentId: string;
  isOpen: boolean;
  onToggle: () => void;
  selectedText?: string;
  selectionRange?: Range | null;
  onTextSelection?: (text: string, range: Range | null) => void;
  onClearSelection?: () => void;
  onAddComment?: (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) => void;
  onSelectionChange?: (selection: TextSelection | null) => void;
  currentSelection?: TextSelection | null;
}

export function CommentsPanel({ 
  documentId, 
  isOpen, 
  onToggle,
  selectedText,
  selectionRange,
  onTextSelection,
  onClearSelection,
  onAddComment,
  onSelectionChange,
  currentSelection
}: CommentsPanelProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showSelectionTooltip, setShowSelectionTooltip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Load comments when panel opens
  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, documentId]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const commentsData = await commentApi.getByDocument(documentId);
      setComments(commentsData);
    } catch (err) {
      console.error('Failed to load comments:', err);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const commentData = {
        content: newComment.trim(),
        document_id: documentId,
        selection: selectedText ? {
          start: 0,
          end: selectedText.length,
          text: selectedText
        } : undefined
      };

      const newCommentData = await commentApi.create(commentData);
      
      // Add to local state
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      
      // Clear selection after adding comment
      if (onClearSelection) {
        onClearSelection();
      }

      toast.success('Comment added successfully');
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim() || !user) return;

    setLoading(true);
    try {
      const replyData = {
        content: replyContent.trim(),
        document_id: documentId,
        parent_id: commentId
      };

      const newReply = await commentApi.create(replyData);

      // Update local state
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, replies: [...comment.replies, newReply] }
            : comment
        )
      );

      setReplyingTo(null);
      setReplyContent('');
      toast.success('Reply added successfully');
    } catch (err) {
      console.error('Failed to add reply:', err);
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      const updatedComment = await commentApi.update(commentId, {
        content: editContent.trim()
      });

      // Update local state
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: updatedComment.content, updated_at: updatedComment.updated_at }
            : comment
        )
      );

      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated successfully');
    } catch (err) {
      console.error('Failed to update comment:', err);
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    setLoading(true);
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const updatedComment = await commentApi.update(commentId, {
        resolved: !comment.resolved
      });

      // Update local state
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, resolved: updatedComment.resolved }
            : comment
        )
      );

      toast.success(`Comment ${updatedComment.resolved ? 'resolved' : 'reopened'}`);
    } catch (err) {
      console.error('Failed to update comment status:', err);
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setLoading(true);
    try {
      await commentApi.delete(commentId);

      // Remove from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    if (onClearSelection) {
      onClearSelection();
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isAuthor = user?.id === comment.author.id;
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
      <Card key={comment.id} className={`${isReply ? 'ml-6' : ''} ${comment.resolved ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.avatar} />
              <AvatarFallback className="text-xs">
                {comment.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
                {comment.resolved && (
                  <Badge variant="secondary" className="text-xs">Resolved</Badge>
                )}
                {comment.selection && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Selection
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Edit your comment..."
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm mb-3">{comment.content}</p>
                  
                  {comment.selection && (
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded border-l-4 border-yellow-400 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Highlighter className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                          Selected Text
                        </span>
                      </div>
                      <p className="text-xs text-yellow-800 dark:text-yellow-200 italic">
                        "{comment.selection.text}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {!isReply && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    )}
                    
                    {isAuthor && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditContent(comment.content);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResolveComment(comment.id)}
                    >
                      {comment.resolved ? 'Reopen' : 'Resolve'}
                    </Button>
                  </div>
                </div>
              )}

              {isReplying && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleReply(comment.id)}>
                      <Check className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-4 space-y-3">
                  {comment.replies.map(reply => renderComment(reply, true))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-border bg-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
          <Badge variant="secondary">{comments.length}</Badge>
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col h-full">
        {/* Add Comment */}
        <div className="p-4 border-b border-border">
          {selectedText && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border-l-4 border-blue-400 mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Highlighter className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    Commenting on selection
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClearSelection || handleClearSelection}
                  className="h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-blue-800 dark:text-blue-200 italic">
                "{selectedText}"
              </p>
            </div>
          )}
          
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={selectedText ? "Add a comment about this selection..." : "Add a comment..."}
            className="min-h-[100px] mb-3"
          />
          <Button 
            onClick={handleAddComment}
            disabled={!newComment.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {selectedText ? 'Add Selection Comment' : 'Add Comment'}
          </Button>
        </div>

        {/* Comments List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {loadingComments ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map(comment => renderComment(comment))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No comments yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedText 
                    ? 'Add a comment about your selection' 
                    : 'Start the conversation by adding a comment'
                  }
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 