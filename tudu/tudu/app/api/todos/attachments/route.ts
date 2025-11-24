import { NextRequest, NextResponse } from 'next/server';
import {
  createAttachment,
  deleteAttachment,
} from '@/lib/db/queries';

// POST /api/todos/attachments - Create a new attachment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { todoId, type, content, fileName } = body;

    if (!todoId || typeof todoId !== 'number') {
      return NextResponse.json(
        { error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    if (!type || !['note', 'file'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "note" or "file"' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const newAttachment = await createAttachment(todoId, {
      type: type as 'note' | 'file',
      content: content.trim(),
      fileName: fileName || null,
    });

    return NextResponse.json({
      success: true,
      data: newAttachment,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/todos/attachments:', error);
    return NextResponse.json(
      { error: 'Failed to create attachment' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/attachments - Delete an attachment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid attachment ID is required' },
        { status: 400 }
      );
    }

    const deletedAttachment = await deleteAttachment(id);

    if (!deletedAttachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Attachment deleted successfully',
      data: deletedAttachment,
    });
  } catch (error) {
    console.error('Error in DELETE /api/todos/attachments:', error);
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}
