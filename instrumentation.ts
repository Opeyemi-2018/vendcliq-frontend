export const runtime = "nodejs";

export async function register() {
  // Only run in Node.js runtime
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.OTEL_ENABLED !== "true") return;

  try {
    const { NodeSDK } = await import("@opentelemetry/sdk-node");
    const { getNodeAutoInstrumentations } =
      await import("@opentelemetry/auto-instrumentations-node");
    const { OTLPTraceExporter } =
      await import("@opentelemetry/exporter-trace-otlp-http");
    const { OTLPMetricExporter } =
      await import("@opentelemetry/exporter-metrics-otlp-http");
    const { OTLPLogExporter } =
      await import("@opentelemetry/exporter-logs-otlp-http");
    const { PeriodicExportingMetricReader } =
      await import("@opentelemetry/sdk-metrics");
    const { BatchLogRecordProcessor } = await import("@opentelemetry/sdk-logs");

    const ENDPOINT = (
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "https://ingest.vendcliq.cloud"
    ).replace(/\/+$/, "");

    const HEADERS: Record<string, string> = Object.fromEntries(
      (process.env.OTEL_EXPORTER_OTLP_HEADERS ?? "")
        .split(",")
        .filter(Boolean)
        .map((h) => {
          const i = h.indexOf("=");
          return i !== -1
            ? [h.slice(0, i).trim(), h.slice(i + 1).trim()]
            : null;
        })
        .filter(Boolean) as [string, string][],
    );

    const isProd = process.env.NODE_ENV === "production";
    const SERVICE_NAME = isProd ? "vendcliq-web" : "staging-web";

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

    if (process.env.NEXT_RUNTIME === "nodejs") {
      process.on("SIGTERM", () => {
        sdk
          .shutdown()
          .catch((err) => console.error("OTel shutdown error", err))
          .finally(() => process.exit(0));
      });
    }
  } catch (err) {
    console.error(
      "OTel initialization failed, continuing without telemetry:",
      err,
    );
  }
}
