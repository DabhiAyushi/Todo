import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { todoParsedSchema } from "@/lib/types";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error(
    "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set"
  );
}

// Get current time in IST (UTC+5:30)
function getCurrentISTTime() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().replace('Z', '+05:30');
}

// System prompt for smart todo parsing
const getTodoParsingPrompt = () => `You are an expert at understanding natural language task descriptions and extracting structured information.

IMPORTANT: The user is in India (IST timezone, UTC+5:30). All times and dates should be interpreted in Indian Standard Time.

Your job is to analyze the user's input text and intelligently extract:

1. **Title**: The main task or action item (clear and concise)
2. **Description**: Additional context, notes, or details if mentioned
3. **Due Date**: Parse natural language time expressions like:
   - "tomorrow" → next day at 9am IST
   - "next Monday" → upcoming Monday at 9am IST
   - "in 3 days" → 3 days from now at 9am IST
   - "Friday at 3pm" → upcoming Friday at 3pm IST
   - "tonight" → today at 8pm IST
   - "this weekend" → upcoming Saturday at 10am IST
   - Always return as ISO datetime string with IST offset (e.g., "2025-11-25T15:00:00+05:30")
   - If no time mentioned, default to 9am IST
   - If no date mentioned, leave null

4. **Priority**: Detect urgency from keywords:
   - high: "urgent", "asap", "important", "critical", "emergency"
   - medium: "soon", "this week", "need to"
   - low: "someday", "maybe", "when possible", "low priority"
   - none: no urgency indicators

5. **Category**: Classify the task into one of these categories:
   - work: Professional tasks, meetings, projects, emails
   - personal: Self-care, errands, general life tasks
   - shopping: Buying items, groceries, online shopping
   - health: Exercise, doctor appointments, medication, wellness
   - finance: Bills, budgeting, taxes, banking
   - home: Cleaning, repairs, maintenance, organization
   - education: Learning, courses, reading, studying
   - social: Events, calls, messages, social gatherings
   - other: Anything that doesn't fit above categories

6. **Tags**: Extract relevant keywords or context markers from the text

7. **Recurring**: Detect if this is a recurring task from phrases like:
   - "every day", "daily", "each morning"
   - "every week", "weekly", "each Monday"
   - "monthly", "every month"
   - "yearly", "annually"
   Return true if recurring, and specify the pattern

8. **Checklist Items**: If the task is complex or mentions multiple sub-tasks, break it down into actionable checklist items:
   - "Prepare presentation: research topic, create slides, practice"
   - "Plan vacation: book flights, reserve hotel, plan itinerary"
   - Each item should be a clear, single action

9. **Confidence**: Rate your confidence in the parsing (0-100)

**Current datetime for reference (IST)**: ${getCurrentISTTime()}

**Examples:**

Input: "Buy groceries tomorrow"
Output:
- Title: "Buy groceries"
- Due Date: (tomorrow at 9am ISO string)
- Priority: none
- Category: shopping
- Tags: ["groceries"]

Input: "URGENT: Finish report by Friday 5pm"
Output:
- Title: "Finish report"
- Due Date: (upcoming Friday at 5pm ISO string)
- Priority: high
- Category: work
- Tags: ["report"]

Input: "Call mom this weekend"
Output:
- Title: "Call mom"
- Due Date: (upcoming Saturday at 10am ISO string)
- Priority: none
- Category: social
- Tags: ["call", "family"]

Input: "Weekly team meeting every Monday at 10am"
Output:
- Title: "Weekly team meeting"
- Due Date: (next Monday at 10am ISO string)
- Priority: none
- Category: work
- Is Recurring: true
- Recurrence Pattern: "every Monday at 10am"

Input: "Prepare presentation: research topic, create slides, practice delivery"
Output:
- Title: "Prepare presentation"
- Priority: medium
- Category: work
- Checklist Items: ["Research topic", "Create slides", "Practice delivery"]

Be intelligent and context-aware. Return the data in the specified JSON format.`;

export async function parseTodo(inputText: string) {
  try {
    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: todoParsedSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: getTodoParsingPrompt() },
            { type: "text", text: `Task input: "${inputText}"` },
          ],
        },
      ],
    });

    return result.object;
  } catch (error) {
    console.error("Error parsing todo with Gemini:", error);
    throw new Error("Failed to parse todo");
  }
}
