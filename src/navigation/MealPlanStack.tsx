import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MealPlanScreen from '../screens/MealPlanScreen';
import RecipeDetailScreen, { RecipeDetailParamList } from '../screens/RecipeDetailScreen';

export type MealPlanStackParamList = { MealPlanList: undefined } & RecipeDetailParamList;

const Stack = createNativeStackNavigator<MealPlanStackParamList>();

export default function MealPlanStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MealPlanList"
        component={MealPlanScreen}
        options={{
          title: 'Meal Plan',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={({ route }) => ({
          title: route.params.recipeTitle,
          headerTintColor: '#FF6B35',
          headerTitleStyle: { fontSize: 15 },
          headerBackTitle: 'Back',
        })}
      />
    </Stack.Navigator>
  );
}
