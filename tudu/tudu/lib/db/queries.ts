import { db } from '@/lib/db';
import { receipts, expenses, todos, todoChecklistItems, todoAttachments } from '@/lib/db/schema';
import { sql, desc, eq, and, gte, lte, or, not } from 'drizzle-orm';

export type DateRange = {
  from: Date;
  to: Date;
};

// Get spending grouped by category
export async function getSpendingByCategory(dateRange?: DateRange) {
  const conditions = dateRange
    ? and(
        gte(expenses.createdAt, dateRange.from),
        lte(expenses.createdAt, dateRange.to)
      )
    : undefined;

  const result = await db
    .select({
      category: expenses.category,
      total: sql<number>`CAST(COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0) AS FLOAT)`.as('total'),
      count: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('count'),
    })
    .from(expenses)
    .where(conditions)
    .groupBy(expenses.category)
    .orderBy(sql`total DESC`);

  return result;
}

// Get spending over time (grouped by day)
export async function getSpendingOverTime(dateRange?: DateRange) {
  const conditions = dateRange
    ? and(
        sql`${expenses.date} IS NOT NULL`,
        gte(expenses.date, dateRange.from),
        lte(expenses.date, dateRange.to)
      )
    : sql`${expenses.date} IS NOT NULL`;

  const result = await db
    .select({
      date: sql<string>`TO_CHAR(${expenses.date}, 'YYYY-MM-DD')`.as('date'),
      total: sql<number>`CAST(COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0) AS FLOAT)`.as('total'),
      count: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('count'),
    })
    .from(expenses)
    .where(conditions)
    .groupBy(sql`TO_CHAR(${expenses.date}, 'YYYY-MM-DD')`)
    .orderBy(sql`date ASC`);

  return result;
}

// Get top merchants by spending
export async function getTopMerchants(limit: number = 10, dateRange?: DateRange) {
  const conditions = dateRange
    ? and(
        sql`${expenses.merchantName} IS NOT NULL`,
        gte(expenses.createdAt, dateRange.from),
        lte(expenses.createdAt, dateRange.to)
      )
    : sql`${expenses.merchantName} IS NOT NULL`;

  const result = await db
    .select({
      merchantName: expenses.merchantName,
      total: sql<number>`CAST(COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0) AS FLOAT)`.as('total'),
      count: sql<number>`CAST(COUNT(DISTINCT ${expenses.receiptId}) AS INTEGER)`.as('count'),
    })
    .from(expenses)
    .where(conditions)
    .groupBy(expenses.merchantName)
    .orderBy(sql`total DESC`)
    .limit(limit);

  return result;
}

// Get total spending and statistics
export async function getTotalSpending(dateRange?: DateRange) {
  const expenseConditions = dateRange
    ? and(
        gte(expenses.createdAt, dateRange.from),
        lte(expenses.createdAt, dateRange.to)
      )
    : undefined;

  const receiptConditions = dateRange
    ? and(
        gte(receipts.uploadedAt, dateRange.from),
        lte(receipts.uploadedAt, dateRange.to)
      )
    : undefined;

  // Get expense totals
  const expenseResult = await db
    .select({
      total: sql<number>`CAST(COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0) AS FLOAT)`.as('total'),
      expenseCount: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('expenseCount'),
      average: sql<number>`CAST(COALESCE(AVG(CAST(${expenses.amount} AS DECIMAL)), 0) AS FLOAT)`.as('average'),
    })
    .from(expenses)
    .where(expenseConditions);

  // Get receipt count
  const receiptResult = await db
    .select({
      receiptCount: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('receiptCount'),
    })
    .from(receipts)
    .where(receiptConditions);

  return {
    total: expenseResult[0].total,
    count: receiptResult[0].receiptCount, // Use receipt count for user-facing "Transactions"
    expenseCount: expenseResult[0].expenseCount, // Keep expense count for internal use
    average: expenseResult[0].average,
  };
}

// Get all receipts with their expenses
export async function getAllReceipts(dateRange?: DateRange) {
  const conditions = dateRange
    ? and(
        gte(receipts.uploadedAt, dateRange.from),
        lte(receipts.uploadedAt, dateRange.to)
      )
    : undefined;

  const receiptsData = await db.query.receipts.findMany({
    where: conditions,
    with: {
      expenses: true,
    },
    orderBy: [desc(receipts.uploadedAt)],
  });

  return receiptsData;
}

