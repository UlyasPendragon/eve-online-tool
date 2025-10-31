/**
 * Root Layout - EVE Nomad Mobile
 *
 * Root navigation layout with providers
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { config } from '../src/utils/config';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.staleTime,
      gcTime: config.cacheTime, // React Query v5 renamed cacheTime to gcTime
      retry: config.retryAttempts,
      retryDelay: config.retryDelay,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#0A0E27', // EVE dark background
            },
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="character/[id]"
            options={{
              headerShown: true,
              title: 'Character Details',
              headerStyle: {
                backgroundColor: '#1A1F3A',
              },
              headerTintColor: '#FFFFFF',
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </SafeAreaProvider>
      {/* React Query DevTools - web only, not supported on mobile */}
      {Platform.OS === 'web' && config.isDevelopment && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
