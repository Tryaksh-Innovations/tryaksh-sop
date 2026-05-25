/**
 * Structured logger — replaces all console.log usage.
 *
 * In production, this can be swapped for a structured logging service
 * (e.g., Axiom, Datadog). For now, it outputs JSON to stdout.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  [key: string]: unknown;
}

function formatLog(level: LogLevel, payload: LogPayload): string {
  return JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    ...payload,
  });
}

export const logger = {
  debug(message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug(formatLog("debug", { message, ...data }));
    }
  },

  info(message: string, data?: Record<string, unknown>) {
    // eslint-disable-next-line no-console
    console.info(formatLog("info", { message, ...data }));
  },

  warn(message: string, data?: Record<string, unknown>) {
    // eslint-disable-next-line no-console
    console.warn(formatLog("warn", { message, ...data }));
  },

  error(message: string, error?: unknown, data?: Record<string, unknown>) {
    const errorData =
      error instanceof Error
        ? { errorMessage: error.message, stack: error.stack }
        : { errorMessage: String(error) };

    // eslint-disable-next-line no-console
    console.error(formatLog("error", { message, ...errorData, ...data }));
  },
};
