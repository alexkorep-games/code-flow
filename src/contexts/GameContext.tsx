// src/contexts/GameContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Platform,
  Text,
  View,
} from "react-native";
import { useGameTimer } from "../../src/hooks/useGameTimer";
import { generateInitialBacklog } from "../../src/logic/ticketLogic";
import * as Config from "../config";
import { GamePhase, PuzzleState, Ticket, TicketID } from "../types/types";

const GAME_STATE_STORAGE_KEY = "codeFlowGameState_v1.1"; // Increment version if structure changes

interface SavedGameState {
  gamePhase: GamePhase;
  sprintNumber: number;
  backlog: Ticket[];
  currentSprintTickets: Ticket[];
  activeTicketId: TicketID | null;
  sprintTotalTime: number;
  sprintTimeRemaining: number;
  isSprintTimerRunning: boolean;
  totalTicketsCompleted: number;
  completedTicketsThisSprint: number;
  savedAt: number;
}

interface GameContextType {
  gamePhase: GamePhase;
  sprintNumber: number;
  backlog: Ticket[];
  currentSprintTickets: Ticket[];
  activeTicketId: TicketID | null;
  activeTicket: Ticket | null;
  sprintTotalTime: number;
  sprintTimeRemaining: number;
  isSprintTimerRunning: boolean;
  completedTicketsThisSprint: number;
  totalTicketsCompleted: number;
  isPersistenceLoading: boolean;
  currentScreen: string;

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
  endSprintEarly: () => void;
  resetGame: () => void;
  pauseSprintTimer: () => void;
  resumeSprintTimer: () => void;
  setCurrentScreen: (screen: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isPersistenceLoading, setIsPersistenceLoading] = useState(true);
  const [gamePhase, setGamePhase] = useState<GamePhase>("MAIN_MENU");
  const [sprintNumber, setSprintNumber] = useState(0);
  const [backlog, setBacklog] = useState<Ticket[]>([]);
  const [currentSprintTickets, setCurrentSprintTickets] = useState<Ticket[]>(
    []
  );
  const [activeTicketId, setActiveTicketId] = useState<TicketID | null>(null);
  const [sprintTotalTime, setSprintTotalTime] = useState(0);
  const [totalTicketsCompleted, setTotalTicketsCompleted] = useState(0);
  const [completedTicketsThisSprint, setCompletedTicketsThisSprint] =
    useState(0);
  const [currentScreen, setCurrentScreen] = useState<string>("menu");

  const handleSprintTimerEnd = useCallback(() => {
    Alert.alert("Sprint Over!", "Time's up for this sprint.", [{ text: "OK" }]);
    setGamePhase("SPRINT_REVIEW");
  }, []);

  const {
    timeRemaining,
    isRunning,
    startTimer: startSprintTimerInternal,
    pauseTimer: pauseSprintTimerInternal,
    resetTimer: resetSprintTimerInternal,
    setTimeManually: sprintTimerSetTimeManually, // For loading state
  } = useGameTimer({
    initialTime: sprintTotalTime,
    onTimerEnd: handleSprintTimerEnd,
  });

  const activeTicket: Ticket | null =
    activeTicketId != null
      ? currentSprintTickets.find((t) => t.id === activeTicketId) ||
        backlog.find((t) => t.id === activeTicketId) ||
        null
      : null;

  const saveGameState = useCallback(async () => {
    if (Platform.OS === "web")
      console.log(
        "Attempting to save game state (web)... Current phase:",
        gamePhase
      );
    const stateToSave: SavedGameState = {
      gamePhase,
      sprintNumber,
      backlog,
      currentSprintTickets,
      activeTicketId,
      sprintTotalTime,
      sprintTimeRemaining: timeRemaining,
      isSprintTimerRunning: isRunning,
      totalTicketsCompleted,
      completedTicketsThisSprint,
      savedAt: Date.now(),
    };
    try {
      const jsonState = JSON.stringify(stateToSave);
      await AsyncStorage.setItem(GAME_STATE_STORAGE_KEY, jsonState);
      if (Platform.OS === "web")
        console.log("Game state saved successfully (web).");
    } catch (e) {
      console.error("Failed to save game state:", e);
    }
  }, [
    gamePhase,
    sprintNumber,
    backlog,
    currentSprintTickets,
    activeTicketId,
    sprintTotalTime,
    timeRemaining,
    isRunning,
    totalTicketsCompleted,
    completedTicketsThisSprint,
  ]);

