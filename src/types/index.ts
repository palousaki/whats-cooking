export interface Ingredient {
  id: number;
  name: string;
  quantity: string;
  unit: string;
}

export interface MissedIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  missedIngredientCount: number;
  missedIngredients: MissedIngredient[];
  usedIngredientCount: number;
}

export interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  extendedIngredients: RecipeIngredient[];
  instructions: string;
  analyzedInstructions: {
    steps: { number: number; step: string }[];
  }[];
}

export interface MealPlanEntry {
  id: number;
  recipe_id: number;
  recipe_title: string;
  recipe_image: string;
  day: string;
  all_ingredients: string; // JSON-encoded RecipeIngredient[]
}
