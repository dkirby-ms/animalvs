/** Expected API failure; messages must be safe to display without leaking private data. */
export class PlatformError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
  }
}
