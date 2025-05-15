// src/app/_layout.tsx
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // For potential future gestures
import { useGame } from "../src/hooks/useGame";
import GameOverScreen from "../src/screens/game-over";
import MenuScreen from "../src/screens/menu";
import PuzzleSolvingScreen from "../src/screens/puzzle";
import SprintBoardScreen from "../src/screens/sprint-board";
import SprintPlanningScreen from "../src/screens/sprint-planning";

// New Toolbar component
const Toolbar: React.FC = () => {
  const { gamePhase, goToMenu } = useGame();

  // Don't show the toolbar (or Menu button) on the Main Menu screen
  if (gamePhase === "MAIN_MENU") {
    return null;
    // Alternatively, to maintain space if a title or other elements were present:
    // return <View style={styles.toolbarPlaceholder} />;
  }

  return (
    <View style={styles.toolbar}>
      {/* Placeholder for a potential title on the left */}
      <View style={styles.toolbarTitleContainer} />
      <TouchableOpacity
        onPress={() => {
          goToMenu();
        }}
        style={styles.toolbarButton}
      >
        <Text style={styles.toolbarButtonText}>Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const AppScreens = () => {
  const { gamePhase, activeTicketId } = useGame();

  // Decide which screen to show based on gamePhase
  let ScreenComponent = null;
  if (gamePhase === "GAME_OVER") ScreenComponent = <GameOverScreen />;
  else if (gamePhase === "MAIN_MENU") ScreenComponent = <MenuScreen />;
  else if (gamePhase === "SPRINT_PLANNING")
    ScreenComponent = <SprintPlanningScreen />;
  else if (gamePhase === "SPRINT_ACTIVE")
    ScreenComponent = <SprintBoardScreen />;
  else if (gamePhase === "PUZZLE_SOLVING" && activeTicketId)
    ScreenComponent = <PuzzleSolvingScreen ticketId={activeTicketId} />;
  else ScreenComponent = <MenuScreen />; // Default fallback

  return (
    <View style={{ flex: 1 }}>
      <Toolbar /> {/* The Toolbar is now part of the layout flow */}
      <View style={{ flex: 1 }}>
        {" "}
        {/* This View will contain the actual screen content */}
        {ScreenComponent}
      </View>
    </View>
  );
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppScreens />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between", // Use space-between if you have a title or items on the left
    alignItems: "center",
    height: Platform.OS === "ios" ? 70 : 56, // Standard toolbar height, taller on iOS for status bar
    paddingTop: Platform.OS === "ios" ? 20 : 0, // Account for status bar on iOS
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dcdcdc",
    // Add shadow for a bit of elevation, similar to the original button's feel but for a bar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  // Use this if you want to reserve toolbar space even when it's 'empty' on MAIN_MENU
  // toolbarPlaceholder: {
  //   height: Platform.OS === 'ios' ? 70 : 56,
  // },
  toolbarTitleContainer: {
    flex: 1, // Allows title to take space, pushing button to the right
    // Add <Text> with title here if needed
  },
  toolbarButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#3498db",
    borderRadius: 5,
  },
  toolbarButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Removed: menuButtonContainer (as it's replaced by toolbar styles)
});
