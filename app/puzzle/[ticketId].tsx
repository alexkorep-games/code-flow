// src/app/puzzle/[ticketId].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react"; // Added useCallback
import {
  Button,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
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

  const {
    puzzleState,
    isLoading,
    isSolved,
    loadPuzzle,
    rotateTile,
    getCurrentGrid,
    timeSpentOnPuzzle,
    startPuzzleTimer,
    pausePuzzleTimer: pauseLocalPuzzleTimer,
    resetPuzzleTimer,
  } = usePuzzleState({ initialPuzzle: null });

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
      console.warn(
        "PuzzleScreen: Active ticket not found or mismatch for ID:",
        ticketId
      );
    }

    return () => {
      pauseLocalPuzzleTimer();
      pauseSprintTimer();
    };
  }, [
    activeTicket,
    ticketId,
    currentLoadedTicketId, // Added currentLoadedTicketId to dependency array
    loadPuzzle,
    resetPuzzleTimer,
    startPuzzleTimer,
    resumeSprintTimer,
    pauseSprintTimer,
    pauseLocalPuzzleTimer,
  ]);

  // Memoize handleSolve to stabilize its reference and define dependencies clearly
  const handleSolve = useCallback(() => {
    // Check activeTicket again inside handleSolve, as it might be called from a stale closure otherwise
    // though the useEffect calling it should have up-to-date activeTicket from its own deps.
    // The main guard is the useEffect condition itself.
    if (activeTicket && activeTicket.id === ticketId) {
      pauseLocalPuzzleTimer();
      pauseSprintTimer();
      completeTicket(activeTicket.id, timeSpentOnPuzzle);
    }
  }, [
    activeTicket,
    ticketId,
    completeTicket,
    timeSpentOnPuzzle,
    pauseLocalPuzzleTimer,
    pauseSprintTimer,
  ]);

  useEffect(() => {
    // Only call handleSolve if isSolved is true AND it pertains to the currently loaded ticket.
    // This check ensures that a stale `isSolved` (true from a previous puzzle)
    // doesn't trigger `handleSolve` for a new `activeTicket` before the new puzzle's
    // state (including its potentially `isSolved=false` status) is fully processed.
    if (
      isSolved &&
      activeTicket &&
      activeTicket.id === ticketId &&
      ticketId === currentLoadedTicketId
    ) {
      handleSolve();
    }
  }, [isSolved, activeTicket, ticketId, currentLoadedTicketId, handleSolve]); // Added currentLoadedTicketId and handleSolve

  const handlePauseOrExit = () => {
    if (activeTicket && puzzleState) {
      pauseLocalPuzzleTimer();
      pauseSprintTimer();
      saveAndExitPuzzle(
        activeTicket.id,
        { ...puzzleState, grid: getCurrentGrid() || puzzleState.grid },
        timeSpentOnPuzzle
      );
    } else {
      router.back();
    }
  };

  // This useEffect for auto-calling handleSolve when `isSolved` changes has been refined above.
  // The old one:
  // useEffect(() => {
  //   if (isSolved && activeTicket) {
  //     handleSolve();
  //   }
  // }, [isSolved, activeTicket]);

  const tileSize = useMemo(() => {
    const size = puzzleState?.N || 5;
    return Math.floor(maxGridWidth / size);
  }, [puzzleState?.N]);

  if (!activeTicket || activeTicket.id !== ticketId) {
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
          isSolved={isSolved}
        />

        {isSolved &&
          ticketId === currentLoadedTicketId && ( // Also ensure solved message is for current puzzle
            <Text style={styles.solvedText}>
              🎉 Solved! Returning to Sprint Board... 🎉
            </Text>
          )}

        <View style={styles.controls}>
          <Button
            title="Pause & Return to Sprint Board"
            onPress={handlePauseOrExit}
            disabled={isSolved && ticketId === currentLoadedTicketId} // Disable if current puzzle is solved
          />
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
