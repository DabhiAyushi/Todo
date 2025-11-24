import { NextRequest, NextResponse } from 'next/server';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  createChecklistItem,
} from '@/lib/db/queries';

// GET /api/todos - Get all todos with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryParam = searchParams.get('category');
    const priorityParam = searchParams.get('priority');

    const validCategories = ['work', 'personal', 'shopping', 'health', 'finance', 'home', 'education', 'social', 'other'] as const;
    const validPriorities = ['high', 'medium', 'low', 'none'] as const;

    const filters = {
      includeOldCompleted: searchParams.get('includeOldCompleted') === 'true',
      category: categoryParam && validCategories.includes(categoryParam as any) ? categoryParam as typeof validCategories[number] : undefined,
      priority: priorityParam && validPriorities.includes(priorityParam as any) ? priorityParam as typeof validPriorities[number] : undefined,
    };

    const todos = await getTodos(filters);

    return NextResponse.json({
      success: true,
      data: todos,
    });
  } catch (error) {
    console.error('Error in GET /api/todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      dueDate,
      priority,
      category,
      tags,
      isRecurring,
      recurrencePattern,
      checklistItems,
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create the todo
    const newTodo = await createTodo({
      title: title.trim(),
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'none',
      category: category || null,
      tags: tags || null,
      isRecurring: isRecurring || false,
      recurrencePattern: recurrencePattern || null,
    });

    // If checklist items were provided, create them
    if (checklistItems && Array.isArray(checklistItems) && checklistItems.length > 0) {
      for (let i = 0; i < checklistItems.length; i++) {
        const item = checklistItems[i];
        await createChecklistItem(newTodo.id, {
          title: item.title,
          order: item.order !== undefined ? item.order : i,
        });
      }
    }

    // Fetch the complete todo with checklist items
    const { getTodoById } = await import('@/lib/db/queries');
    const completeTodo = await getTodoById(newTodo.id);

    return NextResponse.json({
      success: true,
      data: completeTodo,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/todos:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}

// PATCH /api/todos - Update or toggle a todo (requires id in body)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    let updatedTodo;

    // Handle toggle action
    if (action === 'toggle') {
      updatedTodo = await toggleTodoComplete(id);
    } else {
      // Handle regular update
      const dataToUpdate: any = {};

      if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
      if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
      if (updateData.dueDate !== undefined) dataToUpdate.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
      if (updateData.priority !== undefined) dataToUpdate.priority = updateData.priority;
      if (updateData.category !== undefined) dataToUpdate.category = updateData.category;
      if (updateData.tags !== undefined) dataToUpdate.tags = updateData.tags;
      if (updateData.isRecurring !== undefined) dataToUpdate.isRecurring = updateData.isRecurring;
      if (updateData.recurrencePattern !== undefined) dataToUpdate.recurrencePattern = updateData.recurrencePattern;
      if (updateData.isCompleted !== undefined) dataToUpdate.isCompleted = updateData.isCompleted;

      updatedTodo = await updateTodo(id, dataToUpdate);
    }

    if (!updatedTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTodo,
    });
  } catch (error) {
    console.error('Error in PATCH /api/todos:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos - Delete a todo (requires id in body or query)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid todo ID is required' },
        { status: 400 }
      );
    }

    const deletedTodo = await deleteTodo(id);

    if (!deletedTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Todo deleted successfully',
      data: deletedTodo,
    });
  } catch (error) {
    console.error('Error in DELETE /api/todos:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
