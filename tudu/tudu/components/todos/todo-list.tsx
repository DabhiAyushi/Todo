'use client';

import { TodoItem } from './todo-item';
import { ListTodo } from 'lucide-react';

interface TodoListProps {
  todos: any[];
  onTodoClick?: (todo: any) => void;
}

export function TodoList({ todos, onTodoClick }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
          <ListTodo className="h-12 w-12 text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No todos yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Start by adding your first task above. Use natural language to make it smart!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onClick={() => onTodoClick?.(todo)}
        />
      ))}
    </div>
  );
}
