// src/contexts/GameContext.tsx
import { useRouter } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import { useGameTimer } from "../../src/hooks/useGameTimer";
import {
  addNewTicketsToBacklog,
  generateInitialBacklog,
} from "../../src/logic/ticketLogic";
import * as Config from "../config";
import { GamePhase, PuzzleState, Ticket, TicketID } from "../types/types";

interface GameContextType {
  gamePhase: GamePhase;
  sprintNumber: number;
  backlog: Ticket[];
  currentSprintTickets: Ticket[];
  activeTicket: Ticket | null;
  sprintTimeRemaining: number;
  sprintTotalTime: number;
  isSprintTimerRunning: boolean;
  completedTicketsThisSprint: number;
  totalTicketsCompleted: number;

  startGame: () => void;
  planSprint: () => void;
  addTicketToSprint: (ticketId: TicketID) => void;
  removeTicketFromSprint: (ticketId: TicketID) => void;
  startSprint: () => void;
  selectTicketToWorkOn: (ticketId: TicketID) => void;
  saveAndExitPuzzle: (
    ticketId: TicketID,
    currentPuzzleState: PuzzleState,
    timeSpentOnPuzzle: number
  ) => void;
  completeTicket: (ticketId: TicketID, timeSpentOnPuzzle: number) => void;
  pauseSprintTimer: () => void;
  resumeSprintTimer: () => void;
  endSprintEarly: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [gamePhase, setGamePhase] = useState<GamePhase>("MAIN_MENU");
  const [sprintNumber, setSprintNumber] = useState(0);
  const [backlog, setBacklog] = useState<Ticket[]>([]);
  const [currentSprintTickets, setCurrentSprintTickets] = useState<Ticket[]>(
    []
  );
  const [activeTicketId, setActiveTicketId] = useState<TicketID | null>(null);
  const [sprintTotalTime, setSprintTotalTime] = useState(
    Config.INITIAL_SPRINT_DURATION_SECONDS
  );
  const [completedTicketsThisSprint, setCompletedTicketsThisSprint] =
    useState(0);
  const [totalTicketsCompleted, setTotalTicketsCompleted] = useState(0);

  const handleSprintTimerEnd = useCallback(() => {
    Alert.alert("Sprint Over!", "Time's up for this sprint.", [{ text: "OK" }]);
    setGamePhase("SPRINT_REVIEW");
  }, []);

  const {
    timeRemaining: sprintTimeRemaining,
    isRunning: isSprintTimerRunning,
    startTimer: startSprintTimerInternal,
    pauseTimer: pauseSprintTimerInternal,
    resetTimer: resetSprintTimerInternal,
  } = useGameTimer({
    initialTime: sprintTotalTime,
    onTimerEnd: handleSprintTimerEnd,
  });

  const activeTicket = activeTicketId
    ? currentSprintTickets.find((t) => t.id === activeTicketId) ||
      backlog.find((t) => t.id === activeTicketId) // Should be in currentSprintTickets if active
    : null;

  const startGame = useCallback(() => {
    setSprintNumber(1);
    setBacklog(generateInitialBacklog(1));
    setCurrentSprintTickets([]);
    setActiveTicketId(null);
    setTotalTicketsCompleted(0);
    const initialSprintTime = Config.INITIAL_SPRINT_DURATION_SECONDS;
    setSprintTotalTime(initialSprintTime);
    resetSprintTimerInternal(initialSprintTime);
    setGamePhase("SPRINT_PLANNING");
    router.push("/sprint-planning");
  }, [router, resetSprintTimerInternal]);

  const resetGame = useCallback(() => {
    startGame(); // For now, reset just starts a new game
    router.push("/menu"); // Go back to menu
  }, [startGame, router]);

  const planSprint = useCallback(() => {
    // Move unfinished sprint tickets back to backlog
    const unfinishedTickets = currentSprintTickets.filter(
      (t) => t.status !== "completed"
    );
    unfinishedTickets.forEach((t) => (t.status = "backlog")); // or 'paused' if we want to distinguish

    const newBacklog = addNewTicketsToBacklog(
      [...backlog, ...unfinishedTickets],
      sprintNumber + 1
    );

    if (newBacklog.length > Config.MAX_BACKLOG_BEFORE_GAME_OVER) {
      setGamePhase("GAME_OVER");
      router.push("/game-over");
      return;
    }

    setBacklog(newBacklog);
    setCurrentSprintTickets([]);
    setSprintNumber((prev) => prev + 1);
    setCompletedTicketsThisSprint(0);

    // Adjust sprint time for difficulty scaling
    const nextSprintTime = Math.max(
      Config.MIN_SPRINT_DURATION,
      Config.INITIAL_SPRINT_DURATION_SECONDS -
        sprintNumber * Config.SPRINT_TIME_REDUCTION_PER_SPRINT
    );
    setSprintTotalTime(nextSprintTime);
    resetSprintTimerInternal(nextSprintTime);

    setGamePhase("SPRINT_PLANNING");
    router.push("/sprint-planning");
  }, [
    backlog,
    currentSprintTickets,
    sprintNumber,
    router,
    resetSprintTimerInternal,
  ]);

  useEffect(() => {
    if (gamePhase === "SPRINT_REVIEW") {
      pauseSprintTimerInternal(); // Ensure timer is paused
      // After a short delay or button press, move to planning
      const timer = setTimeout(() => {
        planSprint();
      }, 3000); // Auto-advance after 3s for now
      return () => clearTimeout(timer);
    }
  }, [gamePhase, planSprint, pauseSprintTimerInternal]);

