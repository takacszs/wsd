// Copyright 2018-2022 the oak authors. All rights reserved. MIT license.
const objectCloneMemo = new WeakMap();
function cloneArrayBuffer(srcBuffer, srcByteOffset, srcLength, // deno-lint-ignore no-explicit-any
_cloneConstructor) {
    // this function fudges the return type but SharedArrayBuffer is disabled for a while anyway
    return srcBuffer.slice(srcByteOffset, srcByteOffset + srcLength);
}
/** A loose approximation for structured cloning, used when the `Deno.core`
 * APIs are not available. */ // deno-lint-ignore no-explicit-any
function cloneValue(value) {
    switch(typeof value){
        case "number":
        case "string":
        case "boolean":
        case "undefined":
        case "bigint":
            return value;
        case "object":
            {
                if (objectCloneMemo.has(value)) {
                    return objectCloneMemo.get(value);
                }
                if (value === null) {
                    return value;
                }
                if (value instanceof Date) {
                    return new Date(value.valueOf());
                }
                if (value instanceof RegExp) {
                    return new RegExp(value);
                }
                if (value instanceof SharedArrayBuffer) {
                    return value;
                }
                if (value instanceof ArrayBuffer) {
                    const cloned = cloneArrayBuffer(value, 0, value.byteLength, ArrayBuffer);
                    objectCloneMemo.set(value, cloned);
                    return cloned;
                }
                if (ArrayBuffer.isView(value)) {
                    const clonedBuffer = cloneValue(value.buffer);
                    // Use DataViewConstructor type purely for type-checking, can be a
                    // DataView or TypedArray.  They use the same constructor signature,
                    // only DataView has a length in bytes and TypedArrays use a length in
                    // terms of elements, so we adjust for that.
                    let length;
                    if (value instanceof DataView) {
                        length = value.byteLength;
                    } else {
                        // deno-lint-ignore no-explicit-any
                        length = value.length;
                    }
                    // deno-lint-ignore no-explicit-any
                    return new value.constructor(clonedBuffer, value.byteOffset, length);
                }
                if (value instanceof Map) {
                    const clonedMap = new Map();
                    objectCloneMemo.set(value, clonedMap);
                    value.forEach((v, k)=>{
                        clonedMap.set(cloneValue(k), cloneValue(v));
                    });
                    return clonedMap;
                }
                if (value instanceof Set) {
                    // assumes that cloneValue still takes only one argument
                    const clonedSet = new Set([
                        ...value
                    ].map(cloneValue));
                    objectCloneMemo.set(value, clonedSet);
                    return clonedSet;
                }
                // default for objects
                // deno-lint-ignore no-explicit-any
                const clonedObj = {};
                objectCloneMemo.set(value, clonedObj);
                const sourceKeys = Object.getOwnPropertyNames(value);
                for (const key of sourceKeys){
                    clonedObj[key] = cloneValue(value[key]);
                }
                Reflect.setPrototypeOf(clonedObj, Reflect.getPrototypeOf(value));
                return clonedObj;
            }
        case "symbol":
        case "function":
        default:
            throw new DOMException("Uncloneable value in stream", "DataCloneError");
    }
}
// deno-lint-ignore no-explicit-any
const core = Deno?.core;
const structuredClone = // deno-lint-ignore no-explicit-any
(globalThis).structuredClone;
/**
 * Provides structured cloning
 * @param value
 * @returns
 */ function sc(value) {
    return structuredClone ? structuredClone(value) : core ? core.deserialize(core.serialize(value)) : cloneValue(value);
}
/** Clones a state object, skipping any values that cannot be cloned. */ // deno-lint-ignore no-explicit-any
export function cloneState(state) {
    const clone = {};
    for (const [key, value] of Object.entries(state)){
        try {
            const clonedValue = sc(value);
            clone[key] = clonedValue;
        } catch  {
        // we just no-op values that cannot be cloned
        }
    }
    return clone;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvb2FrQHYxMS4xLjAvc3RydWN0dXJlZF9jbG9uZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBvYWsgYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmV4cG9ydCB0eXBlIFN0cnVjdHVyZWRDbG9uYWJsZSA9XG4gIHwgeyBba2V5OiBzdHJpbmddOiBTdHJ1Y3R1cmVkQ2xvbmFibGUgfVxuICB8IEFycmF5PFN0cnVjdHVyZWRDbG9uYWJsZT5cbiAgfCBBcnJheUJ1ZmZlclxuICB8IEFycmF5QnVmZmVyVmlld1xuICB8IEJpZ0ludFxuICB8IGJpZ2ludFxuICB8IEJsb2JcbiAgLy8gZGVuby1saW50LWlnbm9yZSBiYW4tdHlwZXNcbiAgfCBCb29sZWFuXG4gIHwgYm9vbGVhblxuICB8IERhdGVcbiAgfCBFcnJvclxuICB8IEV2YWxFcnJvclxuICB8IE1hcDxTdHJ1Y3R1cmVkQ2xvbmFibGUsIFN0cnVjdHVyZWRDbG9uYWJsZT5cbiAgLy8gZGVuby1saW50LWlnbm9yZSBiYW4tdHlwZXNcbiAgfCBOdW1iZXJcbiAgfCBudW1iZXJcbiAgfCBSYW5nZUVycm9yXG4gIHwgUmVmZXJlbmNlRXJyb3JcbiAgfCBSZWdFeHBcbiAgfCBTZXQ8U3RydWN0dXJlZENsb25hYmxlPlxuICAvLyBkZW5vLWxpbnQtaWdub3JlIGJhbi10eXBlc1xuICB8IFN0cmluZ1xuICB8IHN0cmluZ1xuICB8IFN5bnRheEVycm9yXG4gIHwgVHlwZUVycm9yXG4gIHwgVVJJRXJyb3I7XG5cbi8qKiBJbnRlcm5hbCBmdW5jdGlvbnMgb24gdGhlIGBEZW5vLmNvcmVgIG5hbWVzcGFjZSAqL1xuaW50ZXJmYWNlIERlbm9Db3JlIHtcbiAgZGVzZXJpYWxpemUodmFsdWU6IHVua25vd24pOiBTdHJ1Y3R1cmVkQ2xvbmFibGU7XG4gIHNlcmlhbGl6ZSh2YWx1ZTogU3RydWN0dXJlZENsb25hYmxlKTogdW5rbm93bjtcbn1cblxuY29uc3Qgb2JqZWN0Q2xvbmVNZW1vID0gbmV3IFdlYWtNYXAoKTtcblxuZnVuY3Rpb24gY2xvbmVBcnJheUJ1ZmZlcihcbiAgc3JjQnVmZmVyOiBBcnJheUJ1ZmZlcixcbiAgc3JjQnl0ZU9mZnNldDogbnVtYmVyLFxuICBzcmNMZW5ndGg6IG51bWJlcixcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgX2Nsb25lQ29uc3RydWN0b3I6IGFueSxcbikge1xuICAvLyB0aGlzIGZ1bmN0aW9uIGZ1ZGdlcyB0aGUgcmV0dXJuIHR5cGUgYnV0IFNoYXJlZEFycmF5QnVmZmVyIGlzIGRpc2FibGVkIGZvciBhIHdoaWxlIGFueXdheVxuICByZXR1cm4gc3JjQnVmZmVyLnNsaWNlKFxuICAgIHNyY0J5dGVPZmZzZXQsXG4gICAgc3JjQnl0ZU9mZnNldCArIHNyY0xlbmd0aCxcbiAgKTtcbn1cblxuLyoqIEEgbG9vc2UgYXBwcm94aW1hdGlvbiBmb3Igc3RydWN0dXJlZCBjbG9uaW5nLCB1c2VkIHdoZW4gdGhlIGBEZW5vLmNvcmVgXG4gKiBBUElzIGFyZSBub3QgYXZhaWxhYmxlLiAqL1xuLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbmZ1bmN0aW9uIGNsb25lVmFsdWUodmFsdWU6IGFueSk6IGFueSB7XG4gIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgIGNhc2UgXCJ1bmRlZmluZWRcIjpcbiAgICBjYXNlIFwiYmlnaW50XCI6XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgY2FzZSBcIm9iamVjdFwiOiB7XG4gICAgICBpZiAob2JqZWN0Q2xvbmVNZW1vLmhhcyh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdENsb25lTWVtby5nZXQodmFsdWUpO1xuICAgICAgfVxuICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XG4gICAgICB9XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodmFsdWUpO1xuICAgICAgfVxuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgY29uc3QgY2xvbmVkID0gY2xvbmVBcnJheUJ1ZmZlcihcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAwLFxuICAgICAgICAgIHZhbHVlLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgQXJyYXlCdWZmZXIsXG4gICAgICAgICk7XG4gICAgICAgIG9iamVjdENsb25lTWVtby5zZXQodmFsdWUsIGNsb25lZCk7XG4gICAgICAgIHJldHVybiBjbG9uZWQ7XG4gICAgICB9XG4gICAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgICAgICBjb25zdCBjbG9uZWRCdWZmZXIgPSBjbG9uZVZhbHVlKHZhbHVlLmJ1ZmZlcik7XG4gICAgICAgIC8vIFVzZSBEYXRhVmlld0NvbnN0cnVjdG9yIHR5cGUgcHVyZWx5IGZvciB0eXBlLWNoZWNraW5nLCBjYW4gYmUgYVxuICAgICAgICAvLyBEYXRhVmlldyBvciBUeXBlZEFycmF5LiAgVGhleSB1c2UgdGhlIHNhbWUgY29uc3RydWN0b3Igc2lnbmF0dXJlLFxuICAgICAgICAvLyBvbmx5IERhdGFWaWV3IGhhcyBhIGxlbmd0aCBpbiBieXRlcyBhbmQgVHlwZWRBcnJheXMgdXNlIGEgbGVuZ3RoIGluXG4gICAgICAgIC8vIHRlcm1zIG9mIGVsZW1lbnRzLCBzbyB3ZSBhZGp1c3QgZm9yIHRoYXQuXG4gICAgICAgIGxldCBsZW5ndGg7XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGFWaWV3KSB7XG4gICAgICAgICAgbGVuZ3RoID0gdmFsdWUuYnl0ZUxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAgICAgICAgIGxlbmd0aCA9ICh2YWx1ZSBhcyBhbnkpLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAgICAgICByZXR1cm4gbmV3ICh2YWx1ZS5jb25zdHJ1Y3RvciBhcyBhbnkpKFxuICAgICAgICAgIGNsb25lZEJ1ZmZlcixcbiAgICAgICAgICB2YWx1ZS5ieXRlT2Zmc2V0LFxuICAgICAgICAgIGxlbmd0aCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICBjb25zdCBjbG9uZWRNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIG9iamVjdENsb25lTWVtby5zZXQodmFsdWUsIGNsb25lZE1hcCk7XG4gICAgICAgIHZhbHVlLmZvckVhY2goKHYsIGspID0+IHtcbiAgICAgICAgICBjbG9uZWRNYXAuc2V0KGNsb25lVmFsdWUoayksIGNsb25lVmFsdWUodikpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNsb25lZE1hcDtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAvLyBhc3N1bWVzIHRoYXQgY2xvbmVWYWx1ZSBzdGlsbCB0YWtlcyBvbmx5IG9uZSBhcmd1bWVudFxuICAgICAgICBjb25zdCBjbG9uZWRTZXQgPSBuZXcgU2V0KFsuLi52YWx1ZV0ubWFwKGNsb25lVmFsdWUpKTtcbiAgICAgICAgb2JqZWN0Q2xvbmVNZW1vLnNldCh2YWx1ZSwgY2xvbmVkU2V0KTtcbiAgICAgICAgcmV0dXJuIGNsb25lZFNldDtcbiAgICAgIH1cblxuICAgICAgLy8gZGVmYXVsdCBmb3Igb2JqZWN0c1xuICAgICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICAgIGNvbnN0IGNsb25lZE9iajogUmVjb3JkPGFueSwgYW55PiA9IHt9O1xuICAgICAgb2JqZWN0Q2xvbmVNZW1vLnNldCh2YWx1ZSwgY2xvbmVkT2JqKTtcbiAgICAgIGNvbnN0IHNvdXJjZUtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBzb3VyY2VLZXlzKSB7XG4gICAgICAgIGNsb25lZE9ialtrZXldID0gY2xvbmVWYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgIH1cbiAgICAgIFJlZmxlY3Quc2V0UHJvdG90eXBlT2YoY2xvbmVkT2JqLCBSZWZsZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSk7XG4gICAgICByZXR1cm4gY2xvbmVkT2JqO1xuICAgIH1cbiAgICBjYXNlIFwic3ltYm9sXCI6XG4gICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oXCJVbmNsb25lYWJsZSB2YWx1ZSBpbiBzdHJlYW1cIiwgXCJEYXRhQ2xvbmVFcnJvclwiKTtcbiAgfVxufVxuXG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuY29uc3QgY29yZSA9IChEZW5vIGFzIGFueSk/LmNvcmUgYXMgRGVub0NvcmUgfCB1bmRlZmluZWQ7XG5jb25zdCBzdHJ1Y3R1cmVkQ2xvbmU6ICgodmFsdWU6IHVua25vd24pID0+IHVua25vd24pIHwgdW5kZWZpbmVkID1cbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgKGdsb2JhbFRoaXMgYXMgYW55KS5zdHJ1Y3R1cmVkQ2xvbmU7XG5cbi8qKlxuICogUHJvdmlkZXMgc3RydWN0dXJlZCBjbG9uaW5nXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIHNjPFQgZXh0ZW5kcyBTdHJ1Y3R1cmVkQ2xvbmFibGU+KHZhbHVlOiBUKTogVCB7XG4gIHJldHVybiBzdHJ1Y3R1cmVkQ2xvbmVcbiAgICA/IHN0cnVjdHVyZWRDbG9uZSh2YWx1ZSlcbiAgICA6IGNvcmVcbiAgICA/IGNvcmUuZGVzZXJpYWxpemUoY29yZS5zZXJpYWxpemUodmFsdWUpKVxuICAgIDogY2xvbmVWYWx1ZSh2YWx1ZSk7XG59XG5cbi8qKiBDbG9uZXMgYSBzdGF0ZSBvYmplY3QsIHNraXBwaW5nIGFueSB2YWx1ZXMgdGhhdCBjYW5ub3QgYmUgY2xvbmVkLiAqL1xuLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbmV4cG9ydCBmdW5jdGlvbiBjbG9uZVN0YXRlPFMgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+PihzdGF0ZTogUyk6IFMge1xuICBjb25zdCBjbG9uZSA9IHt9IGFzIFM7XG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHN0YXRlKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjbG9uZWRWYWx1ZSA9IHNjKHZhbHVlKTtcbiAgICAgIGNsb25lW2tleSBhcyBrZXlvZiBTXSA9IGNsb25lZFZhbHVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gd2UganVzdCBuby1vcCB2YWx1ZXMgdGhhdCBjYW5ub3QgYmUgY2xvbmVkXG4gICAgfVxuICB9XG4gIHJldHVybiBjbG9uZTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5RUFBeUU7QUFxQ3pFLE1BQU0sZUFBZSxHQUFHLElBQUksT0FBTyxFQUFFLEFBQUM7QUFFdEMsU0FBUyxnQkFBZ0IsQ0FDdkIsU0FBc0IsRUFDdEIsYUFBcUIsRUFDckIsU0FBaUIsRUFDakIsbUNBQW1DO0FBQ25DLGlCQUFzQixFQUN0QjtJQUNB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