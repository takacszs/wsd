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
// - https://github.com/nodejs/node/blob/master/src/cares_wrap.cc
// - https://github.com/nodejs/node/blob/master/src/cares_wrap.h
import { isIPv4 } from "../internal/net.ts";
import { codeMap } from "./uv.ts";
import { AsyncWrap, providerType } from "./async_wrap.ts";
// REF: https://github.com/nodejs/node/blob/master/deps/cares/include/ares.h#L190
export const ARES_AI_CANONNAME = 1 << 0;
export const ARES_AI_NUMERICHOST = 1 << 1;
export const ARES_AI_PASSIVE = 1 << 2;
export const ARES_AI_NUMERICSERV = 1 << 3;
export const AI_V4MAPPED = 1 << 4;
export const AI_ALL = 1 << 5;
export const AI_ADDRCONFIG = 1 << 6;
export const ARES_AI_NOSORT = 1 << 7;
export const ARES_AI_ENVHOSTS = 1 << 8;
export class GetAddrInfoReqWrap extends AsyncWrap {
    callback;
    family;
    hostname;
    oncomplete;
    constructor(){
        super(providerType.GETADDRINFOREQWRAP);
    }
}
export function getaddrinfo(req, hostname, family, _hints, verbatim) {
    (async ()=>{
        const addresses = [];
        // TODO(cmorten): use hints
        // REF: https://nodejs.org/api/dns.html#dns_supported_getaddrinfo_flags
        const recordTypes = [];
        if (family === 0 || family === 4) {
            recordTypes.push("A");
        }
        if (family === 0 || family === 6) {
            recordTypes.push("AAAA");
        }
        await Promise.allSettled(recordTypes.map((recordType)=>Deno.resolveDns(hostname, recordType).then((records)=>{
                records.forEach((record)=>addresses.push(record));
            })));
        const error = addresses.length ? null : codeMap.get("EAI_NODATA");
        if (!verbatim) {
            addresses.sort((a, b)=>{
                if (isIPv4(a)) {
                    return -1;
                } else if (isIPv4(b)) {
                    return 1;
                }
                return 0;
            });
        }
        req.oncomplete(error, addresses);
    })();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvaW50ZXJuYWxfYmluZGluZy9jYXJlc193cmFwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gVGhpcyBtb2R1bGUgcG9ydHM6XG4vLyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL21hc3Rlci9zcmMvY2FyZXNfd3JhcC5jY1xuLy8gLSBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9tYXN0ZXIvc3JjL2NhcmVzX3dyYXAuaFxuXG5pbXBvcnQgdHlwZSB7IEVycm5vRXhjZXB0aW9uIH0gZnJvbSBcIi4uL2ludGVybmFsL2Vycm9ycy50c1wiO1xuaW1wb3J0IHsgaXNJUHY0IH0gZnJvbSBcIi4uL2ludGVybmFsL25ldC50c1wiO1xuaW1wb3J0IHsgY29kZU1hcCB9IGZyb20gXCIuL3V2LnRzXCI7XG5pbXBvcnQgeyBBc3luY1dyYXAsIHByb3ZpZGVyVHlwZSB9IGZyb20gXCIuL2FzeW5jX3dyYXAudHNcIjtcblxuaW50ZXJmYWNlIExvb2t1cEFkZHJlc3Mge1xuICBhZGRyZXNzOiBzdHJpbmc7XG4gIGZhbWlseTogbnVtYmVyO1xufVxuXG4vLyBSRUY6IGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL21hc3Rlci9kZXBzL2NhcmVzL2luY2x1ZGUvYXJlcy5oI0wxOTBcbmV4cG9ydCBjb25zdCBBUkVTX0FJX0NBTk9OTkFNRSA9ICgxIDw8IDApO1xuZXhwb3J0IGNvbnN0IEFSRVNfQUlfTlVNRVJJQ0hPU1QgPSAoMSA8PCAxKTtcbmV4cG9ydCBjb25zdCBBUkVTX0FJX1BBU1NJVkUgPSAoMSA8PCAyKTtcbmV4cG9ydCBjb25zdCBBUkVTX0FJX05VTUVSSUNTRVJWID0gKDEgPDwgMyk7XG5leHBvcnQgY29uc3QgQUlfVjRNQVBQRUQgPSAoMSA8PCA0KTtcbmV4cG9ydCBjb25zdCBBSV9BTEwgPSAoMSA8PCA1KTtcbmV4cG9ydCBjb25zdCBBSV9BRERSQ09ORklHID0gKDEgPDwgNik7XG5leHBvcnQgY29uc3QgQVJFU19BSV9OT1NPUlQgPSAoMSA8PCA3KTtcbmV4cG9ydCBjb25zdCBBUkVTX0FJX0VOVkhPU1RTID0gKDEgPDwgOCk7XG5cbmV4cG9ydCBjbGFzcyBHZXRBZGRySW5mb1JlcVdyYXAgZXh0ZW5kcyBBc3luY1dyYXAge1xuICBjYWxsYmFjayE6IChcbiAgICBlcnI6IEVycm5vRXhjZXB0aW9uIHwgbnVsbCxcbiAgICBhZGRyZXNzT3JBZGRyZXNzZXM/OiBzdHJpbmcgfCBMb29rdXBBZGRyZXNzW10gfCBudWxsLFxuICAgIGZhbWlseT86IG51bWJlcixcbiAgKSA9PiB2b2lkO1xuICBmYW1pbHkhOiBudW1iZXI7XG4gIGhvc3RuYW1lITogc3RyaW5nO1xuICBvbmNvbXBsZXRlITogKGVycjogbnVtYmVyIHwgbnVsbCwgYWRkcmVzc2VzOiBzdHJpbmdbXSkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihwcm92aWRlclR5cGUuR0VUQUREUklORk9SRVFXUkFQKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0YWRkcmluZm8oXG4gIHJlcTogR2V0QWRkckluZm9SZXFXcmFwLFxuICBob3N0bmFtZTogc3RyaW5nLFxuICBmYW1pbHk6IG51bWJlcixcbiAgX2hpbnRzOiBudW1iZXIsXG4gIHZlcmJhdGltOiBib29sZWFuLFxuKSB7XG4gIChhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgYWRkcmVzc2VzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gVE9ETyhjbW9ydGVuKTogdXNlIGhpbnRzXG4gICAgLy8gUkVGOiBodHRwczovL25vZGVqcy5vcmcvYXBpL2Rucy5odG1sI2Ruc19zdXBwb3J0ZWRfZ2V0YWRkcmluZm9fZmxhZ3NcblxuICAgIGNvbnN0IHJlY29yZFR5cGVzOiAoXCJBXCIgfCBcIkFBQUFcIilbXSA9IFtdO1xuXG4gICAgaWYgKGZhbWlseSA9PT0gMCB8fCBmYW1pbHkgPT09IDQpIHtcbiAgICAgIHJlY29yZFR5cGVzLnB1c2goXCJBXCIpO1xuICAgIH1cbiAgICBpZiAoZmFtaWx5ID09PSAwIHx8IGZhbWlseSA9PT0gNikge1xuICAgICAgcmVjb3JkVHlwZXMucHVzaChcIkFBQUFcIik7XG4gICAgfVxuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKFxuICAgICAgcmVjb3JkVHlwZXMubWFwKChyZWNvcmRUeXBlKSA9PlxuICAgICAgICBEZW5vLnJlc29sdmVEbnMoaG9zdG5hbWUsIHJlY29yZFR5cGUpLnRoZW4oKHJlY29yZHMpID0+IHtcbiAgICAgICAgICByZWNvcmRzLmZvckVhY2goKHJlY29yZCkgPT4gYWRkcmVzc2VzLnB1c2gocmVjb3JkKSk7XG4gICAgICAgIH0pXG4gICAgICApLFxuICAgICk7XG5cbiAgICBjb25zdCBlcnJvciA9IGFkZHJlc3Nlcy5sZW5ndGggPyBudWxsIDogY29kZU1hcC5nZXQoXCJFQUlfTk9EQVRBXCIpITtcblxuICAgIGlmICghdmVyYmF0aW0pIHtcbiAgICAgIGFkZHJlc3Nlcy5zb3J0KChhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlciA9PiB7XG4gICAgICAgIGlmIChpc0lQdjQoYSkpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNJUHY0KGIpKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlcS5vbmNvbXBsZXRlKGVycm9yLCBhZGRyZXNzZXMpO1xuICB9KSgpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxzREFBc0Q7QUFDdEQsRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSxnRUFBZ0U7QUFDaEUsc0VBQXNFO0FBQ3RFLHNFQUFzRTtBQUN0RSw0RUFBNEU7QUFDNUUscUVBQXFFO0FBQ3JFLHdCQUF3QjtBQUN4QixFQUFFO0FBQ0YsMEVBQTBFO0FBQzFFLHlEQUF5RDtBQUN6RCxFQUFFO0FBQ0YsMEVBQTBFO0FBQzFFLDZEQUE2RDtBQUM3RCw0RUFBNEU7QUFDNUUsMkVBQTJFO0FBQzNFLHdFQUF3RTtBQUN4RSw0RUFBNEU7QUFDNUUseUNBQXlDO0FBRXpDLHFCQUFxQjtBQUNyQixpRUFBaUU7QUFDakUsZ0VBQWdFO0FBR2hFLFNBQVMsTUFBTSxRQUFRLG9CQUFvQixDQUFDO0FBQzVDLFNBQVMsT0FBTyxRQUFRLFNBQVMsQ0FBQztBQUNsQyxTQUFTLFNBQVMsRUFBRSxZQUFZLFFBQVEsaUJBQWlCLENBQUM7QUFPMUQsaUZBQWlGO0FBQ2pGLE9BQU8sTUFBTSxpQkFBaUIsR0FBSSxDQUFDLElBQUksQ0FBQyxBQUFDLENBQUM7QUFDMUMsT0FBTyxNQUFNLG1CQUFtQixHQUFJLENBQUMsSUFBSSxDQUFDLEFBQUMsQ0FBQztBQUM1QyxPQUFPLE1BQU0sZUFBZSxHQUFJLENBQUMsSUFBSSxDQUFDLEFBQUMsQ0FBQztBQUN4QyxPQUFPLE1BQU0sbUJBQW1CLEdBQUksQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDO0FBQzVDLE9BQU8sTUFBTSxXQUFXLEdBQUksQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDO0FBQ3BDLE9BQU8sTUFBTSxNQUFNLEdBQUksQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDO0FBQy9CLE9BQU8sTUFBTSxhQUFhLEdBQUksQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDO0FBQ3RDLE9BQU8sTUFBTSxjQUFjLEdBQUksQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDO0FBQ3ZDLE9BQU8sTUFBTSxnQkFBZ0IsR0FBSSxDQUFDLElBQUksQ0FBQyxBQUFDLENBQUM7QUFFekMsT0FBTyxNQUFNLGtCQUFrQixTQUFTLFNBQVM7SUFDL0MsUUFBUSxDQUlFO0lBQ1YsTUFBTSxDQUFVO0lBQ2hCLFFBQVEsQ0FBVTtJQUNsQixVQUFVLENBQXFEO0lBRS9ELGFBQWM7UUFDWixLQUFLLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDekM7Q0FDRDtBQUVELE9BQU8sU0FBUyxXQUFXLENBQ3pCLEdBQXVCLEVBQ3ZCLFFBQWdCLEVBQ2hCLE1BQWMsRUFDZCxNQUFjLEVBQ2QsUUFBaUIsRUFDakI7SUFDQSxDQUFDLFVBQVk7UUFDWCxNQUFNLFNBQVMsR0FBYSxFQUFFLEFBQUM7UUFFL0IsMkJBQTJCO1FBQzNCLHVFQUF1RTtRQUV2RSxNQUFNLFdBQVcsR0FBcUIsRUFBRSxBQUFDO1FBRXpDLElBQUksTUFBTSxLQUFLLENBQUMsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUNELElBQUksTUFBTSxLQUFLLENBQUMsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVELE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FDdEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsR0FDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFLO2dCQUN0RCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0RCxDQUFDLENBQUMsQ0FDSCxDQUNGLENBQUM7UUFFRixNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxBQUFDLEFBQUM7UUFFbkUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxHQUFhO2dCQUMvQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDYixPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNaLE9BQU8sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3BCLE9BQU8sQ0FBQyxDQUFDO2dCQUNYLENBQUM7Z0JBRUQsT0FBTyxDQUFDLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNuQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ1AsQ0FBQyJ9