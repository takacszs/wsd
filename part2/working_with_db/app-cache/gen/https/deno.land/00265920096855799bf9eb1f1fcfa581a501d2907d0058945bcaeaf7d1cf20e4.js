// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// This module ports:
// - https://github.com/nodejs/node/blob/master/src/connection_wrap.cc
// - https://github.com/nodejs/node/blob/master/src/connection_wrap.h
import { LibuvStreamWrap } from "./stream_wrap.ts";
export class ConnectionWrap extends LibuvStreamWrap {
    /** Optional connection callback. */ onconnection = null;
    /**
   * Creates a new ConnectionWrap class instance.
   * @param provider Provider type.
   * @param object Optional stream object.
   */ constructor(provider, object){
        super(provider, object);
    }
    /**
   * @param req A connect request.
   * @param status An error status code.
   */ afterConnect(req, status) {
        const isSuccessStatus = !status;
        const readable = isSuccessStatus;
        const writable = isSuccessStatus;
        try {
            req.oncomplete(status, this, req, readable, writable);
        } catch  {
        // swallow callback errors.
        }
        return;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvaW50ZXJuYWxfYmluZGluZy9jb25uZWN0aW9uX3dyYXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBUaGlzIG1vZHVsZSBwb3J0czpcbi8vIC0gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvbWFzdGVyL3NyYy9jb25uZWN0aW9uX3dyYXAuY2Ncbi8vIC0gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvbWFzdGVyL3NyYy9jb25uZWN0aW9uX3dyYXAuaFxuXG5pbXBvcnQgeyBMaWJ1dlN0cmVhbVdyYXAgfSBmcm9tIFwiLi9zdHJlYW1fd3JhcC50c1wiO1xuaW1wb3J0IHsgQXN5bmNXcmFwLCBwcm92aWRlclR5cGUgfSBmcm9tIFwiLi9hc3luY193cmFwLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uV3JhcCBleHRlbmRzIExpYnV2U3RyZWFtV3JhcCB7XG4gIC8qKiBPcHRpb25hbCBjb25uZWN0aW9uIGNhbGxiYWNrLiAqL1xuICBvbmNvbm5lY3Rpb246ICgoc3RhdHVzOiBudW1iZXIsIGhhbmRsZT86IENvbm5lY3Rpb25XcmFwKSA9PiB2b2lkKSB8IG51bGwgPVxuICAgIG51bGw7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgQ29ubmVjdGlvbldyYXAgY2xhc3MgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSBwcm92aWRlciBQcm92aWRlciB0eXBlLlxuICAgKiBAcGFyYW0gb2JqZWN0IE9wdGlvbmFsIHN0cmVhbSBvYmplY3QuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcm92aWRlcjogcHJvdmlkZXJUeXBlLFxuICAgIG9iamVjdD86IERlbm8uUmVhZGVyICYgRGVuby5Xcml0ZXIgJiBEZW5vLkNsb3NlcixcbiAgKSB7XG4gICAgc3VwZXIocHJvdmlkZXIsIG9iamVjdCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHJlcSBBIGNvbm5lY3QgcmVxdWVzdC5cbiAgICogQHBhcmFtIHN0YXR1cyBBbiBlcnJvciBzdGF0dXMgY29kZS5cbiAgICovXG4gIGFmdGVyQ29ubmVjdDxcbiAgICBUIGV4dGVuZHMgQXN5bmNXcmFwICYge1xuICAgICAgb25jb21wbGV0ZShcbiAgICAgICAgc3RhdHVzOiBudW1iZXIsXG4gICAgICAgIGhhbmRsZTogQ29ubmVjdGlvbldyYXAsXG4gICAgICAgIHJlcTogVCxcbiAgICAgICAgcmVhZGFibGU6IGJvb2xlYW4sXG4gICAgICAgIHdyaXRlYWJsZTogYm9vbGVhbixcbiAgICAgICk6IHZvaWQ7XG4gICAgfSxcbiAgPihcbiAgICByZXE6IFQsXG4gICAgc3RhdHVzOiBudW1iZXIsXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGlzU3VjY2Vzc1N0YXR1cyA9ICFzdGF0dXM7XG4gICAgY29uc3QgcmVhZGFibGUgPSBpc1N1Y2Nlc3NTdGF0dXM7XG4gICAgY29uc3Qgd3JpdGFibGUgPSBpc1N1Y2Nlc3NTdGF0dXM7XG5cbiAgICB0cnkge1xuICAgICAgcmVxLm9uY29tcGxldGUoc3RhdHVzLCB0aGlzLCByZXEsIHJlYWRhYmxlLCB3cml0YWJsZSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBzd2FsbG93IGNhbGxiYWNrIGVycm9ycy5cbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsc0RBQXNEO0FBQ3RELEVBQUU7QUFDRiwwRUFBMEU7QUFDMUUsZ0VBQWdFO0FBQ2hFLHNFQUFzRTtBQUN0RSxzRUFBc0U7QUFDdEUsNEVBQTRFO0FBQzVFLHFFQUFxRTtBQUNyRSx3QkFBd0I7QUFDeEIsRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSx5REFBeUQ7QUFDekQsRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSw2REFBNkQ7QUFDN0QsNEVBQTRFO0FBQzVFLDJFQUEyRTtBQUMzRSx3RUFBd0U7QUFDeEUsNEVBQTRFO0FBQzVFLHlDQUF5QztBQUV6QyxxQkFBcUI7QUFDckIsc0VBQXNFO0FBQ3RFLHFFQUFxRTtBQUVyRSxTQUFTLGVBQWUsUUFBUSxrQkFBa0IsQ0FBQztBQUduRCxPQUFPLE1BQU0sY0FBYyxTQUFTLGVBQWU7SUFDakQsa0NBQWtDLEdBQ2xDLFlBQVksR0FDVixJQUFJLENBQUM7SUFFUDs7OztHQUlDLEdBQ0QsWUFDRSxRQUFzQixFQUN0QixNQUFnRCxDQUNoRDtRQUNBLEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDMUI7SUFFQTs7O0dBR0MsR0FDRCxZQUFZLENBV1YsR0FBTSxFQUNOLE1BQWMsRUFDUjtRQUNOLE1BQU0sZUFBZSxHQUFHLENBQUMsTUFBTSxBQUFDO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLGVBQWUsQUFBQztRQUNqQyxNQUFNLFFBQVEsR0FBRyxlQUFlLEFBQUM7UUFFakMsSUFBSTtZQUNGLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3hELEVBQUUsT0FBTTtRQUNOLDJCQUEyQjtRQUM3QixDQUFDO1FBRUQsT0FBTztJQUNUO0NBQ0QifQ==