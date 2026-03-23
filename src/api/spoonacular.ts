import { getDatabase } from '../db/database';
import { RecipeDetail, SpoonacularRecipe } from '../types';

const BASE_URL = 'https://api.spoonacular.com';
const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY ?? '';

export async function findRecipesByIngredients(
  ingredients: string[],
): Promise<SpoonacularRecipe[]> {
  if (ingredients.length === 0) return [];

  const params = new URLSearchParams({
    ingredients: ingredients.join(','),
    number: '10',
    ranking: '1',
    ignorePantry: 'true',
    apiKey: API_KEY,
  });

  const response = await fetch(`${BASE_URL}/recipes/findByIngredients?${params}`);
  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status}`);
  }
  return response.json() as Promise<SpoonacularRecipe[]>;
}

export async function fetchRecipeInformation(id: number): Promise<RecipeDetail> {
  const db = await getDatabase();

  const cached = await db.getFirstAsync<{ data: string }>(
    'SELECT data FROM recipe_cache WHERE id = ?',
    [id],
  );
  if (cached) {
    return JSON.parse(cached.data) as RecipeDetail;
  }

  const params = new URLSearchParams({ apiKey: API_KEY });
  const response = await fetch(`${BASE_URL}/recipes/${id}/information?${params}`);
  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status}`);
  }
  const data = await response.json() as RecipeDetail & {
    extendedIngredients: (RecipeDetail['extendedIngredients'][number] & {
      measures?: { metric?: { amount: number; unitShort: string } };
    })[];
  };

  // Use metric measurements for all ingredients
  data.extendedIngredients = data.extendedIngredients.map((ing) => ({
    ...ing,
    amount: ing.measures?.metric?.amount ?? ing.amount,
    unit: ing.measures?.metric?.unitShort ?? ing.unit,
  }));

  await db.runAsync(
    'INSERT OR REPLACE INTO recipe_cache (id, data) VALUES (?, ?)',
    [id, JSON.stringify(data)],
  );

  return data;
}
