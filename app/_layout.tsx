// src/app/_layout.tsx
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // For potential future gestures
import { GameProvider } from "../src/contexts/GameContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="menu" />
          <Stack.Screen name="sprint-planning" />
          <Stack.Screen name="sprint-board" />
          <Stack.Screen name="puzzle/[ticketId]" />
          <Stack.Screen name="game-over" />
        </Stack>
      </GameProvider>
    </GestureHandlerRootView>
  );
}
