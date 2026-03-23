import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import DiscoverStack from './DiscoverStack';
import FridgeScreen from '../screens/FridgeScreen';
import GroceryListScreen from '../screens/GroceryListScreen';
import MealPlanStack from './MealPlanStack';

const Tab = createBottomTabNavigator();

const ORANGE = '#FF6B35';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<
  string,
  { icon: IoniconName; iconFocused: IoniconName; label: string }
> = {
  Fridge: {
    icon: 'nutrition-outline',
    iconFocused: 'nutrition',
    label: 'Pantry',
  },
  Discover: {
    icon: 'search-outline',
    iconFocused: 'search',
    label: 'Discover',
  },
  MealPlan: {
    icon: 'calendar-outline',
    iconFocused: 'calendar',
    label: 'Meal Plan',
  },
  GroceryList: {
    icon: 'cart-outline',
    iconFocused: 'cart',
    label: 'Grocery',
  },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const config = TAB_CONFIG[route.name];
        return {
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
          tabBarActiveTintColor: ORANGE,
          tabBarInactiveTintColor: '#AAA',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#F0F0F0',
          },
          tabBarLabel: config?.label ?? route.name,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? config?.iconFocused : config?.icon}
              size={size}
              color={color}
            />
          ),
        };
      }}
    >
      <Tab.Screen
        name="Fridge"
        component={FridgeScreen}
        options={{ title: 'My Pantry' }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="MealPlan"
        component={MealPlanStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="GroceryList"
        component={GroceryListScreen}
        options={{ title: 'Grocery List' }}
      />
    </Tab.Navigator>
  );
}
