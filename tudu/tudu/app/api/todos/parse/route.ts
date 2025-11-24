import { NextRequest, NextResponse } from 'next/server';
import { parseTodo } from '@/lib/ai/todo-parser';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text input cannot be empty' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text input too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Parse the todo using Gemini AI
    const parsed = await parseTodo(text);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error('Error in /api/todos/parse:', error);
    return NextResponse.json(
      { error: 'Failed to parse todo. Please try again.' },
      { status: 500 }
    );
  }
}
