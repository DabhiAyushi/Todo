"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface TodoInputProps {
  onTodoCreated?: () => void;
}

export function TodoInput({ onTodoCreated }: TodoInputProps) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const handleParse = async () => {
    if (!input.trim()) return;

    setIsParsing(true);
    setPreview(null);

    try {
      const response = await fetch("/api/todos/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const result = await response.json();

      if (result.success) {
        setPreview(result.data);
      } else {
        toast.error(result.error || "Failed to parse todo");
      }
    } catch (error) {
      toast.error("Failed to parse todo. Please try again.");
      console.error("Error parsing todo:", error);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreate = async () => {
    if (!preview) return;

    setIsCreating(true);

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Todo created successfully!");
        setInput("");
        setPreview(null);
        onTodoCreated?.();
        // Invalidate todos query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["todos"] });
      } else {
        toast.error(result.error || "Failed to create todo");
      }
    } catch (error) {
      toast.error("Failed to create todo. Please try again.");
      console.error("Error creating todo:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!input.trim()) {
      toast.error("Please enter a task");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.trim(),
          priority: "none",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Todo added!");
        setInput("");
        onTodoCreated?.();
        // Invalidate todos query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["todos"] });
      } else {
        toast.error(result.error || "Failed to add todo");
      }
    } catch (error) {
      toast.error("Failed to add todo. Please try again.");
      console.error("Error adding todo:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              handleParse();
            }
          }}
          placeholder="Type your task... (e.g., 'Buy groceries tomorrow at 3pm' or 'URGENT: Finish report by Friday')"
          className="min-h-[100px] resize-none"
          disabled={isParsing || isCreating}
        />
      </div>

      {input.trim() && !preview && (
        <div className=" ms-auto flex gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleQuickAdd}
            disabled={isParsing || isCreating}
          >
            <Plus className="h-4 w-4 mr-1" />
            Quick Add
          </Button>
          <Button
            size="sm"
            onClick={handleParse}
            disabled={isParsing || isCreating}
          >
            {isParsing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Smart Parse
              </>
            )}
          </Button>
        </div>
      )}

      {preview && (
        <div className="p-4 rounded-lg border bg-muted/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Smart TODO
            </h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPreview(null)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Todo"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {preview.title}
              </span>
            </div>

            {preview.description && (
              <div className="text-gray-600 dark:text-gray-400">
                {preview.description}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {preview.priority !== "none" && (
                <Badge variant="secondary">{preview.priority}</Badge>
              )}
              {preview.category && (
                <Badge variant="secondary">{preview.category}</Badge>
              )}
              {preview.dueDate && (
                <Badge variant="outline">
                  Due: {formatDate(preview.dueDate)}
                </Badge>
              )}
              {preview.isRecurring && (
                <Badge variant="outline">Recurring</Badge>
              )}
            </div>

            {preview.tags && preview.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {preview.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="default" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {preview.checklistItems && preview.checklistItems.length > 0 && (
              <div className="space-y-1 pl-2 border-l-2 border-border">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Checklist:
                </div>
                {preview.checklistItems.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    • {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
