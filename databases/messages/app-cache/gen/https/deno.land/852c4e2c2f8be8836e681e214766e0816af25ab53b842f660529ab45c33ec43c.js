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
// - https://github.com/nodejs/node/blob/master/src/handle_wrap.cc
// - https://github.com/nodejs/node/blob/master/src/handle_wrap.h
import { notImplemented } from "../_utils.ts";
import { nextTick } from "../_next_tick.ts";
import { AsyncWrap } from "./async_wrap.ts";
export class HandleWrap extends AsyncWrap {
    constructor(provider){
        super(provider);
    }
    async close(cb = ()=>{}) {
        await this._onClose();
        nextTick(cb);
    }
    ref() {
        notImplemented();
    }
    unref() {
        notImplemented();
    }
    // deno-lint-ignore no-explicit-any
    async _onClose() {}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvaW50ZXJuYWxfYmluZGluZy9oYW5kbGVfd3JhcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIFRoaXMgbW9kdWxlIHBvcnRzOlxuLy8gLSBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9tYXN0ZXIvc3JjL2hhbmRsZV93cmFwLmNjXG4vLyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL21hc3Rlci9zcmMvaGFuZGxlX3dyYXAuaFxuXG5pbXBvcnQgeyBub3RJbXBsZW1lbnRlZCB9IGZyb20gXCIuLi9fdXRpbHMudHNcIjtcbmltcG9ydCB7IG5leHRUaWNrIH0gZnJvbSBcIi4uL19uZXh0X3RpY2sudHNcIjtcbmltcG9ydCB7IEFzeW5jV3JhcCwgcHJvdmlkZXJUeXBlIH0gZnJvbSBcIi4vYXN5bmNfd3JhcC50c1wiO1xuXG5leHBvcnQgY2xhc3MgSGFuZGxlV3JhcCBleHRlbmRzIEFzeW5jV3JhcCB7XG4gIGNvbnN0cnVjdG9yKHByb3ZpZGVyOiBwcm92aWRlclR5cGUpIHtcbiAgICBzdXBlcihwcm92aWRlcik7XG4gIH1cblxuICBhc3luYyBjbG9zZShjYjogKCkgPT4gdm9pZCA9ICgpID0+IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5fb25DbG9zZSgpO1xuICAgIG5leHRUaWNrKGNiKTtcbiAgfVxuXG4gIHJlZigpIHtcbiAgICBub3RJbXBsZW1lbnRlZCgpO1xuICB9XG5cbiAgdW5yZWYoKSB7XG4gICAgbm90SW1wbGVtZW50ZWQoKTtcbiAgfVxuXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGFzeW5jIF9vbkNsb3NlKCk6IFByb21pc2U8YW55PiB7fVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxzREFBc0Q7QUFDdEQsRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSxnRUFBZ0U7QUFDaEUsc0VBQXNFO0FBQ3RFLHNFQUFzRTtBQUN0RSw0RUFBNEU7QUFDNUUscUVBQXFFO0FBQ3JFLHdCQUF3QjtBQUN4QixFQUFFO0FBQ0YsMEVBQTBFO0FBQzFFLHlEQUF5RDtBQUN6RCxFQUFFO0FBQ0YsMEVBQTBFO0FBQzFFLDZEQUE2RDtBQUM3RCw0RUFBNEU7QUFDNUUsMkVBQTJFO0FBQzNFLHdFQUF3RTtBQUN4RSw0RUFBNEU7QUFDNUUseUNBQXlDO0FBRXpDLHFCQUFxQjtBQUNyQixrRUFBa0U7QUFDbEUsaUVBQWlFO0FBRWpFLFNBQVMsY0FBYyxRQUFRLGNBQWMsQ0FBQztBQUM5QyxTQUFTLFFBQVEsUUFBUSxrQkFBa0IsQ0FBQztBQUM1QyxTQUFTLFNBQVMsUUFBc0IsaUJBQWlCLENBQUM7QUFFMUQsT0FBTyxNQUFNLFVBQVUsU0FBUyxTQUFTO0lBQ3ZDLFlBQVksUUFBc0IsQ0FBRTtRQUNsQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEI7VUFFTSxLQUFLLENBQUMsRUFBYyxHQUFHLElBQU0sQ0FBQyxDQUFDLEVBQWlCO1FBQ3BELE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RCLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNmO0lBRUEsR0FBRyxHQUFHO1FBQ0osY0FBYyxFQUFFLENBQUM7SUFDbkI7SUFFQSxLQUFLLEdBQUc7UUFDTixjQUFjLEVBQUUsQ0FBQztJQUNuQjtJQUVBLG1DQUFtQztVQUM3QixRQUFRLEdBQWlCLENBQUM7Q0FDakMifQ==