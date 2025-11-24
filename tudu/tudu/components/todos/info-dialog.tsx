'use client';

import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function InfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to Use Smart Todo Parsing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Natural Language Input</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Type your tasks naturally and our AI will understand what you mean.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Examples:</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <p className="font-mono text-xs mb-1">Buy groceries tomorrow at 3pm</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  → Creates todo with due date set to tomorrow at 3pm
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <p className="font-mono text-xs mb-1">URGENT: Finish report by Friday</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  → Sets priority to high and due date to Friday
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <p className="font-mono text-xs mb-1">Weekly team meeting every Monday at 10am</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  → Creates recurring task for every Monday
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <p className="font-mono text-xs mb-1">
                  Prepare presentation: research topic, create slides, practice delivery
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  → Automatically breaks down into checklist items
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Priority Keywords</h3>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <p><strong>High:</strong> urgent, asap, important, critical</p>
              <p><strong>Medium:</strong> soon, this week, need to</p>
              <p><strong>Low:</strong> someday, maybe, when possible</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Time Expressions</h3>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <p>tomorrow, next Monday, in 3 days, this weekend</p>
              <p>tonight (8pm), Friday at 3pm, next week</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Categories</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI automatically suggests: work, personal, shopping, health, finance, home, education, social
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Quick Add</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Just type a simple task and click &quot;Quick Add&quot; for instant creation without AI parsing.
            </p>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              💡 Tip: Press ⌘+Enter (or Ctrl+Enter) to quickly parse with AI
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
