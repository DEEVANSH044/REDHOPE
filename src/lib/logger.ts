type LogLevel = "info" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

function formatLog(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    timestamp: new Date().toISOString(),
  };
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    const logEntry = formatLog("info", message, meta);
    console.log(JSON.stringify(logEntry));
  },

  error(message: string, meta?: Record<string, unknown>): void {
    const logEntry = formatLog("error", message, meta);
    console.error(JSON.stringify(logEntry));
  },
};
