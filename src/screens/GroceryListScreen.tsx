import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SQLiteIngredientRepository } from '../repositories/ingredient';
import { SQLiteMealPlanRepository } from '../repositories/mealPlan';
import { Ingredient, MealPlanEntry, RecipeIngredient } from '../types';

const mealPlanRepo = new SQLiteMealPlanRepository();
const ingredientRepo = new SQLiteIngredientRepository();

interface GroceryItem {
  name: string;
  total: string;
}

function computeGroceryList(
  entries: MealPlanEntry[],
  fridge: Ingredient[],
): GroceryItem[] {
  const fridgeNames = new Set(fridge.map((i) => i.name.toLowerCase()));
  const map: Record<string, { amount: number; unit: string }> = {};

  for (const entry of entries) {
    let ingredients: RecipeIngredient[] = [];
    try {
      ingredients = JSON.parse(entry.all_ingredients) as RecipeIngredient[];
    } catch {
      continue;
    }
    for (const ing of ingredients) {
      if (fridgeNames.has(ing.name.toLowerCase())) continue;
      const key = ing.name.toLowerCase();
      if (map[key]) {
        if (map[key].unit === ing.unit) {
          map[key].amount += ing.amount;
        }
        // different unit - keep first occurrence
      } else {
        map[key] = { amount: ing.amount, unit: ing.unit };
      }
    }
  }

  return Object.entries(map)
    .map(([name, { amount, unit }]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      total: `${amount % 1 === 0 ? amount : amount.toFixed(1)} ${unit}`.trim(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function GroceryListScreen() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([mealPlanRepo.getAll(), ingredientRepo.getAll()]).then(
        ([entries, fridge]) => {
          if (active) {
            setItems(computeGroceryList(entries, fridge));
            setLoading(false);
          }
        },
      );
      return () => { active = false; };
    }, []),
  );

  const handleCheckOff = async (item: GroceryItem) => {
    await ingredientRepo.add(item.name, item.total, '');
    setItems((prev) => prev.filter((i) => i.name !== item.name));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No missing ingredients.{'\n'}Add recipes to your meal plan to see what to buy!
          </Text>
        }
        ListHeaderComponent={
          items.length > 0 ? (
            <Text style={styles.subheader}>
              {items.length} item{items.length !== 1 ? 's' : ''} to buy - tap to remove from grocery list and add to pantry
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => handleCheckOff(item)}
            activeOpacity={0.7}
          >
            <View style={styles.checkbox}>
              <Text style={styles.checkboxIcon}>+</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.total ? <Text style={styles.itemQty}>{item.total}</Text> : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const ORANGE = '#FF6B35';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 32 },
  subheader: { fontSize: 13, color: '#888', marginBottom: 12 },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 60,
    fontSize: 15,
    lineHeight: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ORANGE + '20',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxIcon: { color: ORANGE, fontSize: 18, fontWeight: '700', lineHeight: 22 },
  rowText: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 15, color: '#2D2D2D', fontWeight: '500' },
  itemQty: { fontSize: 14, color: '#888' },
});
