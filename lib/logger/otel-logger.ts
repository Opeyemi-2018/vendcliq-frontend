import { logs, SeverityNumber } from "@opentelemetry/api-logs";

const otelLogger = logs.getLogger("vera-frontend");

function emit(severity: SeverityNumber, message: unknown, context?: string) {
  otelLogger.emit({
    severityNumber: severity,
    severityText: SeverityNumber[severity],
    body: typeof message === "string" ? message : JSON.stringify(message),
    attributes: { "log.context": context ?? "Application" },
  });
}

export const logger = {
  info(message: unknown, context?: string) {
    emit(SeverityNumber.INFO, message, context);
  },
  error(message: unknown, context?: string) {
    emit(SeverityNumber.ERROR, message, context);
  },
  warn(message: unknown, context?: string) {
    emit(SeverityNumber.WARN, message, context);
  },
  debug(message: unknown, context?: string) {
    emit(SeverityNumber.DEBUG, message, context);
  },
};
