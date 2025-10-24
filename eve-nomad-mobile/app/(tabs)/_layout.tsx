/**
 * Tabs Layout - EVE Nomad Mobile
 *
 * Bottom tab navigation for main app screens (protected by AuthGuard)
 */

import { Tabs } from 'expo-router';
import { colors } from '../../src/utils/theme';
import { AuthGuard } from '../../src/components';

export default function TabsLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.textPrimary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color }) => null, // TODO: Add icon
          }}
        />
        <Tabs.Screen
          name="skills"
          options={{
            title: 'Skills',
            tabBarLabel: 'Skills',
            tabBarIcon: ({ color }) => null, // TODO: Add icon
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: 'Wallet',
            tabBarLabel: 'Wallet',
            tabBarIcon: ({ color }) => null, // TODO: Add icon
          }}
        />
        <Tabs.Screen
          name="market"
          options={{
            title: 'Market',
            tabBarLabel: 'Market',
            tabBarIcon: ({ color }) => null, // TODO: Add icon
          }}
        />
        <Tabs.Screen
          name="characters"
          options={{
            title: 'Characters',
            tabBarLabel: 'Characters',
            tabBarIcon: ({ color }) => null, // TODO: Add icon
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
