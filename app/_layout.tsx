// src/app/_layout.tsx
import React from "react";
import { Button, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // For potential future gestures
import { GameProvider, useGame } from "../src/contexts/GameContext";
import GameOverScreen from "../src/screens/game-over";
import MenuScreen from "../src/screens/menu";
import PuzzleSolvingScreen from "../src/screens/puzzle";
import SprintBoardScreen from "../src/screens/sprint-board";
import SprintPlanningScreen from "../src/screens/sprint-planning";

const MenuButton: React.FC = () => {
  const { gamePhase, resetGame } = useGame();
  if (gamePhase === "MAIN_MENU") return null;
  return (
    <View style={styles.menuButtonContainer}>
      <Button
        title="Menu"
        onPress={resetGame}
        color="#3498db"
      />
    </View>
  );
};

const AppScreens = () => {
  const { gamePhase, activeTicketId } = useGame();

  // Decide which screen to show based on gamePhase
  let ScreenComponent = null;
  if (gamePhase === "GAME_OVER") ScreenComponent = <GameOverScreen />;
  else if (gamePhase === "MAIN_MENU") ScreenComponent = <MenuScreen />;
  else if (gamePhase === "SPRINT_PLANNING") ScreenComponent = <SprintPlanningScreen />;
  else if (gamePhase === "SPRINT_ACTIVE") ScreenComponent = <SprintBoardScreen />;
  else if (gamePhase === "PUZZLE_SOLVING" && activeTicketId)
    ScreenComponent = <PuzzleSolvingScreen ticketId={activeTicketId} />;
  else ScreenComponent = <MenuScreen />;

  return (
    <View style={{ flex: 1 }}>
      <MenuButton />
      {ScreenComponent}
    </View>
  );
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
  menuButtonContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 100,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 2,
  },
});
