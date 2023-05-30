// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { fromFileUrl } from "../path.ts";
/**
 * TODO: Also accept 'path' parameter as a Node polyfill Buffer type once these
 * are implemented. See https://github.com/denoland/deno/issues/3403
 * Deprecated in node api
 */ export function exists(path, callback) {
    path = path instanceof URL ? fromFileUrl(path) : path;
    Deno.lstat(path).then(()=>callback(true), ()=>callback(false));
}
/**
 * TODO: Also accept 'path' parameter as a Node polyfill Buffer or URL type once these
 * are implemented. See https://github.com/denoland/deno/issues/3403
 */ export function existsSync(path) {
    path = path instanceof URL ? fromFileUrl(path) : path;
    try {
        Deno.lstatSync(path);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvX2ZzL19mc19leGlzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IGZyb21GaWxlVXJsIH0gZnJvbSBcIi4uL3BhdGgudHNcIjtcblxudHlwZSBFeGl0c0NhbGxiYWNrID0gKGV4aXN0czogYm9vbGVhbikgPT4gdm9pZDtcblxuLyoqXG4gKiBUT0RPOiBBbHNvIGFjY2VwdCAncGF0aCcgcGFyYW1ldGVyIGFzIGEgTm9kZSBwb2x5ZmlsbCBCdWZmZXIgdHlwZSBvbmNlIHRoZXNlXG4gKiBhcmUgaW1wbGVtZW50ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZGVub2xhbmQvZGVuby9pc3N1ZXMvMzQwM1xuICogRGVwcmVjYXRlZCBpbiBub2RlIGFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RzKHBhdGg6IHN0cmluZyB8IFVSTCwgY2FsbGJhY2s6IEV4aXRzQ2FsbGJhY2spOiB2b2lkIHtcbiAgcGF0aCA9IHBhdGggaW5zdGFuY2VvZiBVUkwgPyBmcm9tRmlsZVVybChwYXRoKSA6IHBhdGg7XG4gIERlbm8ubHN0YXQocGF0aCkudGhlbigoKSA9PiBjYWxsYmFjayh0cnVlKSwgKCkgPT4gY2FsbGJhY2soZmFsc2UpKTtcbn1cblxuLyoqXG4gKiBUT0RPOiBBbHNvIGFjY2VwdCAncGF0aCcgcGFyYW1ldGVyIGFzIGEgTm9kZSBwb2x5ZmlsbCBCdWZmZXIgb3IgVVJMIHR5cGUgb25jZSB0aGVzZVxuICogYXJlIGltcGxlbWVudGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm8vaXNzdWVzLzM0MDNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4aXN0c1N5bmMocGF0aDogc3RyaW5nIHwgVVJMKTogYm9vbGVhbiB7XG4gIHBhdGggPSBwYXRoIGluc3RhbmNlb2YgVVJMID8gZnJvbUZpbGVVcmwocGF0aCkgOiBwYXRoO1xuICB0cnkge1xuICAgIERlbm8ubHN0YXRTeW5jKHBhdGgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsV0FBVyxRQUFRLFlBQVksQ0FBQztBQUl6Qzs7OztDQUlDLEdBQ0QsT0FBTyxTQUFTLE1BQU0sQ0FBQyxJQUFrQixFQUFFLFFBQXVCLEVBQVE7SUFDeEUsSUFBSSxHQUFHLElBQUksWUFBWSxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRDs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsVUFBVSxDQUFDLElBQWtCLEVBQVc7SUFDdEQsSUFBSSxHQUFHLElBQUksWUFBWSxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN0RCxJQUFJO1FBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixPQUFPLElBQUksQ0FBQztJQUNkLEVBQUUsT0FBTyxHQUFHLEVBQUU7UUFDWixJQUFJLEdBQUcsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN2QyxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxNQUFNLEdBQUcsQ0FBQztJQUNaLENBQUM7QUFDSCxDQUFDIn0=