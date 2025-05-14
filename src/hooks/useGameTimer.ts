// src/hooks/useGameTimer.ts
import { useCallback, useEffect, useRef, useState } from "react";

interface UseGameTimerProps {
  initialTime: number; // in seconds
  onTimerEnd?: () => void;
}

export function useGameTimer({ initialTime, onTimerEnd }: UseGameTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    setTimeRemaining((prevTime) => {
      if (prevTime <= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        onTimerEnd?.();
        return 0;
      }
      return prevTime - 1;
    });
  }, [onTimerEnd]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeRemaining, tick]);

  const startTimer = useCallback(() => {
    if (timeRemaining > 0) {
      setIsRunning(true);
    }
  }, [timeRemaining]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(
    (newTime?: number) => {
      setIsRunning(false);
      setTimeRemaining(newTime ?? initialTime);
    },
    [initialTime]
  );

  const addTime = useCallback((seconds: number) => {
    setTimeRemaining((prev) => Math.max(0, prev + seconds));
  }, []);

  // Update initial time if prop changes
  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime]);

  return {
    timeRemaining,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    addTime,
    setTimeManually: setTimeRemaining,
  };
}
