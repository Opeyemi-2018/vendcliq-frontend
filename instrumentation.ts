// instrumentation.ts - NO static imports at the top!

export async function register() {
  // Only run in Node.js runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      // Dynamically import all OpenTelemetry packages only in Node.js
      const { NodeSDK } = await import("@opentelemetry/sdk-node");
      const { getNodeAutoInstrumentations } = await import("@opentelemetry/auto-instrumentations-node");
      const { OTLPTraceExporter } = await import("@opentelemetry/exporter-trace-otlp-http");
      const { OTLPMetricExporter } = await import("@opentelemetry/exporter-metrics-otlp-http");
      const { OTLPLogExporter } = await import("@opentelemetry/exporter-logs-otlp-http");
      const { PeriodicExportingMetricReader } = await import("@opentelemetry/sdk-metrics");
      const { BatchLogRecordProcessor } = await import("@opentelemetry/sdk-logs");

      const ENDPOINT = (
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "https://ingest.vendcliq.cloud"
      ).replace(/\/+$/, "");

      const HEADERS: Record<string, string> = {};
      const rawHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS ?? "";
      rawHeaders
        .split(",")
        .filter(Boolean)
        .forEach((h) => {
          const i = h.indexOf("=");
          if (i !== -1) HEADERS[h.slice(0, i).trim()] = h.slice(i + 1).trim();
        });

      const SERVICE_NAME =
        process.env.NODE_ENV === "production" ? "vendcliq-web" : "staging-web";

      const sdk = new NodeSDK({
        serviceName: SERVICE_NAME,
        traceExporter: new OTLPTraceExporter({
          url: `${ENDPOINT}/v1/traces`,
          headers: HEADERS,
        }),
        metricReader: new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({
            url: `${ENDPOINT}/v1/metrics`,
            headers: HEADERS,
          }),
          exportIntervalMillis: 60_000,
        }),
        logRecordProcessor: new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: `${ENDPOINT}/v1/logs`,
            headers: HEADERS,
          }),
        ),
        instrumentations: [
          getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-fs": { enabled: false },
          }),
        ],
      });

      sdk.start();
      console.log("✅ SigNoz OpenTelemetry initialized successfully");

      process.on("SIGTERM", () => {
        sdk.shutdown().finally(() => process.exit(0));
      });
    } catch (error) {
      console.error("Failed to initialize SigNoz instrumentation:", error);
    }
  }
}