// Get a single receipt with expenses
export async function getReceiptById(id: number) {
  const receipt = await db.query.receipts.findFirst({
    where: eq(receipts.id, id),
    with: {
      expenses: true,
    },
  });

  return receipt;
}

// ==================== TODO QUERIES ====================

export type TodoFilters = {
  includeCompleted?: boolean; // Include completed todos older than 1 day
  includeOldCompleted?: boolean; // Specifically include old completed todos
  category?: "work" | "personal" | "shopping" | "health" | "finance" | "home" | "education" | "social" | "other";
  priority?: "high" | "medium" | "low" | "none";
  tags?: string[];
  dateRange?: DateRange;
};

// Get all todos with optional filters
// By default, excludes completed todos older than 1 day
export async function getTodos(filters?: TodoFilters) {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  let conditions = [];

  // Default: exclude completed todos older than 1 day unless includeOldCompleted is true
  if (!filters?.includeOldCompleted) {
    conditions.push(
      or(
        eq(todos.isCompleted, false),
        and(
          eq(todos.isCompleted, true),
          gte(todos.completedAt, oneDayAgo)
        )
      )
    );
  }

  // Category filter
  if (filters?.category) {
    conditions.push(eq(todos.category, filters.category));
  }

  // Priority filter
  if (filters?.priority) {
    conditions.push(eq(todos.priority, filters.priority));
  }

  // Date range filter
  if (filters?.dateRange) {
    conditions.push(
      and(
        gte(todos.createdAt, filters.dateRange.from),
        lte(todos.createdAt, filters.dateRange.to)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch todos with proper ordering using SQL
  const todosData = await db
    .select()
    .from(todos)
    .where(whereClause)
    .orderBy(
      todos.isCompleted, // Incomplete first (false before true)
      sql`CASE ${todos.priority}
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
        ELSE 4
      END`, // High priority first
      desc(todos.createdAt) // Newest first
    );

  // Fetch related data for each todo
  const todosWithRelations = await Promise.all(
    todosData.map(async (todo) => {
      const checklistItems = await db.query.todoChecklistItems.findMany({
        where: eq(todoChecklistItems.todoId, todo.id),
        orderBy: [todoChecklistItems.order],
      });

      const attachments = await db.query.todoAttachments.findMany({
        where: eq(todoAttachments.todoId, todo.id),
      });

      return {
        ...todo,
        checklistItems,
        attachments,
      };
    })
  );

  return todosWithRelations;
}

// Get a single todo with all related data
export async function getTodoById(id: number) {
  const todo = await db.query.todos.findFirst({
    where: eq(todos.id, id),
    with: {
      checklistItems: {
        orderBy: [todoChecklistItems.order],
      },
      attachments: true,
    },
  });

  return todo;
}

// Create a new todo
export async function createTodo(data: {
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority?: string;
  category?: string | null;
  tags?: string[] | null;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
}) {
  const [newTodo] = await db
    .insert(todos)
    .values({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority as any || 'none',
      category: data.category,
      tags: data.tags,
      isRecurring: data.isRecurring || false,
      recurrencePattern: data.recurrencePattern,
    })
    .returning();

  return newTodo;
}

// Update a todo
export async function updateTodo(
  id: number,
  data: Partial<{
    title: string;
    description: string | null;
    dueDate: Date | null;
    priority: string;
    category: string | null;
    tags: string[] | null;
    isRecurring: boolean;
    recurrencePattern: string | null;
    isCompleted: boolean;
  }>
) {
  const updateData: any = { ...data, updatedAt: new Date() };

  // If marking as completed, set completedAt
  if (data.isCompleted === true) {
    updateData.completedAt = new Date();
  }

  // If marking as incomplete, clear completedAt
  if (data.isCompleted === false) {
    updateData.completedAt = null;
  }

  const [updatedTodo] = await db
    .update(todos)
    .set(updateData)
    .where(eq(todos.id, id))
    .returning();

  return updatedTodo;
}

// Delete a todo (cascade will delete checklist items and attachments)
export async function deleteTodo(id: number) {
  const [deletedTodo] = await db
    .delete(todos)
    .where(eq(todos.id, id))
    .returning();

  return deletedTodo;
}

// Toggle todo completion status
export async function toggleTodoComplete(id: number) {
  const todo = await getTodoById(id);
  if (!todo) return null;

  return updateTodo(id, { isCompleted: !todo.isCompleted });
}

// Get todo analytics
export async function getTodoAnalytics(dateRange?: DateRange) {
  const conditions = dateRange
    ? and(
        gte(todos.createdAt, dateRange.from),
        lte(todos.createdAt, dateRange.to)
      )
    : undefined;

  // Get category breakdown
  const categoryBreakdown = await db
    .select({
      category: todos.category,
      total: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('total'),
      completed: sql<number>`CAST(SUM(CASE WHEN ${todos.isCompleted} THEN 1 ELSE 0 END) AS INTEGER)`.as('completed'),
    })
    .from(todos)
    .where(conditions)
    .groupBy(todos.category);

  // Get priority breakdown
  const priorityBreakdown = await db
    .select({
      priority: todos.priority,
      total: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('total'),
      completed: sql<number>`CAST(SUM(CASE WHEN ${todos.isCompleted} THEN 1 ELSE 0 END) AS INTEGER)`.as('completed'),
    })
    .from(todos)
    .where(conditions)
    .groupBy(todos.priority);

  // Get completion stats
  const stats = await db
    .select({
      total: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('total'),
      completed: sql<number>`CAST(SUM(CASE WHEN ${todos.isCompleted} THEN 1 ELSE 0 END) AS INTEGER)`.as('completed'),
      pending: sql<number>`CAST(SUM(CASE WHEN NOT ${todos.isCompleted} THEN 1 ELSE 0 END) AS INTEGER)`.as('pending'),
      overdue: sql<number>`CAST(SUM(CASE WHEN ${todos.dueDate} < NOW() AND NOT ${todos.isCompleted} THEN 1 ELSE 0 END) AS INTEGER)`.as('overdue'),
    })
    .from(todos)
    .where(conditions);

  // Get completion over time (last 30 days)
  const completionOverTime = await db
    .select({
      date: sql<string>`TO_CHAR(${todos.completedAt}, 'YYYY-MM-DD')`.as('date'),
      count: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('count'),
    })
    .from(todos)
    .where(
      and(
        sql`${todos.completedAt} IS NOT NULL`,
        gte(todos.completedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      )
    )
    .groupBy(sql`TO_CHAR(${todos.completedAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`date ASC`);

  return {
    categoryBreakdown,
    priorityBreakdown,
    stats: stats[0],
    completionOverTime,
  };
}

// ==================== CHECKLIST ITEM QUERIES ====================

// Create a checklist item
export async function createChecklistItem(
  todoId: number,
  data: {
    title: string;
    order?: number;
  }
) {
  const [newItem] = await db
    .insert(todoChecklistItems)
    .values({
      todoId,
      title: data.title,
      order: data.order || 0,
    })
    .returning();

  return newItem;
}

// Update a checklist item
export async function updateChecklistItem(
  id: number,
  data: Partial<{
    title: string;
    isCompleted: boolean;
    order: number;
  }>
) {
  const [updatedItem] = await db
    .update(todoChecklistItems)
    .set(data)
    .where(eq(todoChecklistItems.id, id))
    .returning();

  return updatedItem;
}

// Delete a checklist item
export async function deleteChecklistItem(id: number) {
  const [deletedItem] = await db
    .delete(todoChecklistItems)
    .where(eq(todoChecklistItems.id, id))
    .returning();

  return deletedItem;
}

// Toggle checklist item completion
export async function toggleChecklistItemComplete(id: number) {
  const item = await db.query.todoChecklistItems.findFirst({
    where: eq(todoChecklistItems.id, id),
  });

  if (!item) return null;

  return updateChecklistItem(id, { isCompleted: !item.isCompleted });
}

// ==================== ATTACHMENT QUERIES ====================

// Create an attachment
export async function createAttachment(
  todoId: number,
  data: {
    type: 'note' | 'file';
    content: string;
    fileName?: string | null;
  }
) {
  const [newAttachment] = await db
    .insert(todoAttachments)
    .values({
      todoId,
      type: data.type,
      content: data.content,
      fileName: data.fileName,
    })
    .returning();

  return newAttachment;
}

// Delete an attachment
export async function deleteAttachment(id: number) {
  const [deletedAttachment] = await db
    .delete(todoAttachments)
    .where(eq(todoAttachments.id, id))
    .returning();

  return deletedAttachment;
}
