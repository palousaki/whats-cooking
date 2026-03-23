import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('whats_cooking.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity TEXT NOT NULL DEFAULT '',
      unit TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS meal_plan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      recipe_title TEXT NOT NULL,
      recipe_image TEXT NOT NULL,
      day TEXT NOT NULL,
      all_ingredients TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS recipe_cache (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL
    );
  `);

  // Migration: add all_ingredients column if it doesn't exist yet
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(meal_plan)`,
  );
  const hasAllIngredients = columns.some((c) => c.name === 'all_ingredients');
  if (!hasAllIngredients) {
    await db.execAsync(
      `ALTER TABLE meal_plan ADD COLUMN all_ingredients TEXT NOT NULL DEFAULT '[]'`,
    );
  }

  return db;
}
