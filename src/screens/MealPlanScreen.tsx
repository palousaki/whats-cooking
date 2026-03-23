import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MealPlanStackParamList } from '../navigation/MealPlanStack';
import { SQLiteMealPlanRepository } from '../repositories/mealPlan';
import { MealPlanEntry } from '../types';

const repo = new SQLiteMealPlanRepository();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type Nav = NativeStackNavigationProp<MealPlanStackParamList, 'MealPlanList'>;

export default function MealPlanScreen() {
  const navigation = useNavigation<Nav>();
  const [entries, setEntries] = useState<MealPlanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      repo.getAll().then((data) => {
        if (active) {
          setEntries(data);
          setLoading(false);
        }
      });
      return () => { active = false; };
    }, []),
  );

  const handleRemove = async (id: number) => {
    await repo.removeEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  const byDay = DAYS.reduce<Record<string, MealPlanEntry[]>>((acc, day) => {
    acc[day] = entries.filter((e) => e.day === day);
    return acc;
  }, {});

  const hasAny = entries.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!hasAny && (
        <Text style={styles.empty}>
          No meals planned yet.{'\n'}Discover recipes and add them here!
        </Text>
      )}

      {DAYS.map((day) => {
        const dayEntries = byDay[day];
        if (dayEntries.length === 0 && !hasAny) return null;

        return (
          <View key={day} style={styles.section}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{day}</Text>
              {dayEntries.length === 0 && (
                <Text style={styles.noMeals}>No meals</Text>
              )}
            </View>

            {dayEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('RecipeDetail', {
                    recipeId: entry.recipe_id,
                    recipeTitle: entry.recipe_title,
                    recipeImage: entry.recipe_image,
                  })
                }
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: entry.recipe_image }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.cardBody}>
                  <Text style={styles.recipeTitle} numberOfLines={2}>
                    {entry.recipe_title}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(entry.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const ORANGE = '#FF6B35';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 60,
    fontSize: 15,
    lineHeight: 24,
  },
  section: { marginBottom: 20 },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: ORANGE,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  noMeals: { fontSize: 13, color: '#CCC' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: 'center',
  },
  image: { width: 72, height: 72 },
  cardBody: { flex: 1, paddingHorizontal: 12 },
  recipeTitle: { fontSize: 14, fontWeight: '600', color: '#2D2D2D' },
  removeBtn: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 16, color: '#CCC' },
});
