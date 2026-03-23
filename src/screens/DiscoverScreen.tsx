import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { findRecipesByIngredients } from '../api/spoonacular';
import { DiscoverStackParamList } from '../navigation/DiscoverStack';
import { SQLiteIngredientRepository } from '../repositories/ingredient';
import { SpoonacularRecipe } from '../types';

const ingredientRepo = new SQLiteIngredientRepository();

type Nav = NativeStackNavigationProp<DiscoverStackParamList, 'DiscoverList'>;

export default function DiscoverScreen() {
  const navigation = useNavigation<Nav>();
  const [recipes, setRecipes] = useState<SpoonacularRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noIngredients, setNoIngredients] = useState(false);
  const lastFridgeKey = useRef<string | null>(null);

  const fetchRecipes = useCallback(async (names: string[]) => {
    setLoading(true);
    setError(null);
    setNoIngredients(false);
    try {
      console.log('[Discover] Calling Spoonacular API with:', names);
      const results = await findRecipesByIngredients(names);
      setRecipes(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const ingredients = await ingredientRepo.getAll();
    if (ingredients.length === 0) {
      lastFridgeKey.current = '';
      setNoIngredients(true);
      setRecipes([]);
      return;
    }
    const names = ingredients.map((i) => i.name);
    await fetchRecipes(names);
    lastFridgeKey.current = [...names].sort().join(',');
  }, [fetchRecipes]);

  useFocusEffect(
    useCallback(() => {
      ingredientRepo.getAll().then((ingredients) => {
        const key = ingredients.map((i) => i.name).sort().join(',');
        if (key !== lastFridgeKey.current) {
          lastFridgeKey.current = key;
          if (ingredients.length === 0) {
            setNoIngredients(true);
            setRecipes([]);
          } else {
            fetchRecipes(ingredients.map((i) => i.name));
          }
        }
      });
    }, [fetchRecipes]),
  );

  const renderRecipe = ({ item }: { item: SpoonacularRecipe }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('RecipeDetail', {
          recipeId: item.id,
          recipeTitle: item.title,
          recipeImage: item.image,
        })
      }
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.badges}>
          <Badge color="#4CAF50" label={`✓ ${item.usedIngredientCount} have`} />
          {item.missedIngredientCount > 0 && (
            <Badge color="#FF6B35" label={`✗ ${item.missedIngredientCount} missing`} />
          )}
        </View>
        {item.missedIngredients.length > 0 && (
          <Text style={styles.missed} numberOfLines={1}>
            Need: {item.missedIngredients.map((m) => m.name).join(', ')}
          </Text>
        )}
        <Text style={styles.tapHint}>Tap to view details & add to meal plan</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Finding recipes…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && noIngredients && (
        <View style={styles.centered}>
          <Text style={styles.empty}>
            Add ingredients to your pantry first to discover recipes!
          </Text>
        </View>
      )}

      {!loading && !error && !noIngredients && recipes.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.empty}>No recipes found for your ingredients.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
            <Text style={styles.retryBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && recipes.length > 0 && (
        <FlatList
          data={recipes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={renderRecipe}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerText}>
                {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
              </Text>
              <TouchableOpacity onPress={refresh}>
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const ORANGE = '#FF6B35';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#888', fontSize: 14 },
  errorText: { color: '#E53935', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  empty: { color: '#999', fontSize: 15, textAlign: 'center', lineHeight: 24 },
  list: { padding: 16, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: { color: '#888', fontSize: 13 },
  refreshText: { color: ORANGE, fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  image: { width: '100%', height: 180 },
  cardBody: { padding: 14 },
  title: { fontSize: 16, fontWeight: '700', color: '#2D2D2D', marginBottom: 8 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  missed: { fontSize: 12, color: '#999', marginBottom: 6 },
  tapHint: { fontSize: 11, color: '#CCC', marginTop: 2 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryBtnText: { color: '#fff', fontWeight: '700' },
});
