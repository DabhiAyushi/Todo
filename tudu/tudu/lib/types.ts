import { z } from 'zod';

// Expense categories
export const expenseCategories = [
  'food',
  'lifestyle',
  'subscriptions',
  'transportation',
  'shopping',
  'entertainment',
  'utilities',
  'healthcare',
  'other',
] as const;

export type ExpenseCategory = typeof expenseCategories[number];

// Zod schema for a single expense item
export const expenseSchema = z.object({
  merchantName: z.string().nullable().optional(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  category: z.enum(expenseCategories),
  date: z.string().nullable().optional(), // ISO date string
  description: z.string().nullable().optional(),
  confidence: z.number().min(0).max(100).optional(),
});

// Zod schema for the AI response with multiple expenses
export const receiptAnalysisSchema = z.object({
  expenses: z.array(expenseSchema),
  totalAmount: z.number().optional(),
  currency: z.string().default('INR'),
  receiptDate: z.string().nullable().optional(),
  merchantName: z.string().nullable().optional(),
});

// TypeScript types inferred from Zod schemas
export type Expense = z.infer<typeof expenseSchema>;
export type ReceiptAnalysis = z.infer<typeof receiptAnalysisSchema>;

// Receipt status
export type ReceiptStatus = 'pending' | 'processed' | 'failed';

// Database types
export interface Receipt {
  id: number;
  imageUrl: string | null;
  uploadedAt: Date;
  processedAt: Date | null;
  status: ReceiptStatus;
}

export interface ExpenseRecord {
  id: number;
  receiptId: number;
  merchantName: string | null;
  amount: string; // Decimal stored as string
  currency: string;
  category: ExpenseCategory;
  date: Date | null;
  description: string | null;
  confidence: string | null; // Decimal stored as string
  createdAt: Date;
}

// Todo priorities
export const todoPriorities = ['high', 'medium', 'low', 'none'] as const;
export type TodoPriority = typeof todoPriorities[number];

// Todo categories
export const todoCategories = [
  'work',
  'personal',
  'shopping',
  'health',
  'finance',
  'home',
  'education',
  'social',
  'other',
] as const;
export type TodoCategory = typeof todoCategories[number];

// Zod schema for a checklist item
export const checklistItemSchema = z.object({
  title: z.string(),
  isCompleted: z.boolean().default(false),
  order: z.number().default(0),
});

// Zod schema for AI-parsed todo
export const todoParsedSchema = z.object({
  title: z.string().describe('The main task title'),
  description: z.string().nullable().optional().describe('Additional details or notes about the task'),
  dueDate: z.string().nullable().optional().describe('ISO datetime string when the task is due'),
  priority: z.enum(todoPriorities).describe('Task priority level based on urgency indicators in text'),
  category: z.enum(todoCategories).nullable().optional().describe('Suggested category for the task'),
  tags: z.array(z.string()).optional().describe('Relevant tags or labels extracted from the text'),
  isRecurring: z.boolean().default(false).describe('Whether this is a recurring task'),
  recurrencePattern: z.string().nullable().optional().describe('Pattern like "daily", "weekly", "every Monday"'),
  checklistItems: z.array(checklistItemSchema).optional().describe('Sub-tasks or checklist items if the task can be broken down'),
  confidence: z.number().min(0).max(100).optional().describe('Confidence score for the parsing'),
});

// TypeScript types inferred from Zod schemas
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type TodoParsed = z.infer<typeof todoParsedSchema>;

// Database types for todos
export interface Todo {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: TodoPriority;
  category: string | null;
  tags: string[] | null;
  isRecurring: boolean;
  recurrencePattern: string | null;
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoChecklistItem {
  id: number;
  todoId: number;
  title: string;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
}

export interface TodoAttachment {
  id: number;
  todoId: number;
  type: 'note' | 'file';
  content: string;
  fileName: string | null;
  createdAt: Date;
}
