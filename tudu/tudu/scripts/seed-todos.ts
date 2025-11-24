import { db } from "../lib/db/index.js";
import { todos, todoChecklistItems } from "../lib/db/schema.js";

async function seedTodos() {
  console.log("🌱 Seeding todos...");

  // Get IST time helper
  const getISTDate = (daysFromNow: number, hour: number = 9) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() + istOffset);
  };

  const sampleTodos = [
    {
      title: "Prepare quarterly presentation for stakeholders",
      description: "Need to compile Q4 results and create slides for the board meeting",
      dueDate: getISTDate(2, 14),
      priority: "high" as const,
      category: "work" as const,
      tags: ["presentation", "quarterly", "board-meeting"],
      isCompleted: false,
      checklistItems: [
        "Gather Q4 financial data",
        "Create PowerPoint slides",
        "Prepare speaker notes",
        "Practice presentation"
      ]
    },
    {
      title: "Buy groceries for the week",
      description: "Vegetables, fruits, milk, bread, and snacks",
      dueDate: getISTDate(0, 18),
      priority: "medium" as const,
      category: "shopping" as const,
      tags: ["groceries", "weekly"],
      isCompleted: false,
    },
    {
      title: "Call mom for her birthday",
      dueDate: getISTDate(1, 10),
      priority: "high" as const,
      category: "social" as const,
      tags: ["family", "birthday"],
      isCompleted: false,
    },
    {
      title: "Gym session - leg day",
      dueDate: getISTDate(0, 7),
      priority: "medium" as const,
      category: "health" as const,
      tags: ["fitness", "workout"],
      isCompleted: true,
      completedAt: new Date(),
    },
    {
      title: "Review and merge pull requests",
      description: "3 PRs pending review from the team",
      dueDate: getISTDate(0, 16),
      priority: "high" as const,
      category: "work" as const,
      tags: ["code-review", "github"],
      isCompleted: false,
    },
    {
      title: "Read 'Atomic Habits' chapter 5-7",
      priority: "low" as const,
      category: "education" as const,
      tags: ["reading", "self-improvement"],
      isCompleted: false,
    },
    {
      title: "Pay electricity bill",
      dueDate: getISTDate(3, 23),
      priority: "high" as const,
      category: "finance" as const,
      tags: ["bills", "utilities"],
      isCompleted: false,
    },
    {
      title: "Fix leaking kitchen tap",
      description: "Water is dripping from the tap, need to tighten or replace washer",
      dueDate: getISTDate(5, 10),
      priority: "medium" as const,
      category: "home" as const,
      tags: ["repair", "plumbing"],
      isCompleted: false,
    },
    {
      title: "Team lunch this Friday",
      description: "Booked at Copper Chimney, 1 PM",
      dueDate: getISTDate(4, 13),
      priority: "none" as const,
      category: "social" as const,
      tags: ["team", "lunch"],
      isCompleted: false,
    },
    {
      title: "Order new running shoes",
      description: "Current ones are worn out after 6 months",
      priority: "medium" as const,
      category: "shopping" as const,
      tags: ["fitness", "shopping"],
      isCompleted: false,
    },
    {
      title: "Update resume with recent projects",
      priority: "low" as const,
      category: "work" as const,
      tags: ["career", "resume"],
      isCompleted: false,
      checklistItems: [
        "Add Tudu project details",
        "Update skills section",
        "Add new certifications"
      ]
    },
    {
      title: "Doctor appointment - annual checkup",
      dueDate: getISTDate(7, 11),
      priority: "medium" as const,
      category: "health" as const,
      tags: ["doctor", "checkup"],
      isCompleted: false,
    },
    {
      title: "Clean and organize study room",
      description: "Books are scattered, desk needs organizing",
      priority: "low" as const,
      category: "home" as const,
      tags: ["cleaning", "organization"],
      isCompleted: false,
    },
    {
      title: "Backup laptop data to cloud",
      dueDate: getISTDate(1, 20),
      priority: "medium" as const,
      category: "personal" as const,
      tags: ["backup", "tech"],
      isCompleted: false,
    },
    {
      title: "Morning jog completed",
      description: "5K run at the park",
      priority: "none" as const,
      category: "health" as const,
      tags: ["exercise", "running"],
      isCompleted: true,
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ];

  for (const todo of sampleTodos) {
    const checklistItems = todo.checklistItems;
    delete (todo as any).checklistItems;

    const [insertedTodo] = await db
      .insert(todos)
      .values({
        ...todo,
        tags: todo.tags || [],
        isRecurring: false,
      })
      .returning();

    console.log(`✓ Created: ${insertedTodo.title}`);

    // Insert checklist items if any
    if (checklistItems && checklistItems.length > 0) {
      for (const item of checklistItems) {
        await db.insert(todoChecklistItems).values({
          todoId: insertedTodo.id,
          title: item,
          isCompleted: false,
        });
      }
      console.log(`  └─ Added ${checklistItems.length} checklist items`);
    }
  }

  console.log("\n✨ Seeding completed!");
  process.exit(0);
}

seedTodos().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