  // --- Game Lifecycle Functions ---

  const _initializeNewGameState = useCallback(() => {
    setSprintNumber(1);
    setBacklog(generateInitialBacklog());
    setCurrentSprintTickets([]);
    setActiveTicketId(null);
    setSprintTotalTime(Config.INITIAL_SPRINT_DURATION_SECONDS);
    setTotalTicketsCompleted(0);
    setCompletedTicketsThisSprint(0);
    resetSprintTimerInternal(Config.INITIAL_SPRINT_DURATION_SECONDS);
  }, [resetSprintTimerInternal]);

  const startGame = useCallback(async () => {
    _initializeNewGameState();
    setGamePhase("SPRINT_PLANNING");
    setCurrentScreen("sprint-planning");
    try {
      await AsyncStorage.removeItem(GAME_STATE_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear saved state on new game:", e);
    }
  }, [_initializeNewGameState]);

  const resetGame = useCallback(async () => {
    _initializeNewGameState();
    setGamePhase("MAIN_MENU");
    setCurrentScreen("menu");
    try {
      await AsyncStorage.removeItem(GAME_STATE_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear saved state on reset game:", e);
    }
  }, [_initializeNewGameState]);

  const planSprint = useCallback(() => {
    setBacklog((prevBacklog) => [
      ...prevBacklog,
      ...currentSprintTickets.filter((t) => t.status !== "completed"),
    ]);
    setCurrentSprintTickets([]);
    setActiveTicketId(null);
    setSprintTotalTime(Config.INITIAL_SPRINT_DURATION_SECONDS);
    resetSprintTimerInternal(Config.INITIAL_SPRINT_DURATION_SECONDS);
    setCompletedTicketsThisSprint(0);
    setGamePhase("SPRINT_PLANNING");
    setCurrentScreen("sprint-planning");
    saveGameState();
  }, [backlog, currentSprintTickets, resetSprintTimerInternal, saveGameState]);

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

  const startSprint = useCallback(async () => {
    if (currentSprintTickets.length === 0) {
      Alert.alert(
        "Empty Sprint",
        "Add some tickets to the sprint before starting."
      );
      return;
    }
    currentSprintTickets.forEach((t) => (t.status = "sprint"));
    setGamePhase("SPRINT_ACTIVE");
    setCurrentScreen("sprint-board");
    startSprintTimerInternal();
    await saveGameState();
  }, [currentSprintTickets, startSprintTimerInternal, saveGameState]);

  // Move resumeSprintTimer definition above selectTicketToWorkOn to avoid TDZ error
  const resumeSprintTimer = useCallback(() => {
    if (gamePhase === "PUZZLE_SOLVING" && activeTicketId) {
      // Only resume if a puzzle is active
      startSprintTimerInternal();
    }
  }, [gamePhase, activeTicketId, startSprintTimerInternal]);

  const selectTicketToWorkOn = useCallback(
    (ticketId: TicketID) => {
      const ticket = currentSprintTickets.find((t) => t.id === ticketId);
      if (ticket && ticket.status !== "completed") {
        setActiveTicketId(ticketId);
        ticket.status = "in-progress";
        setGamePhase("PUZZLE_SOLVING");
        setCurrentScreen("puzzle");
        resumeSprintTimer();
      }
    },
    [currentSprintTickets, resumeSprintTimer]
  );

  const pauseSprintTimer = useCallback(() => {
    if (gamePhase === "PUZZLE_SOLVING") {
      // Only allow explicit pause if solving
      pauseSprintTimerInternal();
    }
  }, [gamePhase, pauseSprintTimerInternal]);

  const saveAndExitPuzzle = useCallback(
    async (
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
          status: "paused",
          timeSpent:
            (updatedTickets[ticketIndex].timeSpent || 0) + timeSpentOnPuzzle,
        };
        setCurrentSprintTickets(updatedTickets);
      }
      setActiveTicketId(null);
      setGamePhase("SPRINT_ACTIVE");
      setCurrentScreen("sprint-board");
      pauseSprintTimerInternal();
      await saveGameState();
    },
    [currentSprintTickets, pauseSprintTimerInternal, saveGameState]
  );

