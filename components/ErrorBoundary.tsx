"use client";

import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { logger } from "@/lib/logger/otel-logger";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 text-sm underline text-muted-foreground"
      >
        Retry
      </button>
    </div>
  );
}

interface Props {
  children: React.ReactNode;
  context?: string;
  fallback?: React.ComponentType<FallbackProps>;
}

export function AppErrorBoundary({ children, context = "App", fallback }: Props) {
  return (
    <ErrorBoundary
      FallbackComponent={fallback ?? ErrorFallback}
      onError={(error, info) => {
        logger.error(
          JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: info.componentStack,
          }),
          context,
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
