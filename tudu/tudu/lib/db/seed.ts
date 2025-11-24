import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding database...');

  // Demo receipts data
  const demoReceipts = [
    {
      merchantName: 'Starbucks Coffee',
      amount: '450.00',
      category: 'food' as const,
      date: new Date('2025-01-15'),
      description: 'Coffee and pastry',
    },
    {
      merchantName: 'Swiggy',
      amount: '680.00',
      category: 'food' as const,
      date: new Date('2025-01-18'),
      description: 'Dinner order',
    },
    {
      merchantName: 'Uber',
      amount: '320.00',
      category: 'transportation' as const,
      date: new Date('2025-01-19'),
      description: 'Ride to office',
    },
    {
      merchantName: 'Amazon India',
      amount: '2499.00',
      category: 'shopping' as const,
      date: new Date('2025-01-20'),
      description: 'Electronics purchase',
    },
    {
      merchantName: 'Netflix',
      amount: '649.00',
      category: 'subscriptions' as const,
      date: new Date('2025-01-21'),
      description: 'Monthly subscription',
    },
    {
      merchantName: 'PVR Cinemas',
      amount: '850.00',
      category: 'entertainment' as const,
      date: new Date('2025-01-22'),
      description: 'Movie tickets',
    },
  ];

  for (const receipt of demoReceipts) {
    // Insert receipt
    const [insertedReceipt] = await db
      .insert(schema.receipts)
      .values({
        status: 'processed',
        processedAt: new Date(),
      })
      .returning();

    // Insert expense
    await db.insert(schema.expenses).values({
      receiptId: insertedReceipt.id,
      merchantName: receipt.merchantName,
      amount: receipt.amount,
      currency: 'INR',
      category: receipt.category,
      date: receipt.date,
      description: receipt.description,
      confidence: '0.95',
    });

    console.log(`Added receipt for ${receipt.merchantName}`);
  }

  console.log('Seeding completed!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