  const completeTicket = useCallback(
    async (ticketId: TicketID, timeSpentOnPuzzle: number) => {
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
      setCurrentScreen("sprint-board");
      pauseSprintTimerInternal();
      await saveGameState();
    },
    [currentSprintTickets, pauseSprintTimerInternal, saveGameState]
  );

  const endSprintEarly = useCallback(async () => {
    pauseSprintTimerInternal();
    setGamePhase("SPRINT_REVIEW");
    await saveGameState();
  }, [pauseSprintTimerInternal, saveGameState]);

  // --- Persistence useEffects ---

  useEffect(() => {
    const loadState = async () => {
      try {
        const jsonState = await AsyncStorage.getItem(GAME_STATE_STORAGE_KEY);
        if (jsonState !== null) {
          const loadedState = JSON.parse(jsonState) as SavedGameState;
          if (Platform.OS === "web")
            console.log(
              "Loaded game state (web):",
              loadedState.gamePhase,
              "Sprint:",
              loadedState.sprintNumber
            );
          setGamePhase(loadedState.gamePhase);
          setSprintNumber(loadedState.sprintNumber);
          setBacklog(loadedState.backlog);
          setCurrentSprintTickets(loadedState.currentSprintTickets);
          setActiveTicketId(loadedState.activeTicketId);
          setSprintTotalTime(loadedState.sprintTotalTime);
          resetSprintTimerInternal(loadedState.sprintTotalTime);
          sprintTimerSetTimeManually(loadedState.sprintTimeRemaining);
          setTotalTicketsCompleted(loadedState.totalTicketsCompleted);
          setCompletedTicketsThisSprint(loadedState.completedTicketsThisSprint);
          if (
            loadedState.isSprintTimerRunning &&
            loadedState.sprintTimeRemaining > 0
          ) {
            if (
              loadedState.gamePhase === "PUZZLE_SOLVING" ||
              (loadedState.gamePhase === "SPRINT_ACTIVE" &&
                loadedState.isSprintTimerRunning)
            ) {
              startSprintTimerInternal();
            }
          } else {
            pauseSprintTimerInternal();
          }
        } else {
          if (Platform.OS === "web")
            console.log("No saved game state found (web), starting fresh.");
          setGamePhase("MAIN_MENU");
        }
      } catch (e) {
        console.error("Failed to load game state:", e);
        setGamePhase("MAIN_MENU");
      } finally {
        setIsPersistenceLoading(false);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState.match(/inactive|background/)) {
          if (Platform.OS === "web")
            console.log(
              "App going to background/inactive (web). Saving state..."
            );
          await saveGameState();
        }
      }
    );
    return () => {
      subscription.remove();
    };
  }, [saveGameState]);

  if (isPersistenceLoading && Platform.OS !== "web") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ marginTop: 10 }}>Loading game...</Text>
      </View>
    );
  }

  // Update context value to use correct timer state
  return (
    <GameContext.Provider
      value={{
        gamePhase,
        sprintNumber,
        backlog,
        currentSprintTickets,
        activeTicketId,
        activeTicket,
        sprintTotalTime,
        sprintTimeRemaining: timeRemaining,
        isSprintTimerRunning: isRunning,
        completedTicketsThisSprint,
        totalTicketsCompleted,
        isPersistenceLoading,
        currentScreen,
        setCurrentScreen,
        startGame,
        planSprint,
        addTicketToSprint,
        removeTicketFromSprint,
        startSprint,
        selectTicketToWorkOn,
        saveAndExitPuzzle,
        completeTicket,
        endSprintEarly,
        resetGame,
        pauseSprintTimer,
        resumeSprintTimer,
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
