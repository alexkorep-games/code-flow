// src/app/_layout.tsx
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // For potential future gestures
import { GameProvider, useGame } from "../src/contexts/GameContext";
import GameOverScreen from "../src/screens/game-over";
import MenuScreen from "../src/screens/menu";
import PuzzleSolvingScreen from "../src/screens/puzzle";
import SprintBoardScreen from "../src/screens/sprint-board";
import SprintPlanningScreen from "../src/screens/sprint-planning";

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
