/** App-wide constants */

/** Timezone used for display (all storage is UTC) */
export const DISPLAY_TIMEZONE = "Asia/Kolkata";

/** Date format for display */
export const DATE_FORMAT = "dd MMM yyyy";
export const DATETIME_FORMAT = "dd MMM yyyy, hh:mm a";

/** App name */
export const APP_NAME = "Tryaksh SOP";

/** Roles */
export const ROLES = {
  CEO: "ceo",
  DESIGNER: "designer",
  VIEWER: "viewer",
} as const;

/** Stage numbers that are lock gates */
export const LOCK_GATE_STAGES = ["6", "8"] as const;

/** Stage 8 decision branching */
export const STAGE_8_DECISIONS = {
  PROCEED: "proceed",
  REOPEN: "reopen",
} as const;
