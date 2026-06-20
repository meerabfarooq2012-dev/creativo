import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `false` during SSR and the initial client hydration render, then
 * `true` once mounted on the client.
 *
 * Implemented with `useSyncExternalStore` so the server snapshot (`false`) is
 * reused for the first client render — guaranteeing no hydration mismatch —
 * without calling `setState` inside an effect (which the
 * `react-hooks/set-state-in-effect` rule disallows).
 *
 * Use this to gate rendering of components that generate client-only IDs
 * (e.g. Radix Dialog/Sheet `aria-controls` via `useId`).
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
