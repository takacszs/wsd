// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
/** A library of assertion functions.
 *
 * This module is browser compatible, but do not rely on good formatting of
 * values for AssertionError messages in browsers.
 *
 * @module
 */ import { red, stripColor } from "../fmt/colors.ts";
import { buildMessage, diff, diffstr } from "./_diff.ts";
import { format } from "./_format.ts";
const CAN_NOT_DISPLAY = "[Cannot display]";
export class AssertionError extends Error {
    name = "AssertionError";
    constructor(message){
        super(message);
    }
}
function isKeyedCollection(x) {
    return [
        Symbol.iterator,
        "size"
    ].every((k)=>k in x);
}
/**
 * Deep equality comparison used in assertions
 * @param c actual value
 * @param d expected value
 */ export function equal(c, d) {
    const seen = new Map();
    return function compare(a, b) {
        // Have to render RegExp & Date for string comparison
        // unless it's mistreated as object
        if (a && b && (a instanceof RegExp && b instanceof RegExp || a instanceof URL && b instanceof URL)) {
            return String(a) === String(b);
        }
        if (a instanceof Date && b instanceof Date) {
            const aTime = a.getTime();
            const bTime = b.getTime();
            // Check for NaN equality manually since NaN is not
            // equal to itself.
            if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
                return true;
            }
            return aTime === bTime;
        }
        if (typeof a === "number" && typeof b === "number") {
            return Number.isNaN(a) && Number.isNaN(b) || a === b;
        }
        if (Object.is(a, b)) {
            return true;
        }
        if (a && typeof a === "object" && b && typeof b === "object") {
            if (a && b && !constructorsEqual(a, b)) {
                return false;
            }
            if (a instanceof WeakMap || b instanceof WeakMap) {
                if (!(a instanceof WeakMap && b instanceof WeakMap)) return false;
                throw new TypeError("cannot compare WeakMap instances");
            }
            if (a instanceof WeakSet || b instanceof WeakSet) {
                if (!(a instanceof WeakSet && b instanceof WeakSet)) return false;
                throw new TypeError("cannot compare WeakSet instances");
            }
            if (seen.get(a) === b) {
                return true;
            }
            if (Object.keys(a || {}).length !== Object.keys(b || {}).length) {
                return false;
            }
            seen.set(a, b);
            if (isKeyedCollection(a) && isKeyedCollection(b)) {
                if (a.size !== b.size) {
                    return false;
                }
                let unmatchedEntries = a.size;
                for (const [aKey, aValue] of a.entries()){
                    for (const [bKey, bValue] of b.entries()){
                        /* Given that Map keys can be references, we need
             * to ensure that they are also deeply equal */ if (aKey === aValue && bKey === bValue && compare(aKey, bKey) || compare(aKey, bKey) && compare(aValue, bValue)) {
                            unmatchedEntries--;
                            break;
                        }
                    }
                }
                return unmatchedEntries === 0;
            }
            const merged = {
                ...a,
                ...b
            };
            for (const key of [
                ...Object.getOwnPropertyNames(merged),
                ...Object.getOwnPropertySymbols(merged), 
            ]){
                if (!compare(a && a[key], b && b[key])) {
                    return false;
                }
                if (key in a && !(key in b) || key in b && !(key in a)) {
                    return false;
                }
            }
            if (a instanceof WeakRef || b instanceof WeakRef) {
                if (!(a instanceof WeakRef && b instanceof WeakRef)) return false;
                return compare(a.deref(), b.deref());
            }
            return true;
        }
        return false;
    }(c, d);
}
// deno-lint-ignore ban-types
function constructorsEqual(a, b) {
    return a.constructor === b.constructor || a.constructor === Object && !b.constructor || !a.constructor && b.constructor === Object;
}
/** Make an assertion, error will be thrown if `expr` does not have truthy value. */ export function assert(expr, msg = "") {
    if (!expr) {
        throw new AssertionError(msg);
    }
}
/** Make an assertion, error will be thrown if `expr` have truthy value. */ export function assertFalse(expr, msg = "") {
    if (expr) {
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that `actual` and `expected` are equal, deeply. If not
 * deeply equal, then throw.
 *
 * Type parameter can be specified to ensure values under comparison have the same type.
 * For example:
 * ```ts
 * import { assertEquals } from "./asserts.ts";
 *
 * assertEquals<number>(1, 2)
 * ```
 */ export function assertEquals(actual, expected, msg) {
    if (equal(actual, expected)) {
        return;
    }
    let message = "";
    const actualString = format(actual);
    const expectedString = format(expected);
    try {
        const stringDiff = typeof actual === "string" && typeof expected === "string";
        const diffResult = stringDiff ? diffstr(actual, expected) : diff(actualString.split("\n"), expectedString.split("\n"));
        const diffMsg = buildMessage(diffResult, {
            stringDiff
        }).join("\n");
        message = `Values are not equal:\n${diffMsg}`;
    } catch  {
        message = `\n${red(CAN_NOT_DISPLAY)} + \n\n`;
    }
    if (msg) {
        message = msg;
    }
    throw new AssertionError(message);
}
/**
 * Make an assertion that `actual` and `expected` are not equal, deeply.
 * If not then throw.
 *
 * Type parameter can be specified to ensure values under comparison have the same type.
 * For example:
 * ```ts
 * import { assertNotEquals } from "./asserts.ts";
 *
 * assertNotEquals<number>(1, 2)
 * ```
 */ export function assertNotEquals(actual, expected, msg) {
    if (!equal(actual, expected)) {
        return;
    }
    let actualString;
    let expectedString;
    try {
        actualString = String(actual);
    } catch  {
        actualString = "[Cannot display]";
    }
    try {
        expectedString = String(expected);
    } catch  {
        expectedString = "[Cannot display]";
    }
    if (!msg) {
        msg = `actual: ${actualString} expected not to be: ${expectedString}`;
    }
    throw new AssertionError(msg);
}
/**
 * Make an assertion that `actual` and `expected` are strictly equal. If
 * not then throw.
 *
 * ```ts
 * import { assertStrictEquals } from "./asserts.ts";
 *
 * assertStrictEquals(1, 2)
 * ```
 */ export function assertStrictEquals(actual, expected, msg) {
    if (Object.is(actual, expected)) {
        return;
    }
    let message;
    if (msg) {
        message = msg;
    } else {
        const actualString = format(actual);
        const expectedString = format(expected);
        if (actualString === expectedString) {
            const withOffset = actualString.split("\n").map((l)=>`    ${l}`).join("\n");
            message = `Values have the same structure but are not reference-equal:\n\n${red(withOffset)}\n`;
        } else {
            try {
                const stringDiff = typeof actual === "string" && typeof expected === "string";
                const diffResult = stringDiff ? diffstr(actual, expected) : diff(actualString.split("\n"), expectedString.split("\n"));
                const diffMsg = buildMessage(diffResult, {
                    stringDiff
                }).join("\n");
                message = `Values are not strictly equal:\n${diffMsg}`;
            } catch  {
                message = `\n${red(CAN_NOT_DISPLAY)} + \n\n`;
            }
        }
    }
    throw new AssertionError(message);
}
/**
 * Make an assertion that `actual` and `expected` are not strictly equal.
 * If the values are strictly equal then throw.
 *
 * ```ts
 * import { assertNotStrictEquals } from "./asserts.ts";
 *
 * assertNotStrictEquals(1, 1)
 * ```
 */ export function assertNotStrictEquals(actual, expected, msg) {
    if (!Object.is(actual, expected)) {
        return;
    }
    throw new AssertionError(msg ?? `Expected "actual" to be strictly unequal to: ${format(actual)}\n`);
}
/**
 * Make an assertion that `actual` and `expected` are almost equal numbers through
 * a given tolerance. It can be used to take into account IEEE-754 double-precision
 * floating-point representation limitations.
 * If the values are not almost equal then throw.
 *
 * ```ts
 * import { assertAlmostEquals, assertThrows } from "./asserts.ts";
 *
 * assertAlmostEquals(0.1, 0.2);
 *
 * // Using a custom tolerance value
 * assertAlmostEquals(0.1 + 0.2, 0.3, 1e-16);
 * assertThrows(() => assertAlmostEquals(0.1 + 0.2, 0.3, 1e-17));
 * ```
 */ export function assertAlmostEquals(actual, expected, tolerance = 1e-7, msg) {
    if (Object.is(actual, expected)) {
        return;
    }
    const delta = Math.abs(expected - actual);
    if (delta <= tolerance) {
        return;
    }
    const f = (n)=>Number.isInteger(n) ? n : n.toExponential();
    throw new AssertionError(msg ?? `actual: "${f(actual)}" expected to be close to "${f(expected)}": \
delta "${f(delta)}" is greater than "${f(tolerance)}"`);
}
/**
 * Make an assertion that `obj` is an instance of `type`.
 * If not then throw.
 */ export function assertInstanceOf(actual, expectedType, msg = "") {
    if (!msg) {
        const expectedTypeStr = expectedType.name;
        let actualTypeStr = "";
        if (actual === null) {
            actualTypeStr = "null";
        } else if (actual === undefined) {
            actualTypeStr = "undefined";
        } else if (typeof actual === "object") {
            actualTypeStr = actual.constructor?.name ?? "Object";
        } else {
            actualTypeStr = typeof actual;
        }
        if (expectedTypeStr == actualTypeStr) {
            msg = `Expected object to be an instance of "${expectedTypeStr}".`;
        } else if (actualTypeStr == "function") {
            msg = `Expected object to be an instance of "${expectedTypeStr}" but was not an instanced object.`;
        } else {
            msg = `Expected object to be an instance of "${expectedTypeStr}" but was "${actualTypeStr}".`;
        }
    }
    assert(actual instanceof expectedType, msg);
}
/**
 * Make an assertion that actual is not null or undefined.
 * If not then throw.
 */ export function assertExists(actual, msg) {
    if (actual === undefined || actual === null) {
        if (!msg) {
            msg = `actual: "${actual}" expected to not be null or undefined`;
        }
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that actual includes expected. If not
 * then throw.
 */ export function assertStringIncludes(actual, expected, msg) {
    if (!actual.includes(expected)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to contain: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that `actual` includes the `expected` values.
 * If not then an error will be thrown.
 *
 * Type parameter can be specified to ensure values under comparison have the same type.
 * For example:
 *
 * ```ts
 * import { assertArrayIncludes } from "./asserts.ts";
 *
 * assertArrayIncludes<number>([1, 2], [2])
 * ```
 */ export function assertArrayIncludes(actual, expected, msg) {
    const missing = [];
    for(let i = 0; i < expected.length; i++){
        let found = false;
        for(let j = 0; j < actual.length; j++){
            if (equal(expected[i], actual[j])) {
                found = true;
                break;
            }
        }
        if (!found) {
            missing.push(expected[i]);
        }
    }
    if (missing.length === 0) {
        return;
    }
    if (!msg) {
        msg = `actual: "${format(actual)}" expected to include: "${format(expected)}"\nmissing: ${format(missing)}`;
    }
    throw new AssertionError(msg);
}
/**
 * Make an assertion that `actual` match RegExp `expected`. If not
 * then throw.
 */ export function assertMatch(actual, expected, msg) {
    if (!expected.test(actual)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to match: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that `actual` not match RegExp `expected`. If match
 * then throw.
 */ export function assertNotMatch(actual, expected, msg) {
    if (expected.test(actual)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to not match: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that `actual` object is a subset of `expected` object, deeply.
 * If not, then throw.
 */ export function assertObjectMatch(// deno-lint-ignore no-explicit-any
actual, expected) {
    function filter(a, b) {
        const seen = new WeakMap();
        return fn(a, b);
        function fn(a, b) {
            // Prevent infinite loop with circular references with same filter
            if (seen.has(a) && seen.get(a) === b) {
                return a;
            }
            seen.set(a, b);
            // Filter keys and symbols which are present in both actual and expected
            const filtered = {};
            const entries = [
                ...Object.getOwnPropertyNames(a),
                ...Object.getOwnPropertySymbols(a), 
            ].filter((key)=>key in b).map((key)=>[
                    key,
                    a[key]
                ]);
            for (const [key, value] of entries){
                // On array references, build a filtered array and filter nested objects inside
                if (Array.isArray(value)) {
                    const subset = b[key];
                    if (Array.isArray(subset)) {
                        filtered[key] = fn({
                            ...value
                        }, {
                            ...subset
                        });
                        continue;
                    }
                } else if (value instanceof RegExp) {
                    filtered[key] = value;
                    continue;
                } else if (typeof value === "object") {
                    const subset1 = b[key];
                    if (typeof subset1 === "object" && subset1) {
                        // When both operands are maps, build a filtered map with common keys and filter nested objects inside
                        if (value instanceof Map && subset1 instanceof Map) {
                            filtered[key] = new Map([
                                ...value
                            ].filter(([k])=>subset1.has(k)).map(([k, v])=>[
                                    k,
                                    typeof v === "object" ? fn(v, subset1.get(k)) : v
                                ]));
                            continue;
                        }
                        // When both operands are set, build a filtered set with common values
                        if (value instanceof Set && subset1 instanceof Set) {
                            filtered[key] = new Set([
                                ...value
                            ].filter((v)=>subset1.has(v)));
                            continue;
                        }
                        filtered[key] = fn(value, subset1);
                        continue;
                    }
                }
                filtered[key] = value;
            }
            return filtered;
        }
    }
    return assertEquals(// get the intersection of "actual" and "expected"
    // side effect: all the instances' constructor field is "Object" now.
    filter(actual, expected), // set (nested) instances' constructor field to be "Object" without changing expected value.
    // see https://github.com/denoland/deno_std/pull/1419
    filter(expected, expected));
}
/**
 * Forcefully throws a failed assertion
 */ export function fail(msg) {
    assert(false, `Failed assertion${msg ? `: ${msg}` : "."}`);
}
/**
 * Make an assertion that `error` is an `Error`.
 * If not then an error will be thrown.
 * An error class and a string that should be included in the
 * error message can also be asserted.
 */ export function assertIsError(error, // deno-lint-ignore no-explicit-any
ErrorClass, msgIncludes, msg) {
    if (error instanceof Error === false) {
        throw new AssertionError(`Expected "error" to be an Error object.`);
    }
    if (ErrorClass && !(error instanceof ErrorClass)) {
        msg = `Expected error to be instance of "${ErrorClass.name}", but was "${typeof error === "object" ? error?.constructor?.name : "[not an object]"}"${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
    }
    if (msgIncludes && (!(error instanceof Error) || !stripColor(error.message).includes(stripColor(msgIncludes)))) {
        msg = `Expected error message to include "${msgIncludes}", but got "${error instanceof Error ? error.message : "[not an Error]"}"${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
    }
}
export function assertThrows(fn, errorClassOrCallbackOrMsg, msgIncludesOrMsg, msg) {
    // deno-lint-ignore no-explicit-any
    let ErrorClass = undefined;
    let msgIncludes = undefined;
    let errorCallback = undefined;
    let err;
    if (typeof errorClassOrCallbackOrMsg !== "string") {
        if (errorClassOrCallbackOrMsg === undefined || errorClassOrCallbackOrMsg.prototype instanceof Error || errorClassOrCallbackOrMsg.prototype === Error.prototype) {
            // deno-lint-ignore no-explicit-any
            ErrorClass = errorClassOrCallbackOrMsg;
            msgIncludes = msgIncludesOrMsg;
        } else {
            errorCallback = errorClassOrCallbackOrMsg;
            msg = msgIncludesOrMsg;
        }
    } else {
        msg = errorClassOrCallbackOrMsg;
    }
    let doesThrow = false;
    const msgToAppendToError = msg ? `: ${msg}` : ".";
    try {
        fn();
    } catch (error) {
        if (ErrorClass || errorCallback) {
            if (error instanceof Error === false) {
                throw new AssertionError("A non-Error object was thrown.");
            }
            assertIsError(error, ErrorClass, msgIncludes, msg);
            if (typeof errorCallback === "function") {
                errorCallback(error);
            }
        }
        err = error;
        doesThrow = true;
    }
    if (!doesThrow) {
        msg = `Expected function to throw${msgToAppendToError}`;
        throw new AssertionError(msg);
    }
    return err;
}
export async function assertRejects(fn, errorClassOrCallbackOrMsg, msgIncludesOrMsg, msg) {
    // deno-lint-ignore no-explicit-any
    let ErrorClass = undefined;
    let msgIncludes = undefined;
    let errorCallback = undefined;
    let err;
    if (typeof errorClassOrCallbackOrMsg !== "string") {
        if (errorClassOrCallbackOrMsg === undefined || errorClassOrCallbackOrMsg.prototype instanceof Error || errorClassOrCallbackOrMsg.prototype === Error.prototype) {
            // deno-lint-ignore no-explicit-any
            ErrorClass = errorClassOrCallbackOrMsg;
            msgIncludes = msgIncludesOrMsg;
        } else {
            errorCallback = errorClassOrCallbackOrMsg;
            msg = msgIncludesOrMsg;
        }
    } else {
        msg = errorClassOrCallbackOrMsg;
    }
    let doesThrow = false;
    let isPromiseReturned = false;
    const msgToAppendToError = msg ? `: ${msg}` : ".";
    try {
        const possiblePromise = fn();
        if (possiblePromise && typeof possiblePromise === "object" && typeof possiblePromise.then === "function") {
            isPromiseReturned = true;
            await possiblePromise;
        }
    } catch (error) {
        if (!isPromiseReturned) {
            throw new AssertionError(`Function throws when expected to reject${msgToAppendToError}`);
        }
        if (ErrorClass || errorCallback) {
            if (error instanceof Error === false) {
                throw new AssertionError("A non-Error object was rejected.");
            }
            assertIsError(error, ErrorClass, msgIncludes, msg);
            if (typeof errorCallback == "function") {
                errorCallback(error);
            }
        }
        err = error;
        doesThrow = true;
    }
    if (!doesThrow) {
        throw new AssertionError(`Expected function to reject${msgToAppendToError}`);
    }
    return err;
}
/** Use this to stub out methods that will throw when invoked. */ export function unimplemented(msg) {
    throw new AssertionError(msg || "unimplemented");
}
/** Use this to assert unreachable code. */ export function unreachable() {
    throw new AssertionError("unreachable");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE1Mi4wL3Rlc3RpbmcvYXNzZXJ0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG4vKiogQSBsaWJyYXJ5IG9mIGFzc2VydGlvbiBmdW5jdGlvbnMuXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLCBidXQgZG8gbm90IHJlbHkgb24gZ29vZCBmb3JtYXR0aW5nIG9mXG4gKiB2YWx1ZXMgZm9yIEFzc2VydGlvbkVycm9yIG1lc3NhZ2VzIGluIGJyb3dzZXJzLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyByZWQsIHN0cmlwQ29sb3IgfSBmcm9tIFwiLi4vZm10L2NvbG9ycy50c1wiO1xuaW1wb3J0IHsgYnVpbGRNZXNzYWdlLCBkaWZmLCBkaWZmc3RyIH0gZnJvbSBcIi4vX2RpZmYudHNcIjtcbmltcG9ydCB7IGZvcm1hdCB9IGZyb20gXCIuL19mb3JtYXQudHNcIjtcblxuY29uc3QgQ0FOX05PVF9ESVNQTEFZID0gXCJbQ2Fubm90IGRpc3BsYXldXCI7XG5cbmV4cG9ydCBjbGFzcyBBc3NlcnRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgb3ZlcnJpZGUgbmFtZSA9IFwiQXNzZXJ0aW9uRXJyb3JcIjtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNLZXllZENvbGxlY3Rpb24oeDogdW5rbm93bik6IHggaXMgU2V0PHVua25vd24+IHtcbiAgcmV0dXJuIFtTeW1ib2wuaXRlcmF0b3IsIFwic2l6ZVwiXS5ldmVyeSgoaykgPT4gayBpbiAoeCBhcyBTZXQ8dW5rbm93bj4pKTtcbn1cblxuLyoqXG4gKiBEZWVwIGVxdWFsaXR5IGNvbXBhcmlzb24gdXNlZCBpbiBhc3NlcnRpb25zXG4gKiBAcGFyYW0gYyBhY3R1YWwgdmFsdWVcbiAqIEBwYXJhbSBkIGV4cGVjdGVkIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbChjOiB1bmtub3duLCBkOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGNvbnN0IHNlZW4gPSBuZXcgTWFwKCk7XG4gIHJldHVybiAoZnVuY3Rpb24gY29tcGFyZShhOiB1bmtub3duLCBiOiB1bmtub3duKTogYm9vbGVhbiB7XG4gICAgLy8gSGF2ZSB0byByZW5kZXIgUmVnRXhwICYgRGF0ZSBmb3Igc3RyaW5nIGNvbXBhcmlzb25cbiAgICAvLyB1bmxlc3MgaXQncyBtaXN0cmVhdGVkIGFzIG9iamVjdFxuICAgIGlmIChcbiAgICAgIGEgJiZcbiAgICAgIGIgJiZcbiAgICAgICgoYSBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBiIGluc3RhbmNlb2YgUmVnRXhwKSB8fFxuICAgICAgICAoYSBpbnN0YW5jZW9mIFVSTCAmJiBiIGluc3RhbmNlb2YgVVJMKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBTdHJpbmcoYSkgPT09IFN0cmluZyhiKTtcbiAgICB9XG4gICAgaWYgKGEgaW5zdGFuY2VvZiBEYXRlICYmIGIgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICBjb25zdCBhVGltZSA9IGEuZ2V0VGltZSgpO1xuICAgICAgY29uc3QgYlRpbWUgPSBiLmdldFRpbWUoKTtcbiAgICAgIC8vIENoZWNrIGZvciBOYU4gZXF1YWxpdHkgbWFudWFsbHkgc2luY2UgTmFOIGlzIG5vdFxuICAgICAgLy8gZXF1YWwgdG8gaXRzZWxmLlxuICAgICAgaWYgKE51bWJlci5pc05hTihhVGltZSkgJiYgTnVtYmVyLmlzTmFOKGJUaW1lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhVGltZSA9PT0gYlRpbWU7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2YgYiA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIE51bWJlci5pc05hTihhKSAmJiBOdW1iZXIuaXNOYU4oYikgfHwgYSA9PT0gYjtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5pcyhhLCBiKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChhICYmIHR5cGVvZiBhID09PSBcIm9iamVjdFwiICYmIGIgJiYgdHlwZW9mIGIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGlmIChhICYmIGIgJiYgIWNvbnN0cnVjdG9yc0VxdWFsKGEsIGIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChhIGluc3RhbmNlb2YgV2Vha01hcCB8fCBiIGluc3RhbmNlb2YgV2Vha01hcCkge1xuICAgICAgICBpZiAoIShhIGluc3RhbmNlb2YgV2Vha01hcCAmJiBiIGluc3RhbmNlb2YgV2Vha01hcCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNhbm5vdCBjb21wYXJlIFdlYWtNYXAgaW5zdGFuY2VzXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGEgaW5zdGFuY2VvZiBXZWFrU2V0IHx8IGIgaW5zdGFuY2VvZiBXZWFrU2V0KSB7XG4gICAgICAgIGlmICghKGEgaW5zdGFuY2VvZiBXZWFrU2V0ICYmIGIgaW5zdGFuY2VvZiBXZWFrU2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY2Fubm90IGNvbXBhcmUgV2Vha1NldCBpbnN0YW5jZXNcIik7XG4gICAgICB9XG4gICAgICBpZiAoc2Vlbi5nZXQoYSkgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoT2JqZWN0LmtleXMoYSB8fCB7fSkubGVuZ3RoICE9PSBPYmplY3Qua2V5cyhiIHx8IHt9KS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgc2Vlbi5zZXQoYSwgYik7XG4gICAgICBpZiAoaXNLZXllZENvbGxlY3Rpb24oYSkgJiYgaXNLZXllZENvbGxlY3Rpb24oYikpIHtcbiAgICAgICAgaWYgKGEuc2l6ZSAhPT0gYi5zaXplKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHVubWF0Y2hlZEVudHJpZXMgPSBhLnNpemU7XG5cbiAgICAgICAgZm9yIChjb25zdCBbYUtleSwgYVZhbHVlXSBvZiBhLmVudHJpZXMoKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgW2JLZXksIGJWYWx1ZV0gb2YgYi5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIC8qIEdpdmVuIHRoYXQgTWFwIGtleXMgY2FuIGJlIHJlZmVyZW5jZXMsIHdlIG5lZWRcbiAgICAgICAgICAgICAqIHRvIGVuc3VyZSB0aGF0IHRoZXkgYXJlIGFsc28gZGVlcGx5IGVxdWFsICovXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIChhS2V5ID09PSBhVmFsdWUgJiYgYktleSA9PT0gYlZhbHVlICYmIGNvbXBhcmUoYUtleSwgYktleSkpIHx8XG4gICAgICAgICAgICAgIChjb21wYXJlKGFLZXksIGJLZXkpICYmIGNvbXBhcmUoYVZhbHVlLCBiVmFsdWUpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHVubWF0Y2hlZEVudHJpZXMtLTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVubWF0Y2hlZEVudHJpZXMgPT09IDA7XG4gICAgICB9XG4gICAgICBjb25zdCBtZXJnZWQgPSB7IC4uLmEsIC4uLmIgfTtcbiAgICAgIGZvciAoXG4gICAgICAgIGNvbnN0IGtleSBvZiBbXG4gICAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobWVyZ2VkKSxcbiAgICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG1lcmdlZCksXG4gICAgICAgIF1cbiAgICAgICkge1xuICAgICAgICB0eXBlIEtleSA9IGtleW9mIHR5cGVvZiBtZXJnZWQ7XG4gICAgICAgIGlmICghY29tcGFyZShhICYmIGFba2V5IGFzIEtleV0sIGIgJiYgYltrZXkgYXMgS2V5XSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCgoa2V5IGluIGEpICYmICghKGtleSBpbiBiKSkpIHx8ICgoa2V5IGluIGIpICYmICghKGtleSBpbiBhKSkpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYSBpbnN0YW5jZW9mIFdlYWtSZWYgfHwgYiBpbnN0YW5jZW9mIFdlYWtSZWYpIHtcbiAgICAgICAgaWYgKCEoYSBpbnN0YW5jZW9mIFdlYWtSZWYgJiYgYiBpbnN0YW5jZW9mIFdlYWtSZWYpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBjb21wYXJlKGEuZGVyZWYoKSwgYi5kZXJlZigpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pKGMsIGQpO1xufVxuXG4vLyBkZW5vLWxpbnQtaWdub3JlIGJhbi10eXBlc1xuZnVuY3Rpb24gY29uc3RydWN0b3JzRXF1YWwoYTogb2JqZWN0LCBiOiBvYmplY3QpIHtcbiAgcmV0dXJuIGEuY29uc3RydWN0b3IgPT09IGIuY29uc3RydWN0b3IgfHxcbiAgICBhLmNvbnN0cnVjdG9yID09PSBPYmplY3QgJiYgIWIuY29uc3RydWN0b3IgfHxcbiAgICAhYS5jb25zdHJ1Y3RvciAmJiBiLmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG59XG5cbi8qKiBNYWtlIGFuIGFzc2VydGlvbiwgZXJyb3Igd2lsbCBiZSB0aHJvd24gaWYgYGV4cHJgIGRvZXMgbm90IGhhdmUgdHJ1dGh5IHZhbHVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChleHByOiB1bmtub3duLCBtc2cgPSBcIlwiKTogYXNzZXJ0cyBleHByIHtcbiAgaWYgKCFleHByKSB7XG4gICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG4gIH1cbn1cblxuLyoqIE1ha2UgYW4gYXNzZXJ0aW9uLCBlcnJvciB3aWxsIGJlIHRocm93biBpZiBgZXhwcmAgaGF2ZSB0cnV0aHkgdmFsdWUuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0RmFsc2UoZXhwcjogdW5rbm93biwgbXNnID0gXCJcIik6IGFzc2VydHMgZXhwciBpcyBmYWxzZSB7XG4gIGlmIChleHByKSB7XG4gICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG4gIH1cbn1cblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIGFuZCBgZXhwZWN0ZWRgIGFyZSBlcXVhbCwgZGVlcGx5LiBJZiBub3RcbiAqIGRlZXBseSBlcXVhbCwgdGhlbiB0aHJvdy5cbiAqXG4gKiBUeXBlIHBhcmFtZXRlciBjYW4gYmUgc3BlY2lmaWVkIHRvIGVuc3VyZSB2YWx1ZXMgdW5kZXIgY29tcGFyaXNvbiBoYXZlIHRoZSBzYW1lIHR5cGUuXG4gKiBGb3IgZXhhbXBsZTpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiLi9hc3NlcnRzLnRzXCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzPG51bWJlcj4oMSwgMilcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0RXF1YWxzPFQ+KGFjdHVhbDogVCwgZXhwZWN0ZWQ6IFQsIG1zZz86IHN0cmluZyk6IHZvaWQge1xuICBpZiAoZXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IG1lc3NhZ2UgPSBcIlwiO1xuICBjb25zdCBhY3R1YWxTdHJpbmcgPSBmb3JtYXQoYWN0dWFsKTtcbiAgY29uc3QgZXhwZWN0ZWRTdHJpbmcgPSBmb3JtYXQoZXhwZWN0ZWQpO1xuICB0cnkge1xuICAgIGNvbnN0IHN0cmluZ0RpZmYgPSAodHlwZW9mIGFjdHVhbCA9PT0gXCJzdHJpbmdcIikgJiZcbiAgICAgICh0eXBlb2YgZXhwZWN0ZWQgPT09IFwic3RyaW5nXCIpO1xuICAgIGNvbnN0IGRpZmZSZXN1bHQgPSBzdHJpbmdEaWZmXG4gICAgICA/IGRpZmZzdHIoYWN0dWFsIGFzIHN0cmluZywgZXhwZWN0ZWQgYXMgc3RyaW5nKVxuICAgICAgOiBkaWZmKGFjdHVhbFN0cmluZy5zcGxpdChcIlxcblwiKSwgZXhwZWN0ZWRTdHJpbmcuc3BsaXQoXCJcXG5cIikpO1xuICAgIGNvbnN0IGRpZmZNc2cgPSBidWlsZE1lc3NhZ2UoZGlmZlJlc3VsdCwgeyBzdHJpbmdEaWZmIH0pLmpvaW4oXCJcXG5cIik7XG4gICAgbWVzc2FnZSA9IGBWYWx1ZXMgYXJlIG5vdCBlcXVhbDpcXG4ke2RpZmZNc2d9YDtcbiAgfSBjYXRjaCB7XG4gICAgbWVzc2FnZSA9IGBcXG4ke3JlZChDQU5fTk9UX0RJU1BMQVkpfSArIFxcblxcbmA7XG4gIH1cbiAgaWYgKG1zZykge1xuICAgIG1lc3NhZ2UgPSBtc2c7XG4gIH1cbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1lc3NhZ2UpO1xufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGFjdHVhbGAgYW5kIGBleHBlY3RlZGAgYXJlIG5vdCBlcXVhbCwgZGVlcGx5LlxuICogSWYgbm90IHRoZW4gdGhyb3cuXG4gKlxuICogVHlwZSBwYXJhbWV0ZXIgY2FuIGJlIHNwZWNpZmllZCB0byBlbnN1cmUgdmFsdWVzIHVuZGVyIGNvbXBhcmlzb24gaGF2ZSB0aGUgc2FtZSB0eXBlLlxuICogRm9yIGV4YW1wbGU6XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgYXNzZXJ0Tm90RXF1YWxzIH0gZnJvbSBcIi4vYXNzZXJ0cy50c1wiO1xuICpcbiAqIGFzc2VydE5vdEVxdWFsczxudW1iZXI+KDEsIDIpXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vdEVxdWFsczxUPihhY3R1YWw6IFQsIGV4cGVjdGVkOiBULCBtc2c/OiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKCFlcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgYWN0dWFsU3RyaW5nOiBzdHJpbmc7XG4gIGxldCBleHBlY3RlZFN0cmluZzogc3RyaW5nO1xuICB0cnkge1xuICAgIGFjdHVhbFN0cmluZyA9IFN0cmluZyhhY3R1YWwpO1xuICB9IGNhdGNoIHtcbiAgICBhY3R1YWxTdHJpbmcgPSBcIltDYW5ub3QgZGlzcGxheV1cIjtcbiAgfVxuICB0cnkge1xuICAgIGV4cGVjdGVkU3RyaW5nID0gU3RyaW5nKGV4cGVjdGVkKTtcbiAgfSBjYXRjaCB7XG4gICAgZXhwZWN0ZWRTdHJpbmcgPSBcIltDYW5ub3QgZGlzcGxheV1cIjtcbiAgfVxuICBpZiAoIW1zZykge1xuICAgIG1zZyA9IGBhY3R1YWw6ICR7YWN0dWFsU3RyaW5nfSBleHBlY3RlZCBub3QgdG8gYmU6ICR7ZXhwZWN0ZWRTdHJpbmd9YDtcbiAgfVxuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbn1cblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIGFuZCBgZXhwZWN0ZWRgIGFyZSBzdHJpY3RseSBlcXVhbC4gSWZcbiAqIG5vdCB0aGVuIHRocm93LlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBhc3NlcnRTdHJpY3RFcXVhbHMgfSBmcm9tIFwiLi9hc3NlcnRzLnRzXCI7XG4gKlxuICogYXNzZXJ0U3RyaWN0RXF1YWxzKDEsIDIpXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFN0cmljdEVxdWFsczxUPihcbiAgYWN0dWFsOiB1bmtub3duLFxuICBleHBlY3RlZDogVCxcbiAgbXNnPzogc3RyaW5nLFxuKTogYXNzZXJ0cyBhY3R1YWwgaXMgVCB7XG4gIGlmIChPYmplY3QuaXMoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgbWVzc2FnZTogc3RyaW5nO1xuXG4gIGlmIChtc2cpIHtcbiAgICBtZXNzYWdlID0gbXNnO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGFjdHVhbFN0cmluZyA9IGZvcm1hdChhY3R1YWwpO1xuICAgIGNvbnN0IGV4cGVjdGVkU3RyaW5nID0gZm9ybWF0KGV4cGVjdGVkKTtcblxuICAgIGlmIChhY3R1YWxTdHJpbmcgPT09IGV4cGVjdGVkU3RyaW5nKSB7XG4gICAgICBjb25zdCB3aXRoT2Zmc2V0ID0gYWN0dWFsU3RyaW5nXG4gICAgICAgIC5zcGxpdChcIlxcblwiKVxuICAgICAgICAubWFwKChsKSA9PiBgICAgICR7bH1gKVxuICAgICAgICAuam9pbihcIlxcblwiKTtcbiAgICAgIG1lc3NhZ2UgPVxuICAgICAgICBgVmFsdWVzIGhhdmUgdGhlIHNhbWUgc3RydWN0dXJlIGJ1dCBhcmUgbm90IHJlZmVyZW5jZS1lcXVhbDpcXG5cXG4ke1xuICAgICAgICAgIHJlZCh3aXRoT2Zmc2V0KVxuICAgICAgICB9XFxuYDtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3RyaW5nRGlmZiA9ICh0eXBlb2YgYWN0dWFsID09PSBcInN0cmluZ1wiKSAmJlxuICAgICAgICAgICh0eXBlb2YgZXhwZWN0ZWQgPT09IFwic3RyaW5nXCIpO1xuICAgICAgICBjb25zdCBkaWZmUmVzdWx0ID0gc3RyaW5nRGlmZlxuICAgICAgICAgID8gZGlmZnN0cihhY3R1YWwgYXMgc3RyaW5nLCBleHBlY3RlZCBhcyBzdHJpbmcpXG4gICAgICAgICAgOiBkaWZmKGFjdHVhbFN0cmluZy5zcGxpdChcIlxcblwiKSwgZXhwZWN0ZWRTdHJpbmcuc3BsaXQoXCJcXG5cIikpO1xuICAgICAgICBjb25zdCBkaWZmTXNnID0gYnVpbGRNZXNzYWdlKGRpZmZSZXN1bHQsIHsgc3RyaW5nRGlmZiB9KS5qb2luKFwiXFxuXCIpO1xuICAgICAgICBtZXNzYWdlID0gYFZhbHVlcyBhcmUgbm90IHN0cmljdGx5IGVxdWFsOlxcbiR7ZGlmZk1zZ31gO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIG1lc3NhZ2UgPSBgXFxuJHtyZWQoQ0FOX05PVF9ESVNQTEFZKX0gKyBcXG5cXG5gO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihtZXNzYWdlKTtcbn1cblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIGFuZCBgZXhwZWN0ZWRgIGFyZSBub3Qgc3RyaWN0bHkgZXF1YWwuXG4gKiBJZiB0aGUgdmFsdWVzIGFyZSBzdHJpY3RseSBlcXVhbCB0aGVuIHRocm93LlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBhc3NlcnROb3RTdHJpY3RFcXVhbHMgfSBmcm9tIFwiLi9hc3NlcnRzLnRzXCI7XG4gKlxuICogYXNzZXJ0Tm90U3RyaWN0RXF1YWxzKDEsIDEpXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vdFN0cmljdEVxdWFsczxUPihcbiAgYWN0dWFsOiBULFxuICBleHBlY3RlZDogVCxcbiAgbXNnPzogc3RyaW5nLFxuKTogdm9pZCB7XG4gIGlmICghT2JqZWN0LmlzKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKFxuICAgIG1zZyA/PyBgRXhwZWN0ZWQgXCJhY3R1YWxcIiB0byBiZSBzdHJpY3RseSB1bmVxdWFsIHRvOiAke2Zvcm1hdChhY3R1YWwpfVxcbmAsXG4gICk7XG59XG5cbi8qKlxuICogTWFrZSBhbiBhc3NlcnRpb24gdGhhdCBgYWN0dWFsYCBhbmQgYGV4cGVjdGVkYCBhcmUgYWxtb3N0IGVxdWFsIG51bWJlcnMgdGhyb3VnaFxuICogYSBnaXZlbiB0b2xlcmFuY2UuIEl0IGNhbiBiZSB1c2VkIHRvIHRha2UgaW50byBhY2NvdW50IElFRUUtNzU0IGRvdWJsZS1wcmVjaXNpb25cbiAqIGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIGxpbWl0YXRpb25zLlxuICogSWYgdGhlIHZhbHVlcyBhcmUgbm90IGFsbW9zdCBlcXVhbCB0aGVuIHRocm93LlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBhc3NlcnRBbG1vc3RFcXVhbHMsIGFzc2VydFRocm93cyB9IGZyb20gXCIuL2Fzc2VydHMudHNcIjtcbiAqXG4gKiBhc3NlcnRBbG1vc3RFcXVhbHMoMC4xLCAwLjIpO1xuICpcbiAqIC8vIFVzaW5nIGEgY3VzdG9tIHRvbGVyYW5jZSB2YWx1ZVxuICogYXNzZXJ0QWxtb3N0RXF1YWxzKDAuMSArIDAuMiwgMC4zLCAxZS0xNik7XG4gKiBhc3NlcnRUaHJvd3MoKCkgPT4gYXNzZXJ0QWxtb3N0RXF1YWxzKDAuMSArIDAuMiwgMC4zLCAxZS0xNykpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRBbG1vc3RFcXVhbHMoXG4gIGFjdHVhbDogbnVtYmVyLFxuICBleHBlY3RlZDogbnVtYmVyLFxuICB0b2xlcmFuY2UgPSAxZS03LFxuICBtc2c/OiBzdHJpbmcsXG4pIHtcbiAgaWYgKE9iamVjdC5pcyhhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBkZWx0YSA9IE1hdGguYWJzKGV4cGVjdGVkIC0gYWN0dWFsKTtcbiAgaWYgKGRlbHRhIDw9IHRvbGVyYW5jZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBmID0gKG46IG51bWJlcikgPT4gTnVtYmVyLmlzSW50ZWdlcihuKSA/IG4gOiBuLnRvRXhwb25lbnRpYWwoKTtcbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKFxuICAgIG1zZyA/P1xuICAgICAgYGFjdHVhbDogXCIke2YoYWN0dWFsKX1cIiBleHBlY3RlZCB0byBiZSBjbG9zZSB0byBcIiR7ZihleHBlY3RlZCl9XCI6IFxcXG5kZWx0YSBcIiR7ZihkZWx0YSl9XCIgaXMgZ3JlYXRlciB0aGFuIFwiJHtmKHRvbGVyYW5jZSl9XCJgLFxuICApO1xufVxuXG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxudHlwZSBBbnlDb25zdHJ1Y3RvciA9IG5ldyAoLi4uYXJnczogYW55W10pID0+IGFueTtcbnR5cGUgR2V0Q29uc3RydWN0b3JUeXBlPFQgZXh0ZW5kcyBBbnlDb25zdHJ1Y3Rvcj4gPSBUIGV4dGVuZHMgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbm5ldyAoLi4uYXJnczogYW55KSA9PiBpbmZlciBDID8gQ1xuICA6IG5ldmVyO1xuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYG9iamAgaXMgYW4gaW5zdGFuY2Ugb2YgYHR5cGVgLlxuICogSWYgbm90IHRoZW4gdGhyb3cuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRJbnN0YW5jZU9mPFQgZXh0ZW5kcyBBbnlDb25zdHJ1Y3Rvcj4oXG4gIGFjdHVhbDogdW5rbm93bixcbiAgZXhwZWN0ZWRUeXBlOiBULFxuICBtc2cgPSBcIlwiLFxuKTogYXNzZXJ0cyBhY3R1YWwgaXMgR2V0Q29uc3RydWN0b3JUeXBlPFQ+IHtcbiAgaWYgKCFtc2cpIHtcbiAgICBjb25zdCBleHBlY3RlZFR5cGVTdHIgPSBleHBlY3RlZFR5cGUubmFtZTtcblxuICAgIGxldCBhY3R1YWxUeXBlU3RyID0gXCJcIjtcbiAgICBpZiAoYWN0dWFsID09PSBudWxsKSB7XG4gICAgICBhY3R1YWxUeXBlU3RyID0gXCJudWxsXCI7XG4gICAgfSBlbHNlIGlmIChhY3R1YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWN0dWFsVHlwZVN0ciA9IFwidW5kZWZpbmVkXCI7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYWN0dWFsID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBhY3R1YWxUeXBlU3RyID0gYWN0dWFsLmNvbnN0cnVjdG9yPy5uYW1lID8/IFwiT2JqZWN0XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjdHVhbFR5cGVTdHIgPSB0eXBlb2YgYWN0dWFsO1xuICAgIH1cblxuICAgIGlmIChleHBlY3RlZFR5cGVTdHIgPT0gYWN0dWFsVHlwZVN0cikge1xuICAgICAgbXNnID0gYEV4cGVjdGVkIG9iamVjdCB0byBiZSBhbiBpbnN0YW5jZSBvZiBcIiR7ZXhwZWN0ZWRUeXBlU3RyfVwiLmA7XG4gICAgfSBlbHNlIGlmIChhY3R1YWxUeXBlU3RyID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgbXNnID1cbiAgICAgICAgYEV4cGVjdGVkIG9iamVjdCB0byBiZSBhbiBpbnN0YW5jZSBvZiBcIiR7ZXhwZWN0ZWRUeXBlU3RyfVwiIGJ1dCB3YXMgbm90IGFuIGluc3RhbmNlZCBvYmplY3QuYDtcbiAgICB9IGVsc2Uge1xuICAgICAgbXNnID1cbiAgICAgICAgYEV4cGVjdGVkIG9iamVjdCB0byBiZSBhbiBpbnN0YW5jZSBvZiBcIiR7ZXhwZWN0ZWRUeXBlU3RyfVwiIGJ1dCB3YXMgXCIke2FjdHVhbFR5cGVTdHJ9XCIuYDtcbiAgICB9XG4gIH1cbiAgYXNzZXJ0KGFjdHVhbCBpbnN0YW5jZW9mIGV4cGVjdGVkVHlwZSwgbXNnKTtcbn1cblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGFjdHVhbCBpcyBub3QgbnVsbCBvciB1bmRlZmluZWQuXG4gKiBJZiBub3QgdGhlbiB0aHJvdy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEV4aXN0czxUPihcbiAgYWN0dWFsOiBULFxuICBtc2c/OiBzdHJpbmcsXG4pOiBhc3NlcnRzIGFjdHVhbCBpcyBOb25OdWxsYWJsZTxUPiB7XG4gIGlmIChhY3R1YWwgPT09IHVuZGVmaW5lZCB8fCBhY3R1YWwgPT09IG51bGwpIHtcbiAgICBpZiAoIW1zZykge1xuICAgICAgbXNnID0gYGFjdHVhbDogXCIke2FjdHVhbH1cIiBleHBlY3RlZCB0byBub3QgYmUgbnVsbCBvciB1bmRlZmluZWRgO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYWN0dWFsIGluY2x1ZGVzIGV4cGVjdGVkLiBJZiBub3RcbiAqIHRoZW4gdGhyb3cuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRTdHJpbmdJbmNsdWRlcyhcbiAgYWN0dWFsOiBzdHJpbmcsXG4gIGV4cGVjdGVkOiBzdHJpbmcsXG4gIG1zZz86IHN0cmluZyxcbik6IHZvaWQge1xuICBpZiAoIWFjdHVhbC5pbmNsdWRlcyhleHBlY3RlZCkpIHtcbiAgICBpZiAoIW1zZykge1xuICAgICAgbXNnID0gYGFjdHVhbDogXCIke2FjdHVhbH1cIiBleHBlY3RlZCB0byBjb250YWluOiBcIiR7ZXhwZWN0ZWR9XCJgO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGFjdHVhbGAgaW5jbHVkZXMgdGhlIGBleHBlY3RlZGAgdmFsdWVzLlxuICogSWYgbm90IHRoZW4gYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gKlxuICogVHlwZSBwYXJhbWV0ZXIgY2FuIGJlIHNwZWNpZmllZCB0byBlbnN1cmUgdmFsdWVzIHVuZGVyIGNvbXBhcmlzb24gaGF2ZSB0aGUgc2FtZSB0eXBlLlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGFzc2VydEFycmF5SW5jbHVkZXMgfSBmcm9tIFwiLi9hc3NlcnRzLnRzXCI7XG4gKlxuICogYXNzZXJ0QXJyYXlJbmNsdWRlczxudW1iZXI+KFsxLCAyXSwgWzJdKVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRBcnJheUluY2x1ZGVzPFQ+KFxuICBhY3R1YWw6IEFycmF5TGlrZTxUPixcbiAgZXhwZWN0ZWQ6IEFycmF5TGlrZTxUPixcbiAgbXNnPzogc3RyaW5nLFxuKTogdm9pZCB7XG4gIGNvbnN0IG1pc3Npbmc6IHVua25vd25bXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBhY3R1YWwubGVuZ3RoOyBqKyspIHtcbiAgICAgIGlmIChlcXVhbChleHBlY3RlZFtpXSwgYWN0dWFsW2pdKSkge1xuICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWZvdW5kKSB7XG4gICAgICBtaXNzaW5nLnB1c2goZXhwZWN0ZWRbaV0pO1xuICAgIH1cbiAgfVxuICBpZiAobWlzc2luZy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKCFtc2cpIHtcbiAgICBtc2cgPSBgYWN0dWFsOiBcIiR7Zm9ybWF0KGFjdHVhbCl9XCIgZXhwZWN0ZWQgdG8gaW5jbHVkZTogXCIke1xuICAgICAgZm9ybWF0KGV4cGVjdGVkKVxuICAgIH1cIlxcbm1pc3Npbmc6ICR7Zm9ybWF0KG1pc3NpbmcpfWA7XG4gIH1cbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG59XG5cbi8qKlxuICogTWFrZSBhbiBhc3NlcnRpb24gdGhhdCBgYWN0dWFsYCBtYXRjaCBSZWdFeHAgYGV4cGVjdGVkYC4gSWYgbm90XG4gKiB0aGVuIHRocm93LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0TWF0Y2goXG4gIGFjdHVhbDogc3RyaW5nLFxuICBleHBlY3RlZDogUmVnRXhwLFxuICBtc2c/OiBzdHJpbmcsXG4pOiB2b2lkIHtcbiAgaWYgKCFleHBlY3RlZC50ZXN0KGFjdHVhbCkpIHtcbiAgICBpZiAoIW1zZykge1xuICAgICAgbXNnID0gYGFjdHVhbDogXCIke2FjdHVhbH1cIiBleHBlY3RlZCB0byBtYXRjaDogXCIke2V4cGVjdGVkfVwiYDtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG4gIH1cbn1cblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIG5vdCBtYXRjaCBSZWdFeHAgYGV4cGVjdGVkYC4gSWYgbWF0Y2hcbiAqIHRoZW4gdGhyb3cuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb3RNYXRjaChcbiAgYWN0dWFsOiBzdHJpbmcsXG4gIGV4cGVjdGVkOiBSZWdFeHAsXG4gIG1zZz86IHN0cmluZyxcbik6IHZvaWQge1xuICBpZiAoZXhwZWN0ZWQudGVzdChhY3R1YWwpKSB7XG4gICAgaWYgKCFtc2cpIHtcbiAgICAgIG1zZyA9IGBhY3R1YWw6IFwiJHthY3R1YWx9XCIgZXhwZWN0ZWQgdG8gbm90IG1hdGNoOiBcIiR7ZXhwZWN0ZWR9XCJgO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGFjdHVhbGAgb2JqZWN0IGlzIGEgc3Vic2V0IG9mIGBleHBlY3RlZGAgb2JqZWN0LCBkZWVwbHkuXG4gKiBJZiBub3QsIHRoZW4gdGhyb3cuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRPYmplY3RNYXRjaChcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgYWN0dWFsOiBSZWNvcmQ8UHJvcGVydHlLZXksIGFueT4sXG4gIGV4cGVjdGVkOiBSZWNvcmQ8UHJvcGVydHlLZXksIHVua25vd24+LFxuKTogdm9pZCB7XG4gIHR5cGUgbG9vc2UgPSBSZWNvcmQ8UHJvcGVydHlLZXksIHVua25vd24+O1xuXG4gIGZ1bmN0aW9uIGZpbHRlcihhOiBsb29zZSwgYjogbG9vc2UpIHtcbiAgICBjb25zdCBzZWVuID0gbmV3IFdlYWtNYXAoKTtcbiAgICByZXR1cm4gZm4oYSwgYik7XG5cbiAgICBmdW5jdGlvbiBmbihhOiBsb29zZSwgYjogbG9vc2UpOiBsb29zZSB7XG4gICAgICAvLyBQcmV2ZW50IGluZmluaXRlIGxvb3Agd2l0aCBjaXJjdWxhciByZWZlcmVuY2VzIHdpdGggc2FtZSBmaWx0ZXJcbiAgICAgIGlmICgoc2Vlbi5oYXMoYSkpICYmIChzZWVuLmdldChhKSA9PT0gYikpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgICB9XG4gICAgICBzZWVuLnNldChhLCBiKTtcbiAgICAgIC8vIEZpbHRlciBrZXlzIGFuZCBzeW1ib2xzIHdoaWNoIGFyZSBwcmVzZW50IGluIGJvdGggYWN0dWFsIGFuZCBleHBlY3RlZFxuICAgICAgY29uc3QgZmlsdGVyZWQgPSB7fSBhcyBsb29zZTtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBbXG4gICAgICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGEpLFxuICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGEpLFxuICAgICAgXVxuICAgICAgICAuZmlsdGVyKChrZXkpID0+IGtleSBpbiBiKVxuICAgICAgICAubWFwKChrZXkpID0+IFtrZXksIGFba2V5IGFzIHN0cmluZ11dKSBhcyBBcnJheTxbc3RyaW5nLCB1bmtub3duXT47XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIC8vIE9uIGFycmF5IHJlZmVyZW5jZXMsIGJ1aWxkIGEgZmlsdGVyZWQgYXJyYXkgYW5kIGZpbHRlciBuZXN0ZWQgb2JqZWN0cyBpbnNpZGVcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgY29uc3Qgc3Vic2V0ID0gKGIgYXMgbG9vc2UpW2tleV07XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc3Vic2V0KSkge1xuICAgICAgICAgICAgZmlsdGVyZWRba2V5XSA9IGZuKHsgLi4udmFsdWUgfSwgeyAuLi5zdWJzZXQgfSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gLy8gT24gcmVnZXhwIHJlZmVyZW5jZXMsIGtlZXAgdmFsdWUgYXMgaXQgdG8gYXZvaWQgbG9vc2luZyBwYXR0ZXJuIGFuZCBmbGFnc1xuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICAgIGZpbHRlcmVkW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSAvLyBPbiBuZXN0ZWQgb2JqZWN0cyByZWZlcmVuY2VzLCBidWlsZCBhIGZpbHRlcmVkIG9iamVjdCByZWN1cnNpdmVseVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICBjb25zdCBzdWJzZXQgPSAoYiBhcyBsb29zZSlba2V5XTtcbiAgICAgICAgICBpZiAoKHR5cGVvZiBzdWJzZXQgPT09IFwib2JqZWN0XCIpICYmIChzdWJzZXQpKSB7XG4gICAgICAgICAgICAvLyBXaGVuIGJvdGggb3BlcmFuZHMgYXJlIG1hcHMsIGJ1aWxkIGEgZmlsdGVyZWQgbWFwIHdpdGggY29tbW9uIGtleXMgYW5kIGZpbHRlciBuZXN0ZWQgb2JqZWN0cyBpbnNpZGVcbiAgICAgICAgICAgIGlmICgodmFsdWUgaW5zdGFuY2VvZiBNYXApICYmIChzdWJzZXQgaW5zdGFuY2VvZiBNYXApKSB7XG4gICAgICAgICAgICAgIGZpbHRlcmVkW2tleV0gPSBuZXcgTWFwKFxuICAgICAgICAgICAgICAgIFsuLi52YWx1ZV0uZmlsdGVyKChba10pID0+IHN1YnNldC5oYXMoaykpLm1hcCgoXG4gICAgICAgICAgICAgICAgICBbaywgdl0sXG4gICAgICAgICAgICAgICAgKSA9PiBbaywgdHlwZW9mIHYgPT09IFwib2JqZWN0XCIgPyBmbih2LCBzdWJzZXQuZ2V0KGspKSA6IHZdKSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBXaGVuIGJvdGggb3BlcmFuZHMgYXJlIHNldCwgYnVpbGQgYSBmaWx0ZXJlZCBzZXQgd2l0aCBjb21tb24gdmFsdWVzXG4gICAgICAgICAgICBpZiAoKHZhbHVlIGluc3RhbmNlb2YgU2V0KSAmJiAoc3Vic2V0IGluc3RhbmNlb2YgU2V0KSkge1xuICAgICAgICAgICAgICBmaWx0ZXJlZFtrZXldID0gbmV3IFNldChbLi4udmFsdWVdLmZpbHRlcigodikgPT4gc3Vic2V0Lmhhcyh2KSkpO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbHRlcmVkW2tleV0gPSBmbih2YWx1ZSBhcyBsb29zZSwgc3Vic2V0IGFzIGxvb3NlKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWx0ZXJlZFtrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBhc3NlcnRFcXVhbHMoXG4gICAgLy8gZ2V0IHRoZSBpbnRlcnNlY3Rpb24gb2YgXCJhY3R1YWxcIiBhbmQgXCJleHBlY3RlZFwiXG4gICAgLy8gc2lkZSBlZmZlY3Q6IGFsbCB0aGUgaW5zdGFuY2VzJyBjb25zdHJ1Y3RvciBmaWVsZCBpcyBcIk9iamVjdFwiIG5vdy5cbiAgICBmaWx0ZXIoYWN0dWFsLCBleHBlY3RlZCksXG4gICAgLy8gc2V0IChuZXN0ZWQpIGluc3RhbmNlcycgY29uc3RydWN0b3IgZmllbGQgdG8gYmUgXCJPYmplY3RcIiB3aXRob3V0IGNoYW5naW5nIGV4cGVjdGVkIHZhbHVlLlxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZGVub2xhbmQvZGVub19zdGQvcHVsbC8xNDE5XG4gICAgZmlsdGVyKGV4cGVjdGVkLCBleHBlY3RlZCksXG4gICk7XG59XG5cbi8qKlxuICogRm9yY2VmdWxseSB0aHJvd3MgYSBmYWlsZWQgYXNzZXJ0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmYWlsKG1zZz86IHN0cmluZyk6IG5ldmVyIHtcbiAgYXNzZXJ0KGZhbHNlLCBgRmFpbGVkIGFzc2VydGlvbiR7bXNnID8gYDogJHttc2d9YCA6IFwiLlwifWApO1xufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGVycm9yYCBpcyBhbiBgRXJyb3JgLlxuICogSWYgbm90IHRoZW4gYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gKiBBbiBlcnJvciBjbGFzcyBhbmQgYSBzdHJpbmcgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlXG4gKiBlcnJvciBtZXNzYWdlIGNhbiBhbHNvIGJlIGFzc2VydGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0SXNFcnJvcjxFIGV4dGVuZHMgRXJyb3IgPSBFcnJvcj4oXG4gIGVycm9yOiB1bmtub3duLFxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBFcnJvckNsYXNzPzogbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRSxcbiAgbXNnSW5jbHVkZXM/OiBzdHJpbmcsXG4gIG1zZz86IHN0cmluZyxcbik6IGFzc2VydHMgZXJyb3IgaXMgRSB7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yID09PSBmYWxzZSkge1xuICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihgRXhwZWN0ZWQgXCJlcnJvclwiIHRvIGJlIGFuIEVycm9yIG9iamVjdC5gKTtcbiAgfVxuICBpZiAoRXJyb3JDbGFzcyAmJiAhKGVycm9yIGluc3RhbmNlb2YgRXJyb3JDbGFzcykpIHtcbiAgICBtc2cgPSBgRXhwZWN0ZWQgZXJyb3IgdG8gYmUgaW5zdGFuY2Ugb2YgXCIke0Vycm9yQ2xhc3MubmFtZX1cIiwgYnV0IHdhcyBcIiR7XG4gICAgICB0eXBlb2YgZXJyb3IgPT09IFwib2JqZWN0XCIgPyBlcnJvcj8uY29uc3RydWN0b3I/Lm5hbWUgOiBcIltub3QgYW4gb2JqZWN0XVwiXG4gICAgfVwiJHttc2cgPyBgOiAke21zZ31gIDogXCIuXCJ9YDtcbiAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbiAgfVxuICBpZiAoXG4gICAgbXNnSW5jbHVkZXMgJiYgKCEoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikgfHxcbiAgICAgICFzdHJpcENvbG9yKGVycm9yLm1lc3NhZ2UpLmluY2x1ZGVzKHN0cmlwQ29sb3IobXNnSW5jbHVkZXMpKSlcbiAgKSB7XG4gICAgbXNnID0gYEV4cGVjdGVkIGVycm9yIG1lc3NhZ2UgdG8gaW5jbHVkZSBcIiR7bXNnSW5jbHVkZXN9XCIsIGJ1dCBnb3QgXCIke1xuICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIltub3QgYW4gRXJyb3JdXCJcbiAgICB9XCIke21zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIn1gO1xuICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihtc2cpO1xuICB9XG59XG5cbi8qKiBFeGVjdXRlcyBhIGZ1bmN0aW9uLCBleHBlY3RpbmcgaXQgdG8gdGhyb3cuIElmIGl0IGRvZXMgbm90LCB0aGVuIGl0XG4gKiB0aHJvd3MuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VGhyb3dzKFxuICBmbjogKCkgPT4gdW5rbm93bixcbiAgbXNnPzogc3RyaW5nLFxuKTogdW5rbm93bjtcbi8qKiBFeGVjdXRlcyBhIGZ1bmN0aW9uLCBleHBlY3RpbmcgaXQgdG8gdGhyb3cuIElmIGl0IGRvZXMgbm90LCB0aGVuIGl0XG4gKiB0aHJvd3MuIEFuIGVycm9yIGNsYXNzIGFuZCBhIHN0cmluZyB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCBpbiB0aGVcbiAqIGVycm9yIG1lc3NhZ2UgY2FuIGFsc28gYmUgYXNzZXJ0ZWQuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VGhyb3dzPEUgZXh0ZW5kcyBFcnJvciA9IEVycm9yPihcbiAgZm46ICgpID0+IHVua25vd24sXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIEVycm9yQ2xhc3M6IG5ldyAoLi4uYXJnczogYW55W10pID0+IEUsXG4gIG1zZ0luY2x1ZGVzPzogc3RyaW5nLFxuICBtc2c/OiBzdHJpbmcsXG4pOiBFO1xuLyoqIEBkZXByZWNhdGVkIFVzZSBhc3NlcnRUaHJvd3MoZm4sIG1zZykgaW5zdGVhZCwgd2hpY2ggbm93IHJldHVybnMgdGhyb3duXG4gKiB2YWx1ZSBhbmQgeW91IGNhbiBhc3NlcnQgb24gaXQuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VGhyb3dzKFxuICBmbjogKCkgPT4gdW5rbm93bixcbiAgZXJyb3JDYWxsYmFjazogKGU6IEVycm9yKSA9PiB1bmtub3duLFxuICBtc2c/OiBzdHJpbmcsXG4pOiBFcnJvcjtcbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRUaHJvd3M8RSBleHRlbmRzIEVycm9yID0gRXJyb3I+KFxuICBmbjogKCkgPT4gdW5rbm93bixcbiAgZXJyb3JDbGFzc09yQ2FsbGJhY2tPck1zZz86XG4gICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICB8IChuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBFKVxuICAgIHwgKChlOiBFcnJvcikgPT4gdW5rbm93bilcbiAgICB8IHN0cmluZyxcbiAgbXNnSW5jbHVkZXNPck1zZz86IHN0cmluZyxcbiAgbXNnPzogc3RyaW5nLFxuKTogRSB8IEVycm9yIHwgdW5rbm93biB7XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGxldCBFcnJvckNsYXNzOiAobmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBtc2dJbmNsdWRlczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBsZXQgZXJyb3JDYWxsYmFjazogKChlOiBFcnJvcikgPT4gdW5rbm93bikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBlcnI7XG5cbiAgaWYgKHR5cGVvZiBlcnJvckNsYXNzT3JDYWxsYmFja09yTXNnICE9PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKFxuICAgICAgZXJyb3JDbGFzc09yQ2FsbGJhY2tPck1zZyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICBlcnJvckNsYXNzT3JDYWxsYmFja09yTXNnLnByb3RvdHlwZSBpbnN0YW5jZW9mIEVycm9yIHx8XG4gICAgICBlcnJvckNsYXNzT3JDYWxsYmFja09yTXNnLnByb3RvdHlwZSA9PT0gRXJyb3IucHJvdG90eXBlXG4gICAgKSB7XG4gICAgICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAgICAgRXJyb3JDbGFzcyA9IGVycm9yQ2xhc3NPckNhbGxiYWNrT3JNc2cgYXMgbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRTtcbiAgICAgIG1zZ0luY2x1ZGVzID0gbXNnSW5jbHVkZXNPck1zZztcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JDYWxsYmFjayA9IGVycm9yQ2xhc3NPckNhbGxiYWNrT3JNc2cgYXMgKGU6IEVycm9yKSA9PiB1bmtub3duO1xuICAgICAgbXNnID0gbXNnSW5jbHVkZXNPck1zZztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbXNnID0gZXJyb3JDbGFzc09yQ2FsbGJhY2tPck1zZztcbiAgfVxuICBsZXQgZG9lc1Rocm93ID0gZmFsc2U7XG4gIGNvbnN0IG1zZ1RvQXBwZW5kVG9FcnJvciA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgdHJ5IHtcbiAgICBmbigpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChFcnJvckNsYXNzIHx8IGVycm9yQ2FsbGJhY2spIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yID09PSBmYWxzZSkge1xuICAgICAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IoXCJBIG5vbi1FcnJvciBvYmplY3Qgd2FzIHRocm93bi5cIik7XG4gICAgICB9XG4gICAgICBhc3NlcnRJc0Vycm9yKFxuICAgICAgICBlcnJvcixcbiAgICAgICAgRXJyb3JDbGFzcyxcbiAgICAgICAgbXNnSW5jbHVkZXMsXG4gICAgICAgIG1zZyxcbiAgICAgICk7XG4gICAgICBpZiAodHlwZW9mIGVycm9yQ2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBlcnJvckNhbGxiYWNrKGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXJyID0gZXJyb3I7XG4gICAgZG9lc1Rocm93ID0gdHJ1ZTtcbiAgfVxuICBpZiAoIWRvZXNUaHJvdykge1xuICAgIG1zZyA9IGBFeHBlY3RlZCBmdW5jdGlvbiB0byB0aHJvdyR7bXNnVG9BcHBlbmRUb0Vycm9yfWA7XG4gICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG4gIH1cbiAgcmV0dXJuIGVycjtcbn1cblxuLyoqIEV4ZWN1dGVzIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHByb21pc2UsIGV4cGVjdGluZyBpdCB0byByZWplY3QuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0UmVqZWN0cyhcbiAgZm46ICgpID0+IFByb21pc2VMaWtlPHVua25vd24+LFxuICBtc2c/OiBzdHJpbmcsXG4pOiBQcm9taXNlPHVua25vd24+O1xuLyoqIEV4ZWN1dGVzIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHByb21pc2UsIGV4cGVjdGluZyBpdCB0byByZWplY3QuXG4gKiBJZiBpdCBkb2VzIG5vdCwgdGhlbiBpdCB0aHJvd3MuIEFuIGVycm9yIGNsYXNzIGFuZCBhIHN0cmluZyB0aGF0IHNob3VsZCBiZVxuICogaW5jbHVkZWQgaW4gdGhlIGVycm9yIG1lc3NhZ2UgY2FuIGFsc28gYmUgYXNzZXJ0ZWQuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0UmVqZWN0czxFIGV4dGVuZHMgRXJyb3IgPSBFcnJvcj4oXG4gIGZuOiAoKSA9PiBQcm9taXNlTGlrZTx1bmtub3duPixcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgRXJyb3JDbGFzczogbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRSxcbiAgbXNnSW5jbHVkZXM/OiBzdHJpbmcsXG4gIG1zZz86IHN0cmluZyxcbik6IFByb21pc2U8RT47XG4vKiogQGRlcHJlY2F0ZWQgVXNlIGFzc2VydFJlamVjdHMoZm4sIG1zZykgaW5zdGVhZCwgd2hpY2ggbm93IHJldHVybnMgcmVqZWN0ZWQgdmFsdWVcbiAqIGFuZCB5b3UgY2FuIGFzc2VydCBvbiBpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRSZWplY3RzKFxuICBmbjogKCkgPT4gUHJvbWlzZUxpa2U8dW5rbm93bj4sXG4gIGVycm9yQ2FsbGJhY2s6IChlOiBFcnJvcikgPT4gdW5rbm93bixcbiAgbXNnPzogc3RyaW5nLFxuKTogUHJvbWlzZTxFcnJvcj47XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNzZXJ0UmVqZWN0czxFIGV4dGVuZHMgRXJyb3IgPSBFcnJvcj4oXG4gIGZuOiAoKSA9PiBQcm9taXNlTGlrZTx1bmtub3duPixcbiAgZXJyb3JDbGFzc09yQ2FsbGJhY2tPck1zZz86XG4gICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICB8IChuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBFKVxuICAgIHwgKChlOiBFcnJvcikgPT4gdW5rbm93bilcbiAgICB8IHN0cmluZyxcbiAgbXNnSW5jbHVkZXNPck1zZz86IHN0cmluZyxcbiAgbXNnPzogc3RyaW5nLFxuKTogUHJvbWlzZTxFIHwgRXJyb3IgfCB1bmtub3duPiB7XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGxldCBFcnJvckNsYXNzOiAobmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBtc2dJbmNsdWRlczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBsZXQgZXJyb3JDYWxsYmFjazogKChlOiBFcnJvcikgPT4gdW5rbm93bikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBlcnI7XG5cbiAgaWYgKHR5cGVvZiBlcnJvckNsYXNzT3JDYWxsYmFja09yTXNnICE9PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKFxuICAgICAgZXJyb3JDbGFzc09yQ2FsbGJhY2tPck1zZyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICBlcnJvckNsYXNzT3JDYWxsYmFja09yTXNnLnByb3RvdHlwZSBpbnN0YW5jZW9mIEVycm9yIHx8XG4gICAgICBlcnJvckNsYXNzT3JDYWxsYmFja09yTXNnLnByb3RvdHlwZSA9PT0gRXJyb3IucHJvdG90eXBlXG4gICAgKSB7XG4gICAgICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAgICAgRXJyb3JDbGFzcyA9IGVycm9yQ2xhc3NPckNhbGxiYWNrT3JNc2cgYXMgbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRTtcbiAgICAgIG1zZ0luY2x1ZGVzID0gbXNnSW5jbHVkZXNPck1zZztcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JDYWxsYmFjayA9IGVycm9yQ2xhc3NPckNhbGxiYWNrT3JNc2cgYXMgKGU6IEVycm9yKSA9PiB1bmtub3duO1xuICAgICAgbXNnID0gbXNnSW5jbHVkZXNPck1zZztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbXNnID0gZXJyb3JDbGFzc09yQ2FsbGJhY2tPck1zZztcbiAgfVxuICBsZXQgZG9lc1Rocm93ID0gZmFsc2U7XG4gIGxldCBpc1Byb21pc2VSZXR1cm5lZCA9IGZhbHNlO1xuICBjb25zdCBtc2dUb0FwcGVuZFRvRXJyb3IgPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIHRyeSB7XG4gICAgY29uc3QgcG9zc2libGVQcm9taXNlID0gZm4oKTtcbiAgICBpZiAoXG4gICAgICBwb3NzaWJsZVByb21pc2UgJiZcbiAgICAgIHR5cGVvZiBwb3NzaWJsZVByb21pc2UgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgIHR5cGVvZiBwb3NzaWJsZVByb21pc2UudGhlbiA9PT0gXCJmdW5jdGlvblwiXG4gICAgKSB7XG4gICAgICBpc1Byb21pc2VSZXR1cm5lZCA9IHRydWU7XG4gICAgICBhd2FpdCBwb3NzaWJsZVByb21pc2U7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmICghaXNQcm9taXNlUmV0dXJuZWQpIHtcbiAgICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihcbiAgICAgICAgYEZ1bmN0aW9uIHRocm93cyB3aGVuIGV4cGVjdGVkIHRvIHJlamVjdCR7bXNnVG9BcHBlbmRUb0Vycm9yfWAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoRXJyb3JDbGFzcyB8fCBlcnJvckNhbGxiYWNrKSB7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKFwiQSBub24tRXJyb3Igb2JqZWN0IHdhcyByZWplY3RlZC5cIik7XG4gICAgICB9XG4gICAgICBhc3NlcnRJc0Vycm9yKFxuICAgICAgICBlcnJvcixcbiAgICAgICAgRXJyb3JDbGFzcyxcbiAgICAgICAgbXNnSW5jbHVkZXMsXG4gICAgICAgIG1zZyxcbiAgICAgICk7XG4gICAgICBpZiAodHlwZW9mIGVycm9yQ2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGVycm9yQ2FsbGJhY2soZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgICBlcnIgPSBlcnJvcjtcbiAgICBkb2VzVGhyb3cgPSB0cnVlO1xuICB9XG4gIGlmICghZG9lc1Rocm93KSB7XG4gICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKFxuICAgICAgYEV4cGVjdGVkIGZ1bmN0aW9uIHRvIHJlamVjdCR7bXNnVG9BcHBlbmRUb0Vycm9yfWAsXG4gICAgKTtcbiAgfVxuICByZXR1cm4gZXJyO1xufVxuXG4vKiogVXNlIHRoaXMgdG8gc3R1YiBvdXQgbWV0aG9kcyB0aGF0IHdpbGwgdGhyb3cgd2hlbiBpbnZva2VkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaW1wbGVtZW50ZWQobXNnPzogc3RyaW5nKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnIHx8IFwidW5pbXBsZW1lbnRlZFwiKTtcbn1cblxuLyoqIFVzZSB0aGlzIHRvIGFzc2VydCB1bnJlYWNoYWJsZSBjb2RlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVucmVhY2hhYmxlKCk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKFwidW5yZWFjaGFibGVcIik7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFOzs7Ozs7Q0FNQyxHQUVELFNBQVMsR0FBRyxFQUFFLFVBQVUsUUFBUSxrQkFBa0IsQ0FBQztBQUNuRCxTQUFTLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxRQUFRLFlBQVksQ0FBQztBQUN6RCxTQUFTLE1BQU0sUUFBUSxjQUFjLENBQUM7QUFFdEMsTUFBTSxlQUFlLEdBQUcsa0JBQWtCLEFBQUM7QUFFM0MsT0FBTyxNQUFNLGNBQWMsU0FBUyxLQUFLO0lBQ3ZDLEFBQVMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO0lBQ2pDLFlBQVksT0FBZSxDQUFFO1FBQzNCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqQjtDQUNEO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxDQUFVLEVBQXFCO0lBQ3hELE9BQU87UUFBQyxNQUFNLENBQUMsUUFBUTtRQUFFLE1BQU07S0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBSyxDQUFDLElBQUssQ0FBQyxBQUFpQixDQUFDLENBQUM7QUFDMUUsQ0FBQztBQUVEOzs7O0NBSUMsR0FDRCxPQUFPLFNBQVMsS0FBSyxDQUFDLENBQVUsRUFBRSxDQUFVLEVBQVc7SUFDckQsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsQUFBQztJQUN2QixPQUFPLEFBQUMsU0FBUyxPQUFPLENBQUMsQ0FBVSxFQUFFLENBQVUsRUFBVztRQUN4RCxxREFBcUQ7UUFDckQsbUNBQW1DO1FBQ25DLElBQ0UsQ0FBQyxJQUNELENBQUMsSUFDRCxDQUFDLEFBQUMsQ0FBQyxZQUFZLE1BQU0sSUFBSSxDQUFDLFlBQVksTUFBTSxJ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