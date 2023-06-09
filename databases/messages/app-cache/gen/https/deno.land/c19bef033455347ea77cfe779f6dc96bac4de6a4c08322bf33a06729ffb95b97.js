// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { makeCallback } from "./_fs_common.ts";
import { getValidatedPath, kMaxUserId } from "../internal/fs/utils.mjs";
import * as pathModule from "../../path/mod.ts";
import { validateInteger } from "../internal/validators.mjs";
/**
 * Asynchronously changes the owner and group
 * of a file.
 */ export function chown(path, uid, gid, callback) {
    callback = makeCallback(callback);
    path = getValidatedPath(path).toString();
    validateInteger(uid, "uid", -1, kMaxUserId);
    validateInteger(gid, "gid", -1, kMaxUserId);
    Deno.chown(pathModule.toNamespacedPath(path), uid, gid).then(()=>callback(null), callback);
}
/**
 * Synchronously changes the owner and group
 * of a file.
 */ export function chownSync(path, uid, gid) {
    path = getValidatedPath(path).toString();
    validateInteger(uid, "uid", -1, kMaxUserId);
    validateInteger(gid, "gid", -1, kMaxUserId);
    Deno.chownSync(pathModule.toNamespacedPath(path), uid, gid);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvX2ZzL19mc19jaG93bi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgdHlwZSBDYWxsYmFja1dpdGhFcnJvciwgbWFrZUNhbGxiYWNrIH0gZnJvbSBcIi4vX2ZzX2NvbW1vbi50c1wiO1xuaW1wb3J0IHsgZ2V0VmFsaWRhdGVkUGF0aCwga01heFVzZXJJZCB9IGZyb20gXCIuLi9pbnRlcm5hbC9mcy91dGlscy5tanNcIjtcbmltcG9ydCAqIGFzIHBhdGhNb2R1bGUgZnJvbSBcIi4uLy4uL3BhdGgvbW9kLnRzXCI7XG5pbXBvcnQgeyB2YWxpZGF0ZUludGVnZXIgfSBmcm9tIFwiLi4vaW50ZXJuYWwvdmFsaWRhdG9ycy5tanNcIjtcblxuaW1wb3J0IHR5cGUgeyBCdWZmZXIgfSBmcm9tIFwiLi4vYnVmZmVyLnRzXCI7XG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgY2hhbmdlcyB0aGUgb3duZXIgYW5kIGdyb3VwXG4gKiBvZiBhIGZpbGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaG93bihcbiAgcGF0aDogc3RyaW5nIHwgQnVmZmVyIHwgVVJMLFxuICB1aWQ6IG51bWJlcixcbiAgZ2lkOiBudW1iZXIsXG4gIGNhbGxiYWNrOiBDYWxsYmFja1dpdGhFcnJvcixcbik6IHZvaWQge1xuICBjYWxsYmFjayA9IG1ha2VDYWxsYmFjayhjYWxsYmFjayk7XG4gIHBhdGggPSBnZXRWYWxpZGF0ZWRQYXRoKHBhdGgpLnRvU3RyaW5nKCk7XG4gIHZhbGlkYXRlSW50ZWdlcih1aWQsIFwidWlkXCIsIC0xLCBrTWF4VXNlcklkKTtcbiAgdmFsaWRhdGVJbnRlZ2VyKGdpZCwgXCJnaWRcIiwgLTEsIGtNYXhVc2VySWQpO1xuXG4gIERlbm8uY2hvd24ocGF0aE1vZHVsZS50b05hbWVzcGFjZWRQYXRoKHBhdGgpLCB1aWQsIGdpZCkudGhlbihcbiAgICAoKSA9PiBjYWxsYmFjayhudWxsKSxcbiAgICBjYWxsYmFjayxcbiAgKTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IGNoYW5nZXMgdGhlIG93bmVyIGFuZCBncm91cFxuICogb2YgYSBmaWxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hvd25TeW5jKFxuICBwYXRoOiBzdHJpbmcgfCBCdWZmZXIgfCBVUkwsXG4gIHVpZDogbnVtYmVyLFxuICBnaWQ6IG51bWJlcixcbik6IHZvaWQge1xuICBwYXRoID0gZ2V0VmFsaWRhdGVkUGF0aChwYXRoKS50b1N0cmluZygpO1xuICB2YWxpZGF0ZUludGVnZXIodWlkLCBcInVpZFwiLCAtMSwga01heFVzZXJJZCk7XG4gIHZhbGlkYXRlSW50ZWdlcihnaWQsIFwiZ2lkXCIsIC0xLCBrTWF4VXNlcklkKTtcblxuICBEZW5vLmNob3duU3luYyhwYXRoTW9kdWxlLnRvTmFtZXNwYWNlZFBhdGgocGF0aCksIHVpZCwgZ2lkKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBaUMsWUFBWSxRQUFRLGlCQUFpQixDQUFDO0FBQ3ZFLFNBQVMsZ0JBQWdCLEVBQUUsVUFBVSxRQUFRLDBCQUEwQixDQUFDO0FBQ3hFLFlBQVksVUFBVSxNQUFNLG1CQUFtQixDQUFDO0FBQ2hELFNBQVMsZUFBZSxRQUFRLDRCQUE0QixDQUFDO0FBSTdEOzs7Q0FHQyxHQUNELE9BQU8sU0FBUyxLQUFLLENBQ25CLElBQTJCLEVBQzNCLEdBQVcsRUFDWCxHQUFXLEVBQ1gsUUFBMkIsRUFDckI7SUFDTixRQUFRLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN6QyxlQUFlLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM1QyxlQUFlLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUU1QyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUMxRCxJQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFDcEIsUUFBUSxDQUNULENBQUM7QUFDSixDQUFDO0FBRUQ7OztDQUdDLEdBQ0QsT0FBTyxTQUFTLFNBQVMsQ0FDdkIsSUFBMkIsRUFDM0IsR0FBVyxFQUNYLEdBQVcsRUFDTDtJQUNOLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN6QyxlQUFlLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM1QyxlQUFlLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUU1QyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDOUQsQ0FBQyJ9