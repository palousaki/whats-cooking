import { Ingredient, MealPlanEntry, RecipeIngredient } from '../types';

export interface IIngredientRepository {
  getAll(): Promise<Ingredient[]>;
  add(name: string, quantity: string, unit: string): Promise<Ingredient>;
  remove(id: number): Promise<void>;
  update(id: number, quantity: string, unit: string): Promise<void>;
}

export interface IMealPlanRepository {
  getAll(): Promise<MealPlanEntry[]>;
  addEntry(
    recipeId: number,
    title: string,
    image: string,
    day: string,
    allIngredients: RecipeIngredient[],
  ): Promise<MealPlanEntry>;
  removeEntry(id: number): Promise<void>;
}
