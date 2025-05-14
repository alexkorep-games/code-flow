// src/usePuzzleState.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  initPuzzle,
  checkSolution as pureCheckSolution,
  rotateTile as pureRotateTile,
} from "../logic/puzzleLogic"; // Assuming puzzleLogic is in the same folder or adjust path
import { GridState, PuzzleState } from "../types/types";

interface UsePuzzleStateParams {
  initialPuzzle?: PuzzleState | null; // For loading existing puzzle
  generateNew?: {
    // For generating a new one
    size: number;
    lockedPercent: number;
  };
}

interface UsePuzzleStateResult {
  puzzleState: PuzzleState | null;
  isLoading: boolean;
  isSolved: boolean;
  generateNewPuzzle: (size: number, lockedPercent: number) => void; // Kept for potential standalone use
  loadPuzzle: (puzzle: PuzzleState) => void;
  rotateTile: (r: number, c: number) => void;
  getCurrentGrid: () => GridState | null; // To get current state for saving
  timeSpentOnPuzzle: number; // In seconds
  startPuzzleTimer: () => void;
  pausePuzzleTimer: () => void;
  resetPuzzleTimer: () => void;
}

export function usePuzzleState(
  params: UsePuzzleStateParams
): UsePuzzleStateResult {
  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(
    params.initialPuzzle || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    !params.initialPuzzle && !!params.generateNew
  );
  const [isSolved, setIsSolved] = useState<boolean>(false);

  const [timeSpentOnPuzzle, setTimeSpentOnPuzzle] = useState(0);
  const puzzleTimerIntervalRef = useRef<number | null>(null);
  const [isPuzzleTimerRunning, setIsPuzzleTimerRunning] = useState(false);

  const startPuzzleTimer = useCallback(() => setIsPuzzleTimerRunning(true), []);
  const pausePuzzleTimer = useCallback(
    () => setIsPuzzleTimerRunning(false),
    []
  );
  const resetPuzzleTimer = useCallback(() => {
    setIsPuzzleTimerRunning(false);
    setTimeSpentOnPuzzle(0);
  }, []);

  useEffect(() => {
    if (isPuzzleTimerRunning && !isSolved) {
      puzzleTimerIntervalRef.current = setInterval(() => {
        setTimeSpentOnPuzzle((prev) => prev + 1);
      }, 1000);
    } else {
      if (puzzleTimerIntervalRef.current) {
        clearInterval(puzzleTimerIntervalRef.current);
      }
    }
    return () => {
      if (puzzleTimerIntervalRef.current) {
        clearInterval(puzzleTimerIntervalRef.current);
      }
    };
  }, [isPuzzleTimerRunning, isSolved]);

  const internalSetPuzzle = (newState: PuzzleState) => {
    setPuzzleState(newState);
    const solved = pureCheckSolution(newState);
    if (solved) {
      setIsSolved(true);
      pausePuzzleTimer(); // Stop timer when solved
      // Alert is better handled by the screen using the hook
    }
  };

  const generateNewPuzzle = useCallback(
    (size: number, lockedPercent: number) => {
      setIsLoading(true);
      setIsSolved(false);
      resetPuzzleTimer();
      setTimeout(() => {
        const newState = initPuzzle(size, lockedPercent);
        internalSetPuzzle(newState);
        setIsLoading(false);
      }, 0);
    },
    [resetPuzzleTimer]
  );

  const loadPuzzle = useCallback(
    (puzzleToLoad: PuzzleState) => {
      setIsLoading(true);
      setIsSolved(false);
      resetPuzzleTimer(); // Reset timer for the new puzzle
      setTimeout(() => {
        // Check if this loaded puzzle is already solved
        const alreadySolved = pureCheckSolution(puzzleToLoad);
        setPuzzleState(puzzleToLoad);
        setIsSolved(alreadySolved);
        setIsLoading(false);
        if (alreadySolved) {
          pausePuzzleTimer();
        }
      }, 0);
    },
    [resetPuzzleTimer, pausePuzzleTimer]
  );

  const rotateTile = useCallback(
    (r: number, c: number) => {
      if (!puzzleState || isLoading || isSolved) return;

      const newGrid = pureRotateTile(puzzleState.grid, r, c);

      if (newGrid) {
        const newState = { ...puzzleState, grid: newGrid };
        setPuzzleState(newState); // Update local state first for responsiveness

        const solved = pureCheckSolution(newState); // Check solution
        if (solved) {
          setIsSolved(true);
          pausePuzzleTimer();
          // Delay alert slightly to allow UI to update
          setTimeout(
            () => Alert.alert("Congratulations!", "🎉 Puzzle Solved! 🎉"),
            100
          );
        }
      }
    },
    [puzzleState, isLoading, isSolved, pausePuzzleTimer]
  );

  const getCurrentGrid = useCallback(() => {
    return puzzleState ? puzzleState.grid : null;
  }, [puzzleState]);

  // Initial puzzle generation or loading
  useEffect(() => {
    if (params.initialPuzzle) {
      loadPuzzle(params.initialPuzzle);
    } else if (params.generateNew) {
      generateNewPuzzle(
        params.generateNew.size,
        params.generateNew.lockedPercent
      );
    } else {
      setIsLoading(false); // No puzzle to load/generate
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount with initial params. Subsequent loads via loadPuzzle/generateNewPuzzle

  return {
    puzzleState,
    isLoading,
    isSolved,
    generateNewPuzzle,
    loadPuzzle,
    rotateTile,
    getCurrentGrid,
    timeSpentOnPuzzle,
    startPuzzleTimer,
    pausePuzzleTimer,
    resetPuzzleTimer,
  };
}
