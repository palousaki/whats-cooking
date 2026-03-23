import { getDatabase } from '../db/database';
import { Ingredient } from '../types';
import { IIngredientRepository } from './interfaces';

export class SQLiteIngredientRepository implements IIngredientRepository {
  async getAll(): Promise<Ingredient[]> {
    const db = await getDatabase();
    return db.getAllAsync<Ingredient>('SELECT * FROM ingredients ORDER BY name ASC');
  }

  async add(name: string, quantity: string, unit: string): Promise<Ingredient> {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO ingredients (name, quantity, unit) VALUES (?, ?, ?)',
      [name, quantity, unit],
    );
    return { id: result.lastInsertRowId, name, quantity, unit };
  }

  async remove(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM ingredients WHERE id = ?', [id]);
  }

  async update(id: number, quantity: string, unit: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE ingredients SET quantity = ?, unit = ? WHERE id = ?',
      [quantity, unit, id],
    );
  }
}
