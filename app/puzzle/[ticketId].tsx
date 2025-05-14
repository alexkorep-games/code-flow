// src/app/puzzle/[ticketId].tsx
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react"; // Added useCallback
import {
  AppState,
  Button,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PuzzleGrid from "../../src/components/PuzzleGrid";
import { useGame } from "../../src/contexts/GameContext";
import { usePuzzleState } from "../../src/hooks/usePuzzleState"; // Correct path

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
    gamePhase, // <-- Add this from context
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
    }

    return () => {
      pauseLocalPuzzleTimer();
      pauseSprintTimer();
    };
  }, [
    activeTicket,
    ticketId,
    currentLoadedTicketId,
    loadPuzzle,
    resetPuzzleTimer,
    startPuzzleTimer,
    resumeSprintTimer,
    pauseSprintTimer,
    pauseLocalPuzzleTimer,
    gamePhase, // Add gamePhase to dependency array
    router, // Add router to dependency array
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

  // AppState listener for auto-saving puzzle progress when app backgrounds
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        nextAppState.match(/inactive|background/) &&
        gamePhase === "PUZZLE_SOLVING" &&
        activeTicket &&
        activeTicket.id === ticketId &&
        puzzleState
      ) {
        // console.log('PuzzleScreen: App inactive/background, saving current puzzle state.');
        // This call will update the ticket in GameContext via saveAndExitPuzzle,
        // which internally calls saveGameState from GameContext.
        // No need to await here as GameContext's own AppState listener will handle saving.
        // The main goal is to update the ticket in GameContext *before* GameContext saves.
        saveAndExitPuzzle(
          activeTicket.id,
          { ...puzzleState, grid: getCurrentGrid() || puzzleState.grid },
          timeSpentOnPuzzle
        );
      }
    });

    return () => {
      subscription.remove();
    };
  }, [
    gamePhase,
    activeTicket,
    ticketId,
    puzzleState,
    saveAndExitPuzzle,
    timeSpentOnPuzzle,
    getCurrentGrid,
  ]);

  if (
    gamePhase === "MAIN_MENU" ||
    gamePhase === "GAME_OVER" ||
    gamePhase === "SPRINT_REVIEW"
  ) {
    return <Redirect href="/menu" />;
  }
  if (gamePhase === "SPRINT_PLANNING") {
    return <Redirect href="/sprint-planning" />;
  }
  if (gamePhase === "SPRINT_ACTIVE") {
    return <Redirect href="/sprint-board" />;
  }
  // If we *are* in PUZZLE_SOLVING, but the activeTicket doesn't match this ticketId:
  if (
    gamePhase === "PUZZLE_SOLVING" &&
    (!activeTicket || activeTicket.id !== ticketId)
  ) {
    return <Redirect href="/sprint-board" />;
  }

  // The initial loading display before useEffect kicks in:
  if (!activeTicket || activeTicket.id !== ticketId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Loading ticket...</Text>
          {/* Optionally, add a button to go back if stuck */}
          <Button
            title="Go Back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/menu")
            }
          />
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
