// src/config.ts
export const INITIAL_SPRINT_DURATION_SECONDS = 5 * 60; // 5 minutes
export const INITIAL_BACKLOG_SIZE = 8;
export const NEW_TICKETS_PER_SPRINT_BASE = 2; // Base new tickets
export const NEW_TICKETS_SPRINT_INCREMENT = 0.5; // How many more new tickets (on avg) per sprint

export const MAX_BACKLOG_BEFORE_GAME_OVER = 30;

// Puzzle Generation Config
export const MIN_PUZZLE_SIZE = 3;
export const MAX_PUZZLE_SIZE_INITIAL = 6;
export const MAX_PUZZLE_SIZE_CAP = 10; // Absolute max size
export const LOCKED_PERCENT_NEW_FEATURE = { min: 0, max: 15 };
export const LOCKED_PERCENT_BUG_FIX = { min: 25, max: 55 };
export const LOCKED_PERCENT_LEGACY = { min: 45, max: 75 };

export const STORY_POINTS_SIZE_MULTIPLIER = 1;
export const STORY_POINTS_LOCKED_MULTIPLIER = 0.05; // Each % of locked adds this to base N

export const TICKET_TYPES: TicketType[] = [
  "New Feature",
  "Bug Fix",
  "Legacy Rewrite",
];

export const TICKET_DETAILS: Record<
  TicketType,
  { titlePrefix: string; description: string }
> = {
  "New Feature": {
    titlePrefix: "Feat:",
    description: "Implement a brand new module or functionality.",
  },
  "Bug Fix": {
    titlePrefix: "Fix:",
    description: "Resolve an issue in existing code.",
  },
  "Legacy Rewrite": {
    titlePrefix: "Refactor:",
    description: "Modernize or improve an old part of the system.",
  },
};

export const TICKET_NAME_EXAMPLES = [
  "User Auth System",
  "Payment Gateway Integration",
  "Search Algorithm",
  "UI Theme Engine",
  "Notification Service",
  "Data Analytics Pipeline",
  "API Versioning",
  "Caching Layer",
  "Login Page Crash",
  "Data Sync Error",
  "Security Flaw",
  "Performance Bottleneck",
  "Old Database Module",
  "Deprecated UI Library",
  "Monolithic Service",
  "Tech Debt Cleanup",
];

export const SPRINT_TIME_REDUCTION_PER_SPRINT = 5; // Reduce sprint time slightly each sprint
export const MIN_SPRINT_DURATION = 60; // Minimum sprint time
