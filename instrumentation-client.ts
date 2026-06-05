export function register() {
  if (process.env.NEXT_PUBLIC_OTEL_ENABLED !== "true") return;

  try {
    const { WebTracerProvider, BatchSpanProcessor } = require("@opentelemetry/sdk-trace-web");
    const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
    const { Resource } = require("@opentelemetry/resources");
    const { ATTR_SERVICE_NAME } = require("@opentelemetry/semantic-conventions");
    const { FetchInstrumentation } = require("@opentelemetry/instrumentation-fetch");
    const { DocumentLoadInstrumentation } = require("@opentelemetry/instrumentation-document-load");
    const { registerInstrumentations } = require("@opentelemetry/instrumentation");

    const ENDPOINT = (
      process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ?? "https://ingest.vendcliq.cloud"
    ).replace(/\/+$/, "");

    const HEADERS: Record<string, string> = Object.fromEntries(
      (process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_HEADERS ?? "")
        .split(",")
        .filter(Boolean)
        .map((h) => {
          const i = h.indexOf("=");
          return i !== -1 ? [h.slice(0, i).trim(), h.slice(i + 1).trim()] : null;
        })
        .filter(Boolean),
    );

    const isProd = process.env.NODE_ENV === "production";
    const SERVICE_NAME = isProd ? "vendcliq-web" : "staging-web";

    const provider = new WebTracerProvider({
      resource: new Resource({ [ATTR_SERVICE_NAME]: SERVICE_NAME }),
    });

    provider.addSpanProcessor(
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${ENDPOINT}/v1/traces`,
          headers: HEADERS,
        }),
      ),
    );

    provider.register();

    registerInstrumentations({
      instrumentations: [
        new FetchInstrumentation({ propagateTraceHeaderCorsUrls: [/.*/] }),
        new DocumentLoadInstrumentation(),
      ],
    });
  } catch (err) {
    console.error("Client-side OTel initialization failed:", err);
  }
}
