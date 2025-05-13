// src/logic/ticketLogic.ts
import * as Config from "../config";
import { Ticket, TicketID } from "../types";
import { initPuzzle } from "./puzzleLogic";

let ticketIdCounter = 0;

function generateRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateStoryPoints(N: number, lockedPercent: number): number {
  return Math.round(
    N * Config.STORY_POINTS_SIZE_MULTIPLIER +
      lockedPercent * Config.STORY_POINTS_LOCKED_MULTIPLIER
  );
}

export function generateTicket(sprintNumber: number): Ticket {
  const id: TicketID = `TICKET-${Date.now()}-${ticketIdCounter++}`;

  const typeIndex = generateRandom(0, Config.TICKET_TYPES.length - 1);
  const type = Config.TICKET_TYPES[typeIndex];

  const titleExampleIndex = generateRandom(
    0,
    Config.TICKET_NAME_EXAMPLES.length - 1
  );
  const title = `${Config.TICKET_DETAILS[type].titlePrefix} ${
    Config.TICKET_NAME_EXAMPLES[titleExampleIndex]
  } (#${id.slice(-4)})`;
  const description = Config.TICKET_DETAILS[type].description;

  // Scale puzzle size with sprint number, but cap it
  const maxSizeForSprint = Math.min(
    Config.MAX_PUZZLE_SIZE_INITIAL + Math.floor(sprintNumber / 3),
    Config.MAX_PUZZLE_SIZE_CAP
  );
  const N = generateRandom(Config.MIN_PUZZLE_SIZE, maxSizeForSprint);

  let lockedPercentRange;
  switch (type) {
    case "New Feature":
      lockedPercentRange = Config.LOCKED_PERCENT_NEW_FEATURE;
      break;
    case "Bug Fix":
      lockedPercentRange = Config.LOCKED_PERCENT_BUG_FIX;
      break;
    case "Legacy Rewrite":
      lockedPercentRange = Config.LOCKED_PERCENT_LEGACY;
      break;
    default:
      lockedPercentRange = { min: 10, max: 30 };
  }
  const lockedPercent = generateRandom(
    lockedPercentRange.min,
    lockedPercentRange.max
  );

  const puzzleDefinition = initPuzzle(N, lockedPercent);

  // Ensure start/end are distinct and puzzle is solvable (initPuzzle should handle this)
  // For simplicity, we assume initPuzzle always generates a solvable configuration.

  const storyPoints = calculateStoryPoints(N, lockedPercent);

  return {
    id,
    title,
    type,
    description,
    puzzleDefinition,
    currentPuzzleState: JSON.parse(JSON.stringify(puzzleDefinition)), // Deep copy for working state
    status: "backlog",
    storyPoints,
    timeSpent: 0,
    creationSprint: sprintNumber,
  };
}

export function generateInitialBacklog(sprintNumber: number = 1): Ticket[] {
  const backlog: Ticket[] = [];
  for (let i = 0; i < Config.INITIAL_BACKLOG_SIZE; i++) {
    backlog.push(generateTicket(sprintNumber));
  }
  return backlog;
}

export function addNewTicketsToBacklog(
  currentBacklog: Ticket[],
  sprintNumber: number
): Ticket[] {
  const newTicketCount = Math.floor(
    Config.NEW_TICKETS_PER_SPRINT_BASE +
      (sprintNumber - 1) * Config.NEW_TICKETS_SPRINT_INCREMENT // More tickets in later sprints
  );
  const newTickets: Ticket[] = [];
  for (let i = 0; i < newTicketCount; i++) {
    newTickets.push(generateTicket(sprintNumber));
  }
  return [...currentBacklog, ...newTickets];
}
