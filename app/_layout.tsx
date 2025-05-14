// src/app/_layout.tsx
import { Stack } from "expo-router";
import { Alert, Button, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // For potential future gestures
import { GameProvider, useGame } from "../src/contexts/GameContext";

// Header button component
const NewGameHeaderButton = () => {
  const { resetGame, gamePhase } = useGame();

  // This check is a safeguard. The button should ideally only be configured
  // on screens where gamePhase is not MAIN_MENU or GAME_OVER.
  // If resetGame() is called, gamePhase might change to MAIN_MENU
  // *before* navigation completes. This prevents the button from rendering
  // in that brief intermediate state on the outgoing screen.
  if (gamePhase === "MAIN_MENU" || gamePhase === "GAME_OVER") {
    return null;
  }

  const handleNewGamePress = () => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `Are you sure you want to start a new game? Your current progress will be lost.`
        )
      ) {
        resetGame();
      }
    } else {
      Alert.alert(
        "Start New Game",
        "Are you sure you want to start a new game? Your current progress will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, Start New Game",
            style: "destructive",
            onPress: () => {
              resetGame(); // resetGame now correctly sets phase and navigates to /menu
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View style={styles.headerButtonContainer}>
      <Button
        title="New Game"
        onPress={handleNewGamePress}
        color={Platform.OS === "ios" ? "#007AFF" : undefined} // Standard iOS blue, Android default
      />
    </View>
  );
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="menu" />
          <Stack.Screen
            name="sprint-planning"
            options={{
              headerShown: true,
              title: "Sprint Planning",
              headerRight: () => <NewGameHeaderButton />,
            }}
          />
          <Stack.Screen
            name="sprint-board"
            options={{
              headerShown: true,
              title: "Sprint Board",
              headerRight: () => <NewGameHeaderButton />,
            }}
          />
          <Stack.Screen
            name="puzzle/[ticketId]"
            options={{
              headerShown: true,
              title: "Solve Puzzle",
              headerRight: () => <NewGameHeaderButton />,
            }}
          />
          <Stack.Screen name="game-over" />
        </Stack>
      </GameProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerButtonContainer: {
    marginRight: Platform.OS === "ios" ? 0 : 10, // iOS handles spacing, Android might need it for button not to be flush with edge
  },
});
