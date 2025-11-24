'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Clock, Repeat, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: any;
  onClick?: () => void;
}

export function TodoItem({ todo, onClick }: TodoItemProps) {
  const queryClient = useQueryClient();
  const [optimisticCompleted, setOptimisticCompleted] = useState(todo.isCompleted);

  useEffect(() => {
    setOptimisticCompleted(todo.isCompleted);
  }, [todo.isCompleted]);

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async (todoId: number) => {
      const response = await fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: todoId, action: 'toggle' }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update todo');
      }
      return result.data;
    },
    onMutate: async (todoId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: ['todos'] },
        (old: any[] | undefined) => {
          if (!old) return old;
          return old.map((t) =>
            t.id === todoId ? { ...t, isCompleted: !t.isCompleted } : t
          );
        }
      );

      // Update local state
      setOptimisticCompleted(!optimisticCompleted);

      return { previousTodos };
    },
    onError: (err, todoId, context) => {
      // Revert on error
      if (context?.previousTodos) {
        queryClient.setQueriesData({ queryKey: ['todos'] }, context.previousTodos);
      }
      setOptimisticCompleted(!optimisticCompleted);
      toast.error('Failed to update todo');
    },
    onSuccess: () => {
      toast.success(optimisticCompleted ? 'Todo reopened' : 'Todo completed!');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (todoId: number) => {
      const response = await fetch(`/api/todos?id=${todoId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete todo');
      }
      return result.data;
    },
    onMutate: async (todoId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically remove from cache
      queryClient.setQueriesData(
        { queryKey: ['todos'] },
        (old: any[] | undefined) => {
          if (!old) return old;
          return old.filter((t) => t.id !== todoId);
        }
      );

      return { previousTodos };
    },
    onError: (err, todoId, context) => {
      // Revert on error
      if (context?.previousTodos) {
        queryClient.setQueriesData({ queryKey: ['todos'] }, context.previousTodos);
      }
      toast.error('Failed to delete todo');
    },
    onSuccess: () => {
      toast.success('Todo deleted');
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMutation.mutate(todo.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    deleteMutation.mutate(todo.id);
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !optimisticCompleted;
  const completedChecklistCount = todo.checklistItems?.filter((item: any) => item.isCompleted).length || 0;
  const totalChecklistCount = todo.checklistItems?.length || 0;

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-lg border bg-card cursor-pointer transition-all',
        'hover:shadow-sm hover:border-foreground/20',
        optimisticCompleted && 'opacity-50',
        deleteMutation.isPending && 'animate-pulse'
      )}
      onClick={onClick}
    >
      {/* Priority indicator */}
      {todo.priority !== 'none' && !optimisticCompleted && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
            todo.priority === 'high' && 'bg-foreground',
            todo.priority === 'medium' && 'bg-foreground/60',
            todo.priority === 'low' && 'bg-foreground/30'
          )}
        />
      )}

      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={toggleMutation.isPending}
        className={cn(
          'mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
          optimisticCompleted
            ? 'bg-foreground border-foreground'
            : 'border-border hover:border-foreground/50'
        )}
      >
        {optimisticCompleted && <Check className="h-3.5 w-3.5 text-background" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title and Delete Button */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'font-medium text-sm leading-tight',
              optimisticCompleted && 'line-through text-muted-foreground'
            )}
          >
            {todo.title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>

        {/* Description */}
        {todo.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {todo.description}
          </p>
        )}

        {/* Meta information */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {todo.category && (
            <Badge variant="secondary" className="text-xs font-normal">
              {todo.category}
            </Badge>
          )}
          {todo.dueDate && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-normal gap-1',
                isOverdue && 'border-destructive text-destructive'
              )}
            >
              <Clock className="h-3 w-3" />
              {formatDueDate(todo.dueDate)}
            </Badge>
          )}
          {todo.isRecurring && (
            <Badge variant="outline" className="text-xs font-normal gap-1">
              <Repeat className="h-3 w-3" />
              {todo.recurrencePattern || 'Recurring'}
            </Badge>
          )}
          {totalChecklistCount > 0 && (
            <Badge variant="outline" className="text-xs font-normal">
              {completedChecklistCount}/{totalChecklistCount}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {todo.tags && todo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {todo.tags.map((tag: string, i: number) => (
              <span key={i} className="text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
