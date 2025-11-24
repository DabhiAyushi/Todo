'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ChecklistItemProps {
  item: any;
  onToggle?: (itemId: number, currentState: boolean) => void;
  onDelete?: (itemId: number) => void;
}

export function ChecklistItem({ item, onToggle, onDelete }: ChecklistItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    // Optimistic update
    onToggle?.(item.id, item.isCompleted);

    // Make API call in background
    try {
      const response = await fetch('/api/todos/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, action: 'toggle' }),
      });

      const result = await response.json();

      if (!result.success) {
        // Revert on failure
        onToggle?.(item.id, !item.isCompleted);
        toast.error('Failed to update checklist item');
      }
    } catch (error) {
      // Revert on error
      onToggle?.(item.id, !item.isCompleted);
      toast.error('Failed to update checklist item');
      console.error('Error toggling checklist item:', error);
    }
  };

  const handleDelete = async () => {
    // Optimistic delete
    setIsDeleting(true);
    onDelete?.(item.id);

    // Make API call in background
    try {
      const response = await fetch(`/api/todos/checklist?id=${item.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        toast.error('Failed to delete checklist item');
        // Note: In a real app, you'd want to revert the deletion here
        // For now, we'll just show the error
      }
    } catch (error) {
      toast.error('Failed to delete checklist item');
      console.error('Error deleting checklist item:', error);
      // Note: In a real app, you'd want to revert the deletion here
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 group ${
        isDeleting ? 'animate-pulse opacity-50' : ''
      }`}
    >
      <button
        onClick={handleToggle}
        className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
          item.isCompleted
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
        }`}
      >
        {item.isCompleted && (
          <Check className="h-3 w-3 text-white animate-in zoom-in duration-200" />
        )}
      </button>

      <span
        className={`flex-1 text-sm ${
          item.isCompleted
            ? 'line-through text-gray-500 dark:text-gray-500'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {item.title}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
      </Button>
    </div>
  );
}
