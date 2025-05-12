export type TileType = 'straight' | 'curve' | 'end';
export type Direction = 'up' | 'right' | 'down' | 'left';
export type SpecialType = 'start' | 'end' | null;

export interface TileState {
  type: TileType;
  correct: number; // Correct rotation angle (0, 90, 180, 270)
  rotation: number; // Current rotation angle
  locked: boolean;
  special: SpecialType;
  // Store row/col for convenience if needed, but typically derived from grid position
  // r: number;
  // c: number;
}

export type GridState = TileState[][];

export interface PuzzleState {
  N: number; // Grid size (NxN)
  lockedPercent: number;
  grid: GridState;
}