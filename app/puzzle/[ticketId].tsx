// src/app/puzzle/[ticketId].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import PuzzleGrid from "../components/PuzzleGrid";
import { useGame } from "../contexts/GameContext";
import { usePuzzleState } from "../hooks/usePuzzleState"; // Correct path

const screenWidth = Dimensions.get("window").width;
const maxGridWidth = screenWidth * 0.9;

export default function PuzzleSolvingScreen() {
  const router = useRouter();
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const {
    activeTicket,
    saveAndExitPuzzle,
    completeTicket,
    resumeSprintTimer,
    pauseSprintTimer,
    isSprintTimerRunning,
  } = useGame();

  const [currentLoadedTicketId, setCurrentLoadedTicketId] = useState<
    string | null
  >(null);

  // Initialize usePuzzleState with a placeholder or null, it will be loaded via effect
  const {
    puzzleState,
    isLoading,
    isSolved,
    loadPuzzle,
    rotateTile,
    getCurrentGrid,
    timeSpentOnPuzzle,
    startPuzzleTimer,
    pausePuzzleTimer: pauseLocalPuzzleTimer, // Renamed to avoid conflict
    resetPuzzleTimer,
  } = usePuzzleState({ initialPuzzle: null }); // Start with no puzzle

  // Effect to load puzzle when activeTicket changes or screen mounts with a ticketId
  useEffect(() => {
    if (
      activeTicket &&
      activeTicket.id === ticketId &&
      ticketId !== currentLoadedTicketId
    ) {
      loadPuzzle(activeTicket.currentPuzzleState);
      setCurrentLoadedTicketId(ticketId); // Mark as loaded
      resetPuzzleTimer(); // Reset local timer for this puzzle
      startPuzzleTimer(); // Start local timer
      resumeSprintTimer(); // Resume global sprint timer
    } else if (!activeTicket && ticketId) {
      // This case might happen if navigating directly to puzzle URL without GameContext fully ready
      // Or if activeTicket becomes null for some reason.
      // Potentially redirect or show error.
      console.warn(
        "PuzzleScreen: Active ticket not found or mismatch for ID:",
        ticketId
      );
      // router.replace('/sprint-board'); // Example recovery
    }

    // Cleanup: Pause timers when component unmounts or ticketId changes
    return () => {
      pauseLocalPuzzleTimer();
      pauseSprintTimer(); // Pause global sprint timer if leaving puzzle screen
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTicket,
    ticketId,
    loadPuzzle,
    resetPuzzleTimer,
    startPuzzleTimer,
    resumeSprintTimer,
    pauseSprintTimer,
    pauseLocalPuzzleTimer,
  ]);

  const handleSolve = () => {
    if (activeTicket) {
      pauseLocalPuzzleTimer(); // Stop local puzzle timer
      pauseSprintTimer(); // Stop global sprint timer
      completeTicket(activeTicket.id, timeSpentOnPuzzle);
      // Navigation is handled by completeTicket
    }
  };

  const handlePauseOrExit = () => {
    if (activeTicket && puzzleState) {
      pauseLocalPuzzleTimer();
      pauseSprintTimer();
      saveAndExitPuzzle(
        activeTicket.id,
        { ...puzzleState, grid: getCurrentGrid() || puzzleState.grid },
        timeSpentOnPuzzle
      );
      // Navigation is handled by saveAndExitPuzzle
    } else {
      router.back(); // Fallback if something is wrong
    }
  };

  useEffect(() => {
    if (isSolved && activeTicket) {
      handleSolve(); // Automatically call handleSolve when local hook reports solved
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolved, activeTicket]); // Dependencies: isSolved, activeTicket

  const tileSize = useMemo(() => {
    const size = puzzleState?.N || 5; // Default to 5 if not loaded
    return Math.floor(maxGridWidth / size);
  }, [puzzleState?.N]);

  if (!activeTicket || activeTicket.id !== ticketId) {
    // This can happen during navigation transitions or if context is slow
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Loading ticket...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title} numberOfLines={1}>
          {activeTicket.title}
        </Text>
        <Text style={styles.description}>
          {activeTicket.type} - {activeTicket.puzzleDefinition.N}x
          {activeTicket.puzzleDefinition.N},{" "}
          {activeTicket.puzzleDefinition.lockedPercent}% Locked
        </Text>

        <Text style={styles.timerInfo}>
          Time on this puzzle: {timeSpentOnPuzzle}s
        </Text>
        <Text style={styles.timerInfo}>
          Sprint Timer: {isSprintTimerRunning ? "Running" : "Paused"}
        </Text>

        <PuzzleGrid
          puzzleState={puzzleState}
          tileSize={tileSize}
          onTilePress={rotateTile}
          isLoading={isLoading}
          isSolved={isSolved} // Pass isSolved to PuzzleGrid to disable interaction
        />

        {isSolved && (
          <Text style={styles.solvedText}>
            🎉 Solved! Returning to Sprint Board... 🎉
          </Text>
        )}

        <View style={styles.controls}>
          <Button
            title="Pause & Return to Sprint Board"
            onPress={handlePauseOrExit}
            disabled={isSolved}
          />
          {/* "Complete" button is removed as solving is auto-detected */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },
  timerInfo: {
    fontSize: 14,
    color: "#777",
    marginBottom: 5,
  },
  controls: {
    marginTop: 20,
    width: "80%",
  },
  solvedText: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },
});
