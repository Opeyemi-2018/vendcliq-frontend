// lib/utils/generateIdempotencyKey.ts
import { randomBytes } from "crypto";

export function generateIdempotencyKey(): string {
  return randomBytes(32)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
