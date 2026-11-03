import { onBeforeUnmount, ref, shallowRef } from "vue";
import { z } from "zod";
import { snapshotSchema, type Snapshot } from "../../../packages/contracts/src/index.js";
import { initializeEntra, type PlayerAuth } from "./auth.js";

const errorSchema = z.object({ error: z.object({ message: z.string() }) });

/** Live player session. Sign-out aborts all reads; reconnect always requests a fresh server snapshot. */
export function usePlayer() {
  const snapshot = shallowRef<Snapshot | null>(null);
  const error = ref("");
  const status = ref("Starting platform");
  const connected = ref(false);
  const busy = ref(false);
  const local = ref(false);
  const ready = ref(false);
  const signedIn = ref(false);
  let auth: PlayerAuth | undefined;
  let token: (() => Promise<string>) | undefined;
  let controller: AbortController | undefined;
  let generation = 0;
  let retry: ReturnType<typeof setTimeout> | undefined;

  function stop() {
    generation++;
    controller?.abort();
    clearTimeout(retry);
    controller = undefined;
    connected.value = false;
    busy.value = false;
  }

  function accept(next: Snapshot) {
    if (!snapshot.value || next.account.id !== snapshot.value.account.id ||
        next.account.revision >= snapshot.value.account.revision) snapshot.value = next;
  }

  async function fetchPrivate(path: string, init: RequestInit, signal: AbortSignal) {
    if (!token) throw new Error("Sign in before loading progress.");
    const credential = await token();
    const response = await fetch(`/api/${path}`, {
      ...init, signal, headers: { authorization: `Bearer ${credential}`, "content-type": "application/json" },
    });
    if (!response.ok) {
      const body: unknown = await response.json();
      const parsed = errorSchema.safeParse(body);
      throw new Error(parsed.success ? parsed.data.error.message : "The server returned an invalid error. Progress was not loaded.");
    }
    return response;
  }

  async function recover(current: number) {
    const active = controller;
    if (!active || current !== generation) return;
    connected.value = false;
    status.value = "Loading authoritative progress";
    try {
      const response = await fetchPrivate("snapshot", {}, active.signal);
      const state = snapshotSchema.parse(await response.json());
      if (current !== generation) return;
      accept(state);
      error.value = "";
      status.value = "Connecting live updates";
      const events = await fetchPrivate("events", {}, active.signal);
      const reader = events.body?.getReader();
      if (!reader) throw new Error("Live connection is unavailable.");
      let buffer = "";
      const decoder = new TextDecoder();
      try {
        while (current === generation) {
          const chunk = await reader.read();
          if (chunk.done) throw new Error("Live connection closed.");
          buffer += decoder.decode(chunk.value, { stream: true });
          let boundary: number;
          while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const event = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            if (event.startsWith("event: unavailable")) throw new Error("The server cannot load progress right now.");
            const line = event.split("\n").find(item => item.startsWith("data: "));
            if (event.startsWith("event: snapshot") && line) {
              const next = snapshotSchema.parse(JSON.parse(line.slice(6)));
              if (current !== generation) return;
              accept(next);
              connected.value = true;
              status.value = "Connected to server";
              error.value = "";
            }
          }
        }
      } finally {
        await reader.cancel();
        reader.releaseLock();
      }
    } catch (failure) {
      if (current !== generation || active.signal.aborted) return;
      connected.value = false;
      status.value = "Connection lost";
      error.value = `${failure instanceof Error ? failure.message : "Progress is unavailable."} Retrying from the server; shown progress may be stale.`;
      retry = setTimeout(() => { void recover(current); }, 2000);
    }
  }

  async function start(localPlayer?: string) {
    stop();
    snapshot.value = null;
    error.value = "";
    controller = new AbortController();
    if (__LOCAL_AUTH_BUILD__ && local.value && localPlayer) token = async () => `local-player-${localPlayer}`;
    else if (auth) token = auth.token;
    else throw new Error("Sign-in configuration is unavailable.");
    signedIn.value = true;
    await recover(generation);
  }

  async function initialize() {
    try {
      const response = await fetch("/api/config");
      if (!response.ok) throw new Error("Platform configuration is unavailable.");
      const config = z.object({ authMode: z.enum(["local", "entra"]) }).parse(await response.json());
      local.value = __LOCAL_AUTH_BUILD__ && config.authMode === "local";
      if (config.authMode === "local" && !local.value) throw new Error("A production browser cannot use local identity.");
      if (!local.value) auth = await initializeEntra();
      ready.value = true;
      status.value = "Signed out";
      if (auth?.signedIn) void start();
    } catch (failure) {
      error.value = failure instanceof Error ? failure.message : "Platform initialization failed.";
      status.value = "Platform unavailable";
    }
  }

  async function signIn() {
    try {
      if (!auth) throw new Error("Sign-in is unavailable.");
      await auth.signIn();
    } catch (failure) {
      error.value = failure instanceof Error ? failure.message : "Sign-in failed.";
    }
  }

  async function signOut() {
    stop();
    snapshot.value = null;
    signedIn.value = false;
    token = undefined;
    error.value = "";
    status.value = "Signed out";
    if (auth) {
      try { await auth.signOut(); }
      catch (failure) { error.value = failure instanceof Error ? failure.message : "Identity sign-out failed."; }
    }
  }

  async function saveName(displayName: string) {
    const active = controller;
    const state = snapshot.value;
    const current = generation;
    if (!active || !state || !connected.value) return;
    busy.value = true;
    try {
      await fetchPrivate("profile", {
        method: "PATCH", body: JSON.stringify({ transactionId: crypto.randomUUID(), expectedRevision: state.account.revision, displayName }),
      }, active.signal);
      const fresh = snapshotSchema.parse(await (await fetchPrivate("snapshot", {}, active.signal)).json());
      if (current === generation) { accept(fresh); error.value = ""; }
    } catch (failure) {
      if (current === generation) error.value = failure instanceof Error ? failure.message : "Display name could not be saved.";
    } finally { if (current === generation) busy.value = false; }
  }

  async function deleteAccount() {
    const active = controller;
    const current = generation;
    if (!active || !connected.value) return;
    busy.value = true;
    try {
      await fetchPrivate("account", { method: "DELETE", body: '{"confirmation":"DELETE"}' }, active.signal);
      if (current === generation) {
        await signOut();
        status.value = "Application data deleted";
      }
    } catch (failure) {
      if (current === generation) error.value = failure instanceof Error ? failure.message : "Deletion failed. Try again.";
    } finally { busy.value = false; }
  }

  onBeforeUnmount(stop);
  return { snapshot, error, status, connected, busy, local, ready, signedIn, initialize, start, signIn, signOut, saveName, deleteAccount };
}
