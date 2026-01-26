export type ServerFnResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; details?: unknown }
