# What's Cooking

A mobile app for ingredient-based recipe discovery and weekly meal planning, built with React Native (Expo).

## Features

- **Pantry** - track ingredients you have at home; tap any item to update its quantity
- **Discover** - get recipe suggestions based on your pantry contents; auto-refreshes when your pantry changes; tap a recipe to see full details, ingredients (metric), and step-by-step instructions
- **Meal Plan** - assign recipes to days of the week; tap any recipe to view its details
- **Grocery List** - dynamically computed from your meal plan: shows ingredients you're missing based on what's currently in your pantry; tap an item to mark it as bought and add it to the pantry automatically

## Prerequisites

- [fnm](https://github.com/Schniz/fnm) with Node v24
- Expo Go app (SDK 54) on your phone, or an Android/iOS simulator
- A free [Spoonacular API key](https://spoonacular.com/food-api)

## Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd whats-cooking
   npm install
   ```

2. **Add your API key**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and replace `your_api_key_here` with your Spoonacular key.

3. **Initialize fnm** (if not already done)
   ```bash
   echo 'eval "$(fnm env --use-on-cd --shell bash)"' >> ~/.bashrc && source ~/.bashrc
   ```

4. **Start the app**
   ```bash
   npx expo start
   ```
   Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS simulator.

## Tech stack

| | |
|---|---|
| Framework | Expo SDK 54, React Native 0.81.5 |
| Language | TypeScript 5.9 |
| Storage | `expo-sqlite` 16 (local, on-device) |
| Navigation | React Navigation v7 (bottom tabs + native stack) |
| Icons | `@expo/vector-icons` (Ionicons) |
| Recipes API | Spoonacular (free tier, 150 req/day) |

## Project structure

```
src/
  types/          - shared TypeScript types
  db/             - SQLite setup and schema migrations
  repositories/   - data access layer (repository pattern)
  api/            - Spoonacular API client
  screens/        - one file per screen
  navigation/     - tab navigator + stack navigators for Discover and Meal Plan
```

## How the grocery list works

When you open the Grocery List tab, the app:
1. Loads all recipes in your meal plan (each stores its full ingredient list)
2. Loads your current pantry contents
3. Compares them - any ingredient not in your pantry appears on the list
4. Sums amounts across recipes when the same ingredient appears in multiple meals

This means the list stays in sync automatically: add an ingredient to the pantry and it disappears from the grocery list; remove it and it comes back.

## API usage & caching

Spoonacular's free tier allows 150 requests/day. To stay within limits:

- **Discover** only calls the API when your pantry contents have changed since the last fetch - switching tabs without changing your pantry costs nothing
- **Recipe details** are cached in SQLite on first view - tapping the same recipe again loads instantly from local storage with no API call

## Architecture

The repository pattern keeps the data layer behind interfaces (`IIngredientRepository`, `IMealPlanRepository`), making it straightforward to swap SQLite for a remote backend (Supabase, Firebase) later without touching screen code.
