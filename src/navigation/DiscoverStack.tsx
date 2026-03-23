import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoverScreen from '../screens/DiscoverScreen';
import RecipeDetailScreen, { RecipeDetailParamList } from '../screens/RecipeDetailScreen';

export type DiscoverStackParamList = { DiscoverList: undefined } & RecipeDetailParamList;

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DiscoverList"
        component={DiscoverScreen}
        options={{
          title: 'Discover Recipes',
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
