// Copyright 2018-2022 the oak authors. All rights reserved. MIT license.
const maybeUpgradeWebSocket = "upgradeWebSocket" in Deno ? Deno.upgradeWebSocket.bind(Deno) : undefined;
/** An abstraction which wraps a {@linkcode Request} from Deno's flash server.
 * The constructor takes a {@linkcode Deferred} which it will resolve when the
 * response is ready.
 *
 * This request can be used in situations where there isn't a specific method
 * to respond with, but where a `Promise<Response>` is accepted as a value. It
 * is specifically designed to work with Deno's flash server.
 */ export class HttpRequest {
    #deferred;
    #request;
    #resolved = false;
    #upgradeWebSocket;
    get remoteAddr() {
        return undefined;
    }
    get headers() {
        return this.#request.headers;
    }
    get method() {
        return this.#request.method;
    }
    get url() {
        try {
            const url = new URL(this.#request.url);
            return this.#request.url.replace(url.origin, "");
        } catch  {
        // we don't care about errors, we just want to fall back
        }
        return this.#request.url;
    }
    constructor(request, deferred, upgradeWebSocket){
        this.#deferred = deferred;
        this.#request = request;
        this.#upgradeWebSocket = upgradeWebSocket ?? maybeUpgradeWebSocket;
    }
    // deno-lint-ignore no-explicit-any
    error(reason) {
        if (this.#resolved) {
            throw new Error("Request already responded to.");
        }
        this.#deferred.reject(reason);
        this.#resolved = true;
    }
    getBody() {
        return {
            body: this.#request.body,
            readBody: async ()=>{
                const ab = await this.#request.arrayBuffer();
                return new Uint8Array(ab);
            }
        };
    }
    respond(response) {
        if (this.#resolved) {
            throw new Error("Request already responded to.");
        }
        this.#deferred.resolve(response);
        this.#resolved = true;
        return Promise.resolve();
    }
    upgrade(options) {
        if (this.#resolved) {
            throw new Error("Request already responded to.");
        }
        if (!this.#upgradeWebSocket) {
            throw new TypeError("Upgrading web sockets not supported.");
        }
        const { response , socket  } = this.#upgradeWebSocket(this.#request, options);
        this.#deferred.resolve(response);
        return socket;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvb2FrQHYxMS4xLjAvaHR0cF9yZXF1ZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIG9hayBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgdHlwZSBEZWZlcnJlZCB9IGZyb20gXCIuL2RlcHMudHNcIjtcbmltcG9ydCB0eXBlIHtcbiAgU2VydmVyUmVxdWVzdCxcbiAgU2VydmVyUmVxdWVzdEJvZHksXG4gIFVwZ3JhZGVXZWJTb2NrZXRGbixcbiAgVXBncmFkZVdlYlNvY2tldE9wdGlvbnMsXG59IGZyb20gXCIuL3R5cGVzLmQudHNcIjtcblxuY29uc3QgbWF5YmVVcGdyYWRlV2ViU29ja2V0OiBVcGdyYWRlV2ViU29ja2V0Rm4gfCB1bmRlZmluZWQgPVxuICBcInVwZ3JhZGVXZWJTb2NrZXRcIiBpbiBEZW5vXG4gICAgPyAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAgICAgKERlbm8gYXMgYW55KS51cGdyYWRlV2ViU29ja2V0LmJpbmQoRGVubylcbiAgICA6IHVuZGVmaW5lZDtcblxuLyoqIEFuIGFic3RyYWN0aW9uIHdoaWNoIHdyYXBzIGEge0BsaW5rY29kZSBSZXF1ZXN0fSBmcm9tIERlbm8ncyBmbGFzaCBzZXJ2ZXIuXG4gKiBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSB7QGxpbmtjb2RlIERlZmVycmVkfSB3aGljaCBpdCB3aWxsIHJlc29sdmUgd2hlbiB0aGVcbiAqIHJlc3BvbnNlIGlzIHJlYWR5LlxuICpcbiAqIFRoaXMgcmVxdWVzdCBjYW4gYmUgdXNlZCBpbiBzaXR1YXRpb25zIHdoZXJlIHRoZXJlIGlzbid0IGEgc3BlY2lmaWMgbWV0aG9kXG4gKiB0byByZXNwb25kIHdpdGgsIGJ1dCB3aGVyZSBhIGBQcm9taXNlPFJlc3BvbnNlPmAgaXMgYWNjZXB0ZWQgYXMgYSB2YWx1ZS4gSXRcbiAqIGlzIHNwZWNpZmljYWxseSBkZXNpZ25lZCB0byB3b3JrIHdpdGggRGVubydzIGZsYXNoIHNlcnZlci5cbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBSZXF1ZXN0IGltcGxlbWVudHMgU2VydmVyUmVxdWVzdCB7XG4gICNkZWZlcnJlZDogRGVmZXJyZWQ8UmVzcG9uc2U+O1xuICAjcmVxdWVzdDogUmVxdWVzdDtcbiAgI3Jlc29sdmVkID0gZmFsc2U7XG4gICN1cGdyYWRlV2ViU29ja2V0PzogVXBncmFkZVdlYlNvY2tldEZuO1xuXG4gIGdldCByZW1vdGVBZGRyKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGdldCBoZWFkZXJzKCk6IEhlYWRlcnMge1xuICAgIHJldHVybiB0aGlzLiNyZXF1ZXN0LmhlYWRlcnM7XG4gIH1cblxuICBnZXQgbWV0aG9kKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI3JlcXVlc3QubWV0aG9kO1xuICB9XG5cbiAgZ2V0IHVybCgpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHRoaXMuI3JlcXVlc3QudXJsKTtcbiAgICAgIHJldHVybiB0aGlzLiNyZXF1ZXN0LnVybC5yZXBsYWNlKHVybC5vcmlnaW4sIFwiXCIpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gd2UgZG9uJ3QgY2FyZSBhYm91dCBlcnJvcnMsIHdlIGp1c3Qgd2FudCB0byBmYWxsIGJhY2tcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuI3JlcXVlc3QudXJsO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVxdWVzdDogUmVxdWVzdCxcbiAgICBkZWZlcnJlZDogRGVmZXJyZWQ8UmVzcG9uc2U+LFxuICAgIHVwZ3JhZGVXZWJTb2NrZXQ/OiBVcGdyYWRlV2ViU29ja2V0Rm4sXG4gICkge1xuICAgIHRoaXMuI2RlZmVycmVkID0gZGVmZXJyZWQ7XG4gICAgdGhpcy4jcmVxdWVzdCA9IHJlcXVlc3Q7XG4gICAgdGhpcy4jdXBncmFkZVdlYlNvY2tldCA9IHVwZ3JhZGVXZWJTb2NrZXQgPz8gbWF5YmVVcGdyYWRlV2ViU29ja2V0O1xuICB9XG5cbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgZXJyb3IocmVhc29uPzogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuI3Jlc29sdmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXF1ZXN0IGFscmVhZHkgcmVzcG9uZGVkIHRvLlwiKTtcbiAgICB9XG4gICAgdGhpcy4jZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XG4gICAgdGhpcy4jcmVzb2x2ZWQgPSB0cnVlO1xuICB9XG5cbiAgZ2V0Qm9keSgpOiBTZXJ2ZXJSZXF1ZXN0Qm9keSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJvZHk6IHRoaXMuI3JlcXVlc3QuYm9keSxcbiAgICAgIHJlYWRCb2R5OiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiID0gYXdhaXQgdGhpcy4jcmVxdWVzdC5hcnJheUJ1ZmZlcigpO1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYWIpO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgcmVzcG9uZChyZXNwb25zZTogUmVzcG9uc2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy4jcmVzb2x2ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlcXVlc3QgYWxyZWFkeSByZXNwb25kZWQgdG8uXCIpO1xuICAgIH1cbiAgICB0aGlzLiNkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICB0aGlzLiNyZXNvbHZlZCA9IHRydWU7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgdXBncmFkZShvcHRpb25zPzogVXBncmFkZVdlYlNvY2tldE9wdGlvbnMpOiBXZWJTb2NrZXQge1xuICAgIGlmICh0aGlzLiNyZXNvbHZlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVxdWVzdCBhbHJlYWR5IHJlc3BvbmRlZCB0by5cIik7XG4gICAgfVxuICAgIGlmICghdGhpcy4jdXBncmFkZVdlYlNvY2tldCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVwZ3JhZGluZyB3ZWIgc29ja2V0cyBub3Qgc3VwcG9ydGVkLlwiKTtcbiAgICB9XG4gICAgY29uc3QgeyByZXNwb25zZSwgc29ja2V0IH0gPSB0aGlzLiN1cGdyYWRlV2ViU29ja2V0KHRoaXMuI3JlcXVlc3QsIG9wdGlvbnMpO1xuICAgIHRoaXMuI2RlZmVycmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgIHJldHVybiBzb2NrZXQ7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5RUFBeUU7QUFVekUsTUFBTSxxQkFBcUIsR0FDekIsa0JBQWtCLElBQUksSUFBSSxHQUV0QixBQUFDLElBQUksQ0FBUyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQ3pDLFNBQVMsQUFBQztBQUVoQjs7Ozs7OztDQU9DLEdBQ0QsT0FBTyxNQUFNLFdBQVc7SUFDdEIsQ0FBQyxRQUFRLENBQXFCO0lBQzlCLENBQUMsT0FBTyxDQUFVO0lBQ2xCLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUNsQixDQUFDLGdCQUFnQixDQUFzQjtRQUVuQyxVQUFVLEdBQXVCO1FBQ25DLE9BQU8sU0FBUyxDQUFDO0lBQ25CO1FBRUksT0FBTyxHQUFZO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztJQUMvQjtRQUVJLE1BQU0sR0FBVztRQUNuQixPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDOUI7UUFFSSxHQUFHLEdBQVc7UUFDaEIsSUFBSTtZQUNGLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQUFBQztZQUN2QyxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkQsRUFBRSxPQUFNO1FBQ04sd0RBQXdEO1FBQzFELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFDM0I7SUFFQSxZQUNFLE9BQWdCLEVBQ2hCLFFBQTRCLEVBQzVCLGdCQUFxQyxDQUNyQztRQUNBLElBQUksQ0FBQyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsSUFBSSxxQkFBcUIsQ0FBQztJQUNyRTtJQUVBLG1DQUFtQztJQUNuQyxLQUFLLENBQUMsTUFBWSxFQUFRO1FBQ3hCLElBQUksSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3hCO0lBRUEsT0FBTyxHQUFzQjtRQUMzQixPQUFPO1lBQ0wsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJO1lBQ3hCLFFBQVEsRUFBRSxVQUFZO2dCQUNwQixNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQUFBQztnQkFDN0MsT0FBTyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1QixDQUFDO1NBQ0YsQ0FBQztJQUNKO0lBRUEsT0FBTyxDQUFDLFFBQWtCLEVBQWlCO1FBQ3pDLElBQUksSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzNCO0lBRUEsT0FBTyxDQUFDLE9BQWlDLEVBQWE7UUFDcEQsSUFBSSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUU7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7WUFDM0IsTUFBTSxJQUFJLFNBQVMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFDRCxNQUFNLEVBQUUsUUFBUSxDQUFBLEVBQUUsTUFBTSxDQUFBLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEFBQUM7UUFDNUUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxPQUFPLE1BQU0sQ0FBQztJQUNoQjtDQUNEIn0=