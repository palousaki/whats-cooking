import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchRecipeInformation } from '../api/spoonacular';
import { SQLiteMealPlanRepository } from '../repositories/mealPlan';
import { RecipeDetail } from '../types';

export type RecipeDetailParamList = {
  RecipeDetail: {
    recipeId: number;
    recipeTitle: string;
    recipeImage: string;
  };
};

const mealPlanRepo = new SQLiteMealPlanRepository();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type Props = NativeStackScreenProps<RecipeDetailParamList, 'RecipeDetail'>;

export default function RecipeDetailScreen({ route }: Props) {
  const { recipeId, recipeTitle, recipeImage } = route.params;

  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchRecipeInformation(recipeId);
      setDetail(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => { load(); }, [load]);

  const handleAddToMealPlan = async (day: string) => {
    if (!detail) return;
    setDayModalVisible(false);
    setSaving(true);
    await mealPlanRepo.addEntry(
      detail.id,
      detail.title,
      detail.image,
      day,
      detail.extendedIngredients,
    );
    setSaving(false);
    setSaved(true);
  };

  const steps = detail?.analyzedInstructions?.[0]?.steps ?? [];

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && detail && (
        <ScrollView contentContainerStyle={styles.content}>
          <Image source={{ uri: detail.image }} style={styles.image} resizeMode="cover" />

          <View style={styles.body}>
            <Text style={styles.title}>{detail.title}</Text>

            <View style={styles.meta}>
              {detail.readyInMinutes > 0 && (
                <MetaBadge label={`${detail.readyInMinutes} min`} />
              )}
              {detail.servings > 0 && (
                <MetaBadge label={`${detail.servings} servings`} />
              )}
            </View>

            <TouchableOpacity
              style={[styles.addBtn, saved && styles.addBtnSaved]}
              onPress={() => setDayModalVisible(true)}
              disabled={saving || saved}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.addBtnText}>
                    {saved ? '✓ Added to Meal Plan' : '+ Add to Meal Plan'}
                  </Text>
              }
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Ingredients</Text>
            {detail.extendedIngredients.map((ing, i) => (
              <View key={i} style={styles.ingredientRow}>
                <View style={styles.bullet} />
                <Text style={styles.ingredientText}>
                  {ing.name}
                  {" - "}
                  {ing.amount > 0
                    ? `${ing.amount % 1 === 0 ? ing.amount : ing.amount.toFixed(1)} ${ing.unit}`.trim()
                    : ''}
                </Text>
              </View>
            ))}

            {steps.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Instructions</Text>
                {steps.map((step) => (
                  <View key={step.number} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{step.number}</Text>
                    </View>
                    <Text style={styles.stepText}>{step.step}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={dayModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDayModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setDayModalVisible(false)}
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Add to which day?</Text>
          {DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              style={styles.dayBtn}
              onPress={() => handleAddToMealPlan(day)}
            >
              <Text style={styles.dayBtnText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}

function MetaBadge({ label }: { label: string }) {
  return (
    <View style={styles.metaBadge}>
      <Text style={styles.metaBadgeText}>{label}</Text>
    </View>
  );
}

const ORANGE = '#FF6B35';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#E53935', fontSize: 15, textAlign: 'center' },
  content: { paddingBottom: 40 },
  image: { width: '100%', height: 240 },
  body: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#2D2D2D', marginBottom: 12 },
  meta: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  metaBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaBadgeText: { fontSize: 13, color: '#666' },
  addBtn: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  addBtnSaved: { backgroundColor: '#4CAF50' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 12,
    marginTop: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ORANGE,
    marginRight: 10,
  },
  ingredientText: { fontSize: 14, color: '#444', flex: 1 },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepText: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#2D2D2D', marginBottom: 16 },
  dayBtn: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dayBtnText: { fontSize: 15, color: '#2D2D2D' },
});
