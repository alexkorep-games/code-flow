import {
  Direction,
  GridState,
  PuzzleState,
  SpecialType,
  TileState,
  TileType,
} from "../types/types";

// --- Rotation Helpers ---

const DIRS: Record<Direction, [number, number]> = {
  up: [-1, 0],
  right: [0, 1],
  down: [1, 0],
  left: [0, -1],
};

const DIR_LIST: Direction[] = ["up", "right", "down", "left"];
const ROTATION_ORDER: number[] = [0, 90, 180, 270];

/** Checks if two arrays are equal */
function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Rotates a single direction by a given angle */
export function rotateDir(d: Direction, ang: number): Direction {
  const index = DIR_LIST.indexOf(d);
  const newIndex = (index + ang / 90) % 4;
  return DIR_LIST[newIndex < 0 ? newIndex + 4 : newIndex]; // Handle potential negative modulo
}

/** Finds the correct rotation angle for a tile type to match target connections */
function rotateFor(
  defaultConnections: Direction[],
  targetConnections: Direction[]
): number {
  const sortedTarget = [...targetConnections].sort();
  for (const ang of ROTATION_ORDER) {
    const rotatedConnections = defaultConnections
      .map((d) => rotateDir(d, ang))
      .sort();
    if (arraysEqual(rotatedConnections, sortedTarget)) {
      return ang;
    }
  }
  console.warn(
    "Could not find rotation for",
    defaultConnections,
    targetConnections
  );
  return 0; // Should not happen with valid logic
}

/** Get the default connections for a tile type (at 0 rotation) */
function getDefaultConnections(type: TileType): Direction[] {
  switch (type) {
    case "straight":
      return ["right", "left"];
    case "curve":
      return ["up", "right"];
    case "end":
      return ["right"];
    default:
      return [];
  }
}

/** Get the current connections of a tile based on its type and rotation */
export function getCurrentConnections(tile: TileState): Direction[] {
  const defaultConns = getDefaultConnections(tile.type);
  return defaultConns.map((d) => rotateDir(d, tile.rotation));
}

// --- Puzzle Initialization ---

/** Initializes a new puzzle state */
export function initPuzzle(size: number, lockedPercent: number): PuzzleState {
  const N = size;

  // Build Hamiltonian snake path
  const cells: [number, number][] = [];
  for (let r = 0; r < N; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < N; c++) cells.push([r, c]);
    } else {
      for (let c = N - 1; c >= 0; c--) cells.push([r, c]);
    }
  }

  // Initialize empty grid
  const grid: GridState = Array.from({ length: N }, () =>
    Array(N)
      .fill(null)
      .map(() => ({
        // Placeholder initialization
        type: "end", // Will be overwritten
        correct: 0,
        rotation: 0,
        locked: false,
        special: null,
      }))
  );

  // Populate grid based on path
  for (let i = 0; i < cells.length; i++) {
    const [r, c] = cells[i];
    const connections: Direction[] = [];

    // Previous connection
    if (i > 0) {
      const [pr, pc] = cells[i - 1];
      for (const d in DIRS) {
        if (
          pr === r + DIRS[d as Direction][0] &&
          pc === c + DIRS[d as Direction][1]
        ) {
          connections.push(d as Direction);
        }
      }
    }
    // Next connection
    if (i < cells.length - 1) {
      const [nr, nc] = cells[i + 1];
      for (const d in DIRS) {
        if (
          nr === r + DIRS[d as Direction][0] &&
          nc === c + DIRS[d as Direction][1]
        ) {
          connections.push(d as Direction);
        }
      }
    }

    // Determine tile type and correct rotation
    let type: TileType;
    let correct: number;
    let defaultConnections: Direction[];

    if (connections.length === 1) {
      type = "end";
      defaultConnections = getDefaultConnections(type);
      correct = rotateFor(defaultConnections, connections);
    } else {
      // connections.length === 2
      const hasHorizontal =
        connections.includes("left") || connections.includes("right");
      const hasVertical =
        connections.includes("up") || connections.includes("down");

      if (hasHorizontal && hasVertical) {
        type = "curve";
      } else {
        // Both horizontal or both vertical
        type = "straight";
      }
      defaultConnections = getDefaultConnections(type);
      correct = rotateFor(defaultConnections, connections);
    }

    // Lock logic and initial rotation
    const locked = Math.random() * 100 < lockedPercent;
    const rotation = locked
      ? correct
      : (correct + (Math.floor(Math.random() * 3) + 1) * 90) % 360;

    const special: SpecialType =
      i === 0 ? "start" : i === cells.length - 1 ? "end" : null;

    grid[r][c] = {
      type,
      correct,
      rotation,
      locked,
      special,
    };
  }

  return { N, lockedPercent, grid };
}

// --- State Update Functions (Pure) ---

/** Rotates a tile at given coordinates if not locked. Returns a new grid state. */
export function rotateTile(
  grid: GridState,
  r: number,
  c: number
): GridState | null {
  const tile = grid[r]?.[c];
  if (!tile || tile.locked) {
    return null; // No change or invalid coords
  }

  // Create a deep copy to ensure immutability
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

  // Update the specific tile
  newGrid[r][c].rotation = (newGrid[r][c].rotation + 90) % 360;

  return newGrid;
}

// --- Solution Checking ---

/** Checks if the puzzle is solved */
export function checkSolution(state: PuzzleState): boolean {
  const { N, grid } = state;

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const tile = grid[r][c];
      const currentConns = getCurrentConnections(tile);

      // Degree check (start/end must have 1 connection, others must have 2)
      const requiredDegree = tile.special ? 1 : 2;
      if (currentConns.length !== requiredDegree) {
        // console.log(`Degree fail at [${r},${c}]: got ${currentConns.length}, needed ${requiredDegree}`, tile);
        return false;
      }

      // Adjacency check
      for (const dir of currentConns) {
        const [dr, dc] = DIRS[dir];
        const nr = r + dr;
        const nc = c + dc;

        // Check bounds
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) {
          // console.log(`Bounds fail at [${r},${c}] going ${dir}`);
          return false; // Connection points outside grid
        }

        const neighborTile = grid[nr][nc];
        const neighborConns = getCurrentConnections(neighborTile);

        // Find opposite direction
        const oppositeDir = DIR_LIST[(DIR_LIST.indexOf(dir) + 2) % 4];

        // Check if neighbor connects back
        if (!neighborConns.includes(oppositeDir)) {
          // console.log(`Neighbor fail at [${r},${c}] -> [${nr},${nc}]. ${dir} -> ${oppositeDir} not found in neighbor's connections:`, neighborConns);
          return false;
        }
      }
    }
  }

  return true; // All checks passed
}
