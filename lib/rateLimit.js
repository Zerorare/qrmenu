/**
 * Per-table order throttle.
 *
 * A QR code on a table is a public endpoint: anyone who can see it can order,
 * including a bored child tapping "send" thirty times. This caps how many
 * tickets one table can push onto the kitchen screen in a burst, without
 * getting in the way of a large group ordering in several rounds.
 *
 * In-memory and per-process, which is right for a single venue on one server.
 * A multi-server deployment should move this to Redis or the database.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;

const hits = new Map();

export function allowOrder(key) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    return { ok: false, retryAfter };
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 500) {
    for (const [mapKey, times] of hits) {
      if (times.every((time) => now - time >= WINDOW_MS)) hits.delete(mapKey);
    }
  }

  return { ok: true };
}