  const addTicketToSprint = useCallback(
    (ticketId: TicketID) => {
      setBacklog((prev) => prev.filter((t) => t.id !== ticketId));
      const ticketToAdd = backlog.find((t) => t.id === ticketId);
      if (ticketToAdd) {
        ticketToAdd.status = "sprint";
        setCurrentSprintTickets((prev) => [...prev, ticketToAdd]);
      }
    },
    [backlog]
  );

  const removeTicketFromSprint = useCallback(
    (ticketId: TicketID) => {
      setCurrentSprintTickets((prev) => prev.filter((t) => t.id !== ticketId));
      const ticketToMove = currentSprintTickets.find((t) => t.id === ticketId);
      if (ticketToMove) {
        ticketToMove.status = "backlog";
        setBacklog((prev) => [...prev, ticketToMove]);
      }
    },
    [currentSprintTickets]
  );

  const startSprint = useCallback(() => {
    if (currentSprintTickets.length === 0) {
      Alert.alert(
        "Empty Sprint",
        "Add some tickets to the sprint before starting."
      );
      return;
    }
    currentSprintTickets.forEach((t) => (t.status = "sprint")); // Ensure status
    setGamePhase("SPRINT_ACTIVE");
    startSprintTimerInternal();
    router.push("/sprint-board");
  }, [currentSprintTickets, router, startSprintTimerInternal]);

  const selectTicketToWorkOn = useCallback(
    (ticketId: TicketID) => {
      const ticket = currentSprintTickets.find((t) => t.id === ticketId);
      if (ticket && ticket.status !== "completed") {
        setActiveTicketId(ticketId);
        ticket.status = "in-progress";
        setGamePhase("PUZZLE_SOLVING");
        resumeSprintTimer(); // Timer runs when solving
        router.push(`/puzzle/${ticketId}`);
      }
    },
    [currentSprintTickets, router]
  );

  const pauseSprintTimer = useCallback(() => {
    if (gamePhase === "PUZZLE_SOLVING") {
      // Only allow explicit pause if solving
      pauseSprintTimerInternal();
    }
  }, [gamePhase, pauseSprintTimerInternal]);

  const resumeSprintTimer = useCallback(() => {
    if (gamePhase === "PUZZLE_SOLVING" && activeTicketId) {
      // Only resume if a puzzle is active
      startSprintTimerInternal();
    }
  }, [gamePhase, activeTicketId, startSprintTimerInternal]);

  const saveAndExitPuzzle = useCallback(
    (
      ticketId: TicketID,
      currentPuzzleState: PuzzleState,
      timeSpentOnPuzzle: number
    ) => {
      const ticketIndex = currentSprintTickets.findIndex(
        (t) => t.id === ticketId
      );
      if (ticketIndex !== -1) {
        const updatedTickets = [...currentSprintTickets];
        updatedTickets[ticketIndex] = {
          ...updatedTickets[ticketIndex],
          currentPuzzleState,
          status: "paused", // Or keep as "sprint" if just navigating away
          timeSpent:
            (updatedTickets[ticketIndex].timeSpent || 0) + timeSpentOnPuzzle,
        };
        setCurrentSprintTickets(updatedTickets);
      }
      setActiveTicketId(null);
      setGamePhase("SPRINT_ACTIVE");
      pauseSprintTimerInternal(); // Pause timer when back on sprint board
      router.push("/sprint-board");
    },
    [currentSprintTickets, router, pauseSprintTimerInternal]
  );

  const completeTicket = useCallback(
    (ticketId: TicketID, timeSpentOnPuzzle: number) => {
      const ticketIndex = currentSprintTickets.findIndex(
        (t) => t.id === ticketId
      );
      if (ticketIndex !== -1) {
        const updatedTickets = [...currentSprintTickets];
        updatedTickets[ticketIndex] = {
          ...updatedTickets[ticketIndex],
          status: "completed",
          timeSpent:
            (updatedTickets[ticketIndex].timeSpent || 0) + timeSpentOnPuzzle,
        };
        setCurrentSprintTickets(updatedTickets);
        setCompletedTicketsThisSprint((prev) => prev + 1);
        setTotalTicketsCompleted((prev) => prev + 1);
      }
      setActiveTicketId(null);
      setGamePhase("SPRINT_ACTIVE");
      pauseSprintTimerInternal(); // Pause timer when back on sprint board
      // Potentially add bonus time for completing a ticket
      // addTime(updatedTickets[ticketIndex].storyPoints * 5); // e.g. 5s per story point
      router.push("/sprint-board");
    },
    [currentSprintTickets, router, pauseSprintTimerInternal]
  );

  const endSprintEarly = useCallback(() => {
    pauseSprintTimerInternal();
    setGamePhase("SPRINT_REVIEW");
    // router.push will be handled by useEffect on gamePhase change
  }, [pauseSprintTimerInternal]);

  return (
    <GameContext.Provider
      value={{
        gamePhase,
        sprintNumber,
        backlog,
        currentSprintTickets,
        activeTicket,
        sprintTimeRemaining,
        sprintTotalTime,
        isSprintTimerRunning,
        completedTicketsThisSprint,
        totalTicketsCompleted,
        startGame,
        planSprint,
        addTicketToSprint,
        removeTicketFromSprint,
        startSprint,
        selectTicketToWorkOn,
        saveAndExitPuzzle,
        completeTicket,
        pauseSprintTimer,
        resumeSprintTimer,
        endSprintEarly,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
