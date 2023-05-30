// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { deferred } from "./deferred.ts";
export class DeadlineError extends Error {
    constructor(){
        super("Deadline");
        this.name = "DeadlineError";
    }
}
/**
 * Create a promise which will be rejected with {@linkcode DeadlineError} when a given delay is exceeded.
 *
 * @example
 * ```typescript
 * import { deadline } from "https://deno.land/std@$STD_VERSION/async/deadline.ts";
 * import { delay } from "https://deno.land/std@$STD_VERSION/async/delay.ts";
 *
 * const delayedPromise = delay(1000);
 * // Below throws `DeadlineError` after 10 ms
 * const result = await deadline(delayedPromise, 10);
 * ```
 */ export function deadline(p, delay) {
    const d = deferred();
    const t = setTimeout(()=>d.reject(new DeadlineError()), delay);
    return Promise.race([
        p,
        d
    ]).finally(()=>clearTimeout(t));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3MS4wL2FzeW5jL2RlYWRsaW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGRlZmVycmVkIH0gZnJvbSBcIi4vZGVmZXJyZWQudHNcIjtcblxuZXhwb3J0IGNsYXNzIERlYWRsaW5lRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFwiRGVhZGxpbmVcIik7XG4gICAgdGhpcy5uYW1lID0gXCJEZWFkbGluZUVycm9yXCI7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBwcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aCB7QGxpbmtjb2RlIERlYWRsaW5lRXJyb3J9IHdoZW4gYSBnaXZlbiBkZWxheSBpcyBleGNlZWRlZC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgZGVhZGxpbmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9hc3luYy9kZWFkbGluZS50c1wiO1xuICogaW1wb3J0IHsgZGVsYXkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9hc3luYy9kZWxheS50c1wiO1xuICpcbiAqIGNvbnN0IGRlbGF5ZWRQcm9taXNlID0gZGVsYXkoMTAwMCk7XG4gKiAvLyBCZWxvdyB0aHJvd3MgYERlYWRsaW5lRXJyb3JgIGFmdGVyIDEwIG1zXG4gKiBjb25zdCByZXN1bHQgPSBhd2FpdCBkZWFkbGluZShkZWxheWVkUHJvbWlzZSwgMTApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWFkbGluZTxUPihwOiBQcm9taXNlPFQ+LCBkZWxheTogbnVtYmVyKTogUHJvbWlzZTxUPiB7XG4gIGNvbnN0IGQgPSBkZWZlcnJlZDxuZXZlcj4oKTtcbiAgY29uc3QgdCA9IHNldFRpbWVvdXQoKCkgPT4gZC5yZWplY3QobmV3IERlYWRsaW5lRXJyb3IoKSksIGRlbGF5KTtcbiAgcmV0dXJuIFByb21pc2UucmFjZShbcCwgZF0pLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHQpKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsUUFBUSxRQUFRLGVBQWUsQ0FBQztBQUV6QyxPQUFPLE1BQU0sYUFBYSxTQUFTLEtBQUs7SUFDdEMsYUFBYztRQUNaLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQztJQUM5QjtDQUNEO0FBRUQ7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLFFBQVEsQ0FBSSxDQUFhLEVBQUUsS0FBYSxFQUFjO0lBQ3BFLE1BQU0sQ0FBQyxHQUFHLFFBQVEsRUFBUyxBQUFDO0lBQzVCLE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxhQUFhLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxBQUFDO0lBQ2pFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQztRQUFDLENBQUM7UUFBRSxDQUFDO0tBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFNLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELENBQUMifQ==