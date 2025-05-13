import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native"; // Import Alert for feedback
import {
  initPuzzle,
  checkSolution as pureCheckSolution,
  rotateTile as pureRotateTile,
} from "./puzzleLogic";
import { PuzzleState } from "./types";

interface UsePuzzleStateResult {
  puzzleState: PuzzleState | null;
  isLoading: boolean;
  isSolved: boolean;
  generateNewPuzzle: (size: number, lockedPercent: number) => void;
  rotateTile: (r: number, c: number) => void;
}

export function usePuzzleState(
  initialSize: number,
  initialLockedPercent: number
): UsePuzzleStateResult {
  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  const generateNewPuzzle = useCallback(
    (size: number, lockedPercent: number) => {
      setIsLoading(true);
      setIsSolved(false);
      // Run generation in a timeout to allow UI to update to loading state
      setTimeout(() => {
        const newState = initPuzzle(size, lockedPercent);
        setPuzzleState(newState);
        setIsLoading(false);
      }, 0);
    },
    []
  );

  const rotateTile = useCallback(
    (r: number, c: number) => {
      if (!puzzleState || isLoading || isSolved) return; // Don't rotate if loading, solved, or no state

      // Use the pure function to calculate the next state
      const newGrid = pureRotateTile(puzzleState.grid, r, c);

      if (newGrid) {
        // If rotation happened (tile wasn't locked)
        const newState = { ...puzzleState, grid: newGrid };
        setPuzzleState(newState);

        // Check for solution immediately after state update
        // Note: state updates might be async, checking here is optimistic.
        // A useEffect watching puzzleState might be more robust for the alert.
        const solved = pureCheckSolution(newState);
        if (solved) {
          setIsSolved(true);
          // Use timeout to allow rendering before showing alert
          setTimeout(
            () => Alert.alert("Congratulations!", "🎉 Puzzle Solved! 🎉"),
            100
          );
        }
      }
    },
    [puzzleState, isLoading, isSolved]
  );

  // Initial puzzle generation on mount
  useEffect(() => {
    generateNewPuzzle(initialSize, initialLockedPercent);
  }, [generateNewPuzzle, initialSize, initialLockedPercent]); // Add dependencies

  return {
    puzzleState,
    isLoading,
    isSolved,
    generateNewPuzzle,
    rotateTile,
  };
}
