// src/app/_layout.tsx
import { Alert, Button, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // For potential future gestures
import { GameProvider, useGame } from "../src/contexts/GameContext";
import GameOverScreen from "../src/screens/game-over";
import MenuScreen from "../src/screens/menu";
import PuzzleSolvingScreen from "../src/screens/puzzle";
import SprintBoardScreen from "../src/screens/sprint-board";
import SprintPlanningScreen from "../src/screens/sprint-planning";


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

const AppScreens = () => {
  const { gamePhase, activeTicketId } = useGame();

  // Decide which screen to show based on gamePhase
  if (gamePhase === "GAME_OVER") return <GameOverScreen />;
  if (gamePhase === "MAIN_MENU") return <MenuScreen />;
  if (gamePhase === "SPRINT_PLANNING") return <SprintPlanningScreen />;
  if (gamePhase === "SPRINT_ACTIVE") return <SprintBoardScreen />;
  if (gamePhase === "PUZZLE_SOLVING" && activeTicketId)
    return <PuzzleSolvingScreen ticketId={activeTicketId} />;
  // Fallback
  return <MenuScreen />;
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameProvider>
        <AppScreens />
      </GameProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerButtonContainer: {
    marginRight: Platform.OS === "ios" ? 0 : 10,
  },
});
