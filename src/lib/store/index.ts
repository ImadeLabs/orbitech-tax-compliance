import "server-only";
import { createFileStore } from "./file";
import { createPostgresStore } from "./postgres";
import type { Store } from "./types";

const g = globalThis as unknown as { __orbitechStore?: Store };

export function getStore(): Store {
  if (!g.__orbitechStore) {
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    g.__orbitechStore = url ? createPostgresStore(url) : createFileStore();
  }
  return g.__orbitechStore;
}

export * from "./types";
