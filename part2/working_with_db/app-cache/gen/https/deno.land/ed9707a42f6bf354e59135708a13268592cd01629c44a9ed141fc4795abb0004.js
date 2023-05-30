// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
/*!
 * Adapted directly from negotiator at https://github.com/jshttp/negotiator/
 * which is licensed as follows:
 *
 * (The MIT License)
 *
 * Copyright (c) 2012-2014 Federico Romero
 * Copyright (c) 2012-2014 Isaac Z. Schlueter
 * Copyright (c) 2014-2015 Douglas Christopher Wilson
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */ import { compareSpecs, isQuality } from "./common.ts";
const SIMPLE_LANGUAGE_REGEXP = /^\s*([^\s\-;]+)(?:-([^\s;]+))?\s*(?:;(.*))?$/;
function parseLanguage(str, i) {
    const match = SIMPLE_LANGUAGE_REGEXP.exec(str);
    if (!match) {
        return undefined;
    }
    const [, prefix, suffix] = match;
    const full = suffix ? `${prefix}-${suffix}` : prefix;
    let q = 1;
    if (match[3]) {
        const params = match[3].split(";");
        for (const param of params){
            const [key, value] = param.trim().split("=");
            if (key === "q") {
                q = parseFloat(value);
                break;
            }
        }
    }
    return {
        prefix,
        suffix,
        full,
        q,
        i
    };
}
function parseAcceptLanguage(accept) {
    const accepts = accept.split(",");
    const result = [];
    for(let i = 0; i < accepts.length; i++){
        const language = parseLanguage(accepts[i].trim(), i);
        if (language) {
            result.push(language);
        }
    }
    return result;
}
function specify(language, spec, i) {
    const p = parseLanguage(language, i);
    if (!p) {
        return undefined;
    }
    let s = 0;
    if (spec.full.toLowerCase() === p.full.toLowerCase()) {
        s |= 4;
    } else if (spec.prefix.toLowerCase() === p.prefix.toLowerCase()) {
        s |= 2;
    } else if (spec.full.toLowerCase() === p.prefix.toLowerCase()) {
        s |= 1;
    } else if (spec.full !== "*") {
        return;
    }
    return {
        i,
        o: spec.i,
        q: spec.q,
        s
    };
}
function getLanguagePriority(language, accepted, index) {
    let priority = {
        i: -1,
        o: -1,
        q: 0,
        s: 0
    };
    for (const accepts of accepted){
        const spec = specify(language, accepts, index);
        if (spec && ((priority.s ?? 0) - (spec.s ?? 0) || priority.q - spec.q || (priority.o ?? 0) - (spec.o ?? 0)) < 0) {
            priority = spec;
        }
    }
    return priority;
}
export function preferredLanguages(accept = "*", provided) {
    const accepts = parseAcceptLanguage(accept);
    if (!provided) {
        return accepts.filter(isQuality).sort(compareSpecs).map((spec)=>spec.full);
    }
    const priorities = provided.map((type, index)=>getLanguagePriority(type, accepts, index));
    return priorities.filter(isQuality).sort(compareSpecs).map((priority)=>provided[priorities.indexOf(priority)]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE1Mi4wL2h0dHAvX25lZ290aWF0aW9uL2xhbmd1YWdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vKiFcbiAqIEFkYXB0ZWQgZGlyZWN0bHkgZnJvbSBuZWdvdGlhdG9yIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9qc2h0dHAvbmVnb3RpYXRvci9cbiAqIHdoaWNoIGlzIGxpY2Vuc2VkIGFzIGZvbGxvd3M6XG4gKlxuICogKFRoZSBNSVQgTGljZW5zZSlcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTItMjAxNCBGZWRlcmljbyBSb21lcm9cbiAqIENvcHlyaWdodCAoYykgMjAxMi0yMDE0IElzYWFjIFouIFNjaGx1ZXRlclxuICogQ29weXJpZ2h0IChjKSAyMDE0LTIwMTUgRG91Z2xhcyBDaHJpc3RvcGhlciBXaWxzb25cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuICogJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbiAqIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZXG4gKiBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuICogVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEVcbiAqIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbmltcG9ydCB7IGNvbXBhcmVTcGVjcywgaXNRdWFsaXR5LCBTcGVjaWZpY2l0eSB9IGZyb20gXCIuL2NvbW1vbi50c1wiO1xuXG5pbnRlcmZhY2UgTGFuZ3VhZ2VTcGVjaWZpY2l0eSBleHRlbmRzIFNwZWNpZmljaXR5IHtcbiAgcHJlZml4OiBzdHJpbmc7XG4gIHN1ZmZpeD86IHN0cmluZztcbiAgZnVsbDogc3RyaW5nO1xufVxuXG5jb25zdCBTSU1QTEVfTEFOR1VBR0VfUkVHRVhQID0gL15cXHMqKFteXFxzXFwtO10rKSg/Oi0oW15cXHM7XSspKT9cXHMqKD86OyguKikpPyQvO1xuXG5mdW5jdGlvbiBwYXJzZUxhbmd1YWdlKFxuICBzdHI6IHN0cmluZyxcbiAgaTogbnVtYmVyLFxuKTogTGFuZ3VhZ2VTcGVjaWZpY2l0eSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IG1hdGNoID0gU0lNUExFX0xBTkdVQUdFX1JFR0VYUC5leGVjKHN0cik7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgY29uc3QgWywgcHJlZml4LCBzdWZmaXhdID0gbWF0Y2g7XG4gIGNvbnN0IGZ1bGwgPSBzdWZmaXggPyBgJHtwcmVmaXh9LSR7c3VmZml4fWAgOiBwcmVmaXg7XG5cbiAgbGV0IHEgPSAxO1xuICBpZiAobWF0Y2hbM10pIHtcbiAgICBjb25zdCBwYXJhbXMgPSBtYXRjaFszXS5zcGxpdChcIjtcIik7XG4gICAgZm9yIChjb25zdCBwYXJhbSBvZiBwYXJhbXMpIHtcbiAgICAgIGNvbnN0IFtrZXksIHZhbHVlXSA9IHBhcmFtLnRyaW0oKS5zcGxpdChcIj1cIik7XG4gICAgICBpZiAoa2V5ID09PSBcInFcIikge1xuICAgICAgICBxID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IHByZWZpeCwgc3VmZml4LCBmdWxsLCBxLCBpIH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlQWNjZXB0TGFuZ3VhZ2UoYWNjZXB0OiBzdHJpbmcpOiBMYW5ndWFnZVNwZWNpZmljaXR5W10ge1xuICBjb25zdCBhY2NlcHRzID0gYWNjZXB0LnNwbGl0KFwiLFwiKTtcbiAgY29uc3QgcmVzdWx0OiBMYW5ndWFnZVNwZWNpZmljaXR5W10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFjY2VwdHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBsYW5ndWFnZSA9IHBhcnNlTGFuZ3VhZ2UoYWNjZXB0c1tpXS50cmltKCksIGkpO1xuICAgIGlmIChsYW5ndWFnZSkge1xuICAgICAgcmVzdWx0LnB1c2gobGFuZ3VhZ2UpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBzcGVjaWZ5KFxuICBsYW5ndWFnZTogc3RyaW5nLFxuICBzcGVjOiBMYW5ndWFnZVNwZWNpZmljaXR5LFxuICBpOiBudW1iZXIsXG4pOiBTcGVjaWZpY2l0eSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHAgPSBwYXJzZUxhbmd1YWdlKGxhbmd1YWdlLCBpKTtcbiAgaWYgKCFwKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBsZXQgcyA9IDA7XG4gIGlmIChzcGVjLmZ1bGwudG9Mb3dlckNhc2UoKSA9PT0gcC5mdWxsLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBzIHw9IDQ7XG4gIH0gZWxzZSBpZiAoc3BlYy5wcmVmaXgudG9Mb3dlckNhc2UoKSA9PT0gcC5wcmVmaXgudG9Mb3dlckNhc2UoKSkge1xuICAgIHMgfD0gMjtcbiAgfSBlbHNlIGlmIChzcGVjLmZ1bGwudG9Mb3dlckNhc2UoKSA9PT0gcC5wcmVmaXgudG9Mb3dlckNhc2UoKSkge1xuICAgIHMgfD0gMTtcbiAgfSBlbHNlIGlmIChzcGVjLmZ1bGwgIT09IFwiKlwiKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIHsgaSwgbzogc3BlYy5pLCBxOiBzcGVjLnEsIHMgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFuZ3VhZ2VQcmlvcml0eShcbiAgbGFuZ3VhZ2U6IHN0cmluZyxcbiAgYWNjZXB0ZWQ6IExhbmd1YWdlU3BlY2lmaWNpdHlbXSxcbiAgaW5kZXg6IG51bWJlcixcbik6IFNwZWNpZmljaXR5IHtcbiAgbGV0IHByaW9yaXR5OiBTcGVjaWZpY2l0eSA9IHsgaTogLTEsIG86IC0xLCBxOiAwLCBzOiAwIH07XG4gIGZvciAoY29uc3QgYWNjZXB0cyBvZiBhY2NlcHRlZCkge1xuICAgIGNvbnN0IHNwZWMgPSBzcGVjaWZ5KGxhbmd1YWdlLCBhY2NlcHRzLCBpbmRleCk7XG4gICAgaWYgKFxuICAgICAgc3BlYyAmJlxuICAgICAgKChwcmlvcml0eS5zID8/IDApIC0gKHNwZWMucyA/PyAwKSB8fCBwcmlvcml0eS5xIC0gc3BlYy5xIHx8XG4gICAgICAgICAgKHByaW9yaXR5Lm8gPz8gMCkgLSAoc3BlYy5vID8/IDApKSA8IDBcbiAgICApIHtcbiAgICAgIHByaW9yaXR5ID0gc3BlYztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHByaW9yaXR5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlZmVycmVkTGFuZ3VhZ2VzKFxuICBhY2NlcHQgPSBcIipcIixcbiAgcHJvdmlkZWQ/OiBzdHJpbmdbXSxcbik6IHN0cmluZ1tdIHtcbiAgY29uc3QgYWNjZXB0cyA9IHBhcnNlQWNjZXB0TGFuZ3VhZ2UoYWNjZXB0KTtcblxuICBpZiAoIXByb3ZpZGVkKSB7XG4gICAgcmV0dXJuIGFjY2VwdHNcbiAgICAgIC5maWx0ZXIoaXNRdWFsaXR5KVxuICAgICAgLnNvcnQoY29tcGFyZVNwZWNzKVxuICAgICAgLm1hcCgoc3BlYykgPT4gc3BlYy5mdWxsKTtcbiAgfVxuXG4gIGNvbnN0IHByaW9yaXRpZXMgPSBwcm92aWRlZFxuICAgIC5tYXAoKHR5cGUsIGluZGV4KSA9PiBnZXRMYW5ndWFnZVByaW9yaXR5KHR5cGUsIGFjY2VwdHMsIGluZGV4KSk7XG5cbiAgcmV0dXJuIHByaW9yaXRpZXNcbiAgICAuZmlsdGVyKGlzUXVhbGl0eSlcbiAgICAuc29ydChjb21wYXJlU3BlY3MpXG4gICAgLm1hcCgocHJpb3JpdHkpID0+IHByb3ZpZGVkW3ByaW9yaXRpZXMuaW5kZXhPZihwcmlvcml0eSldKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E0QkMsR0FFRCxTQUFTLFlBQVksRUFBRSxTQUFTLFFBQXFCLGFBQWEsQ0FBQztBQVFuRSxNQUFNLHNCQUFzQixpREFB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