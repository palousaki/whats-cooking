import { getDatabase } from '../db/database';
import { MealPlanEntry, RecipeIngredient } from '../types';
import { IMealPlanRepository } from './interfaces';

export class SQLiteMealPlanRepository implements IMealPlanRepository {
  async getAll(): Promise<MealPlanEntry[]> {
    const db = await getDatabase();
    return db.getAllAsync<MealPlanEntry>('SELECT * FROM meal_plan ORDER BY id ASC');
  }

  async addEntry(
    recipeId: number,
    title: string,
    image: string,
    day: string,
    allIngredients: RecipeIngredient[],
  ): Promise<MealPlanEntry> {
    const db = await getDatabase();
    const allJson = JSON.stringify(allIngredients);
    const result = await db.runAsync(
      'INSERT INTO meal_plan (recipe_id, recipe_title, recipe_image, day, all_ingredients) VALUES (?, ?, ?, ?, ?)',
      [recipeId, title, image, day, allJson],
    );
    return {
      id: result.lastInsertRowId,
      recipe_id: recipeId,
      recipe_title: title,
      recipe_image: image,
      day,
      all_ingredients: allJson,
    };
  }

  async removeEntry(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM meal_plan WHERE id = ?', [id]);
  }
}
