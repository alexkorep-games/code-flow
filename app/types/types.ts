// src/types.ts
export type TileType = "straight" | "curve" | "end";
export type Direction = "up" | "right" | "down" | "left";
export type SpecialType = "start" | "end" | null;

export interface TileState {
  type: TileType;
  correct: number;
  rotation: number;
  locked: boolean;
  special: SpecialType;
}

export type GridState = TileState[][];

export interface PuzzleState {
  N: number;
  lockedPercent: number; // Original locked percent for generation info
  grid: GridState;
  // Store start/end positions if explicitly needed for puzzle logic beyond visuals
  // startPos?: [number, number];
  // endPos?: [number, number];
}

// --- New Game Specific Types ---
export type TicketID = string;
export type TicketType = "New Feature" | "Bug Fix" | "Legacy Rewrite";
export type TicketStatus =
  | "backlog"
  | "sprint"
  | "in-progress"
  | "completed"
  | "paused";

export interface Ticket {
  id: TicketID;
  title: string;
  type: TicketType;
  description: string;
  puzzleDefinition: PuzzleState; // Initial state for resetting or preview
  currentPuzzleState: PuzzleState; // Current working state of the puzzle
  status: TicketStatus;
  storyPoints: number; // Derived from N and lockedPercent
  timeSpent: number; // in seconds, while actively solving this ticket's puzzle
  creationSprint: number; // Sprint number when this ticket was generated
}

export type GamePhase =
  | "MAIN_MENU"
  | "SPRINT_PLANNING"
  | "SPRINT_ACTIVE" // Viewing the sprint board, selecting tickets
  | "PUZZLE_SOLVING" // Actively working on a puzzle
  | "SPRINT_REVIEW" // Post-sprint, before next planning
  | "GAME_OVER";
