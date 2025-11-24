import { NextRequest, NextResponse } from 'next/server';
import {
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  toggleChecklistItemComplete,
} from '@/lib/db/queries';

// POST /api/todos/checklist - Create a new checklist item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { todoId, title, order } = body;

    if (!todoId || typeof todoId !== 'number') {
      return NextResponse.json(
        { error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const newItem = await createChecklistItem(todoId, {
      title: title.trim(),
      order: order || 0,
    });

    return NextResponse.json({
      success: true,
      data: newItem,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/todos/checklist:', error);
    return NextResponse.json(
      { error: 'Failed to create checklist item' },
      { status: 500 }
    );
  }
}

// PATCH /api/todos/checklist - Update or toggle a checklist item
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { error: 'Checklist item ID is required' },
        { status: 400 }
      );
    }

    let updatedItem;

    // Handle toggle action
    if (action === 'toggle') {
      updatedItem = await toggleChecklistItemComplete(id);
    } else {
      // Handle regular update
      const dataToUpdate: any = {};

      if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
      if (updateData.isCompleted !== undefined) dataToUpdate.isCompleted = updateData.isCompleted;
      if (updateData.order !== undefined) dataToUpdate.order = updateData.order;

      updatedItem = await updateChecklistItem(id, dataToUpdate);
    }

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error in PATCH /api/todos/checklist:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist item' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/checklist - Delete a checklist item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid checklist item ID is required' },
        { status: 400 }
      );
    }

    const deletedItem = await deleteChecklistItem(id);

    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Checklist item deleted successfully',
      data: deletedItem,
    });
  } catch (error) {
    console.error('Error in DELETE /api/todos/checklist:', error);
    return NextResponse.json(
      { error: 'Failed to delete checklist item' },
      { status: 500 }
    );
  }
}
