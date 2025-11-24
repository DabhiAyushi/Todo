"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { TodoList } from "@/components/todos/todo-list";
import { TodoFilters } from "@/components/todos/todo-filters";
import { TodoDrawer } from "@/components/todos/todo-drawer";

async function fetchTodos(filters: any) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.includeOldCompleted) params.set("includeOldCompleted", "true");

  const response = await fetch(`/api/todos?${params.toString()}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch todos");
  }

  return result.data;
}

export default function TodosPage() {
  const [filters, setFilters] = useState<any>({});
  const [selectedTodo, setSelectedTodo] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos", filters],
    queryFn: () => fetchTodos(filters),
  });

  const handleTodoClick = (todo: any) => {
    setSelectedTodo(todo);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedTodo(null);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Todos</h1>
        <p className="text-muted-foreground">
          Manage your tasks with smart AI parsing
        </p>
      </div>

      {/* Filters */}
      <TodoFilters filters={filters} onFilterChange={setFilters} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{todos.length}</div>
          <div className="text-xs text-muted-foreground">Total Tasks</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-primary">
            {todos.filter((t: any) => t.isCompleted).length}
          </div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-secondary">
            {todos.filter((t: any) => !t.isCompleted).length}
          </div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
      </div>

      {/* Todo List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <TodoList todos={todos} onTodoClick={handleTodoClick} />
      )}

      {/* Todo Drawer */}
      <TodoDrawer
        todo={selectedTodo}
        open={isDrawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  );
}
