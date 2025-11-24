'use client';

import { useEffect, useState } from 'react';
import { X, Calendar, Tag, CheckSquare, FileText, Repeat, AlertCircle } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChecklistItem } from './checklist-item';

interface TodoDrawerProps {
  todo: any | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function TodoDrawer({ todo, open, onClose, onUpdate }: TodoDrawerProps) {
  const [todoData, setTodoData] = useState<any>(null);

  useEffect(() => {
    setTodoData(todo);
  }, [todo]);

  if (!todoData) return null;

  const handleChecklistToggle = (itemId: number, currentState: boolean) => {
    // Optimistically update the local state
    setTodoData((prev: any) => ({
      ...prev,
      checklistItems: prev.checklistItems?.map((item: any) =>
        item.id === itemId ? { ...item, isCompleted: !currentState } : item
      ),
    }));
  };

  const handleChecklistDelete = (itemId: number) => {
    // Optimistically remove from local state
    setTodoData((prev: any) => ({
      ...prev,
      checklistItems: prev.checklistItems?.filter((item: any) => item.id !== itemId),
    }));
  };


  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isOverdue = todoData.dueDate && new Date(todoData.dueDate) < new Date() && !todoData.isCompleted;

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent>
        <div className="h-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1 pr-4">
            <h2 className={`text-lg font-semibold ${todoData.isCompleted ? 'line-through text-gray-500' : ''}`}>
              {todoData.title}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {todoData.priority !== 'none' && (
                <Badge variant="outline">
                  {todoData.priority}
                </Badge>
              )}
              {todoData.category && (
                <Badge variant="outline">{todoData.category}</Badge>
              )}
              {todoData.isCompleted && (
                <Badge variant="outline">
                  Completed
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Description */}
          {todoData.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {todoData.description}
              </p>
            </div>
          )}

          {/* Due Date */}
          {todoData.dueDate && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                Due Date
              </div>
              <p className={`text-sm pl-6 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                {formatDate(todoData.dueDate)}
                {isOverdue && ' (Overdue!)'}
              </p>
            </div>
          )}

          {/* Recurring */}
          {todoData.isRecurring && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Repeat className="h-4 w-4" />
                Recurring
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {todoData.recurrencePattern || 'Yes'}
              </p>
            </div>
          )}

          {/* Tags */}
          {todoData.tags && todoData.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Tag className="h-4 w-4" />
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5 pl-6">
                {todoData.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          {todoData.checklistItems && todoData.checklistItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <CheckSquare className="h-4 w-4" />
                Checklist ({todoData.checklistItems.filter((i: any) => i.isCompleted).length}/
                {todoData.checklistItems.length})
              </div>
              <div className="space-y-2 pl-6">
                {todoData.checklistItems.map((item: any) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    onToggle={handleChecklistToggle}
                    onDelete={handleChecklistDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {todoData.attachments && todoData.attachments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4" />
                Attachments ({todoData.attachments.length})
              </div>
              <div className="space-y-2 pl-6">
                {todoData.attachments.map((attachment: any) => (
                  <div
                    key={attachment.id}
                    className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {attachment.type === 'note' ? (
                      <p>{attachment.content}</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{attachment.fileName || 'File'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-1 text-xs text-gray-500 dark:text-gray-500">
            <p>Created: {new Date(todoData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            {todoData.updatedAt && (
              <p>Updated: {new Date(todoData.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            )}
            {todoData.completedAt && (
              <p>Completed: {new Date(todoData.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            )}
          </div>
        </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
