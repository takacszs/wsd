// Copyright 2018-2022 the oak authors. All rights reserved. MIT license.
import { contentType, Status, STATUS_TEXT } from "./deps.ts";
import { DomResponse } from "./http_server_native_request.ts";
import { BODY_TYPES, encodeUrl, isAsyncIterable, isHtml, isReader, isRedirectStatus, readableStreamFromAsyncIterable, readableStreamFromReader, Uint8ArrayTransformStream } from "./util.ts";
/** A symbol that indicates to `response.redirect()` to attempt to redirect
 * back to the request referrer.  For example:
 *
 * ```ts
 * import { Application, REDIRECT_BACK } from "https://deno.land/x/oak/mod.ts";
 *
 * const app = new Application();
 *
 * app.use((ctx) => {
 *   if (ctx.request.url.pathName === "/back") {
 *     ctx.response.redirect(REDIRECT_BACK, "/");
 *   }
 * });
 *
 * await app.listen({ port: 80 });
 * ```
 */ export const REDIRECT_BACK = Symbol("redirect backwards");
export async function convertBodyToBodyInit(body, type, jsonBodyReplacer) {
    let result;
    if (BODY_TYPES.includes(typeof body)) {
        result = String(body);
        type = type ?? (isHtml(result) ? "html" : "text/plain");
    } else if (isReader(body)) {
        result = readableStreamFromReader(body);
    } else if (ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof Blob || body instanceof URLSearchParams) {
        // deno-lint-ignore no-explicit-any
        result = body;
    } else if (body instanceof ReadableStream) {
        result = body.pipeThrough(new Uint8ArrayTransformStream());
    } else if (body instanceof FormData) {
        result = body;
        type = "multipart/form-data";
    } else if (isAsyncIterable(body)) {
        result = readableStreamFromAsyncIterable(body);
    } else if (body && typeof body === "object") {
        result = JSON.stringify(body, jsonBodyReplacer);
        type = type ?? "json";
    } else if (typeof body === "function") {
        const result1 = body.call(null);
        return convertBodyToBodyInit(await result1, type, jsonBodyReplacer);
    } else if (body) {
        throw new TypeError("Response body was set but could not be converted.");
    }
    return [
        result,
        type
    ];
}
/** An interface to control what response will be sent when the middleware
 * finishes processing the request.
 *
 * The response is usually accessed via the context's `.response` property.
 *
 * ### Example
 *
 * ```ts
 * import { Application, Status } from "https://deno.land/x/oak/mod.ts";
 *
 * const app = new Application();
 *
 * app.use((ctx) => {
 *   ctx.response.body = { hello: "oak" };
 *   ctx.response.type = "json";
 *   ctx.response.status = Status.OK;
 * });
 * ```
 */ export class Response {
    #body;
    #bodySet = false;
    #domResponse;
    #headers = new Headers();
    #jsonBodyReplacer;
    #request;
    #resources = [];
    #status;
    #type;
    #writable = true;
    async #getBodyInit() {
        const [body, type] = await convertBodyToBodyInit(this.body, this.type, this.#jsonBodyReplacer);
        this.type = type;
        return body;
    }
    #setContentType() {
        if (this.type) {
            const contentTypeString = contentType(this.type);
            if (contentTypeString && !this.headers.has("Content-Type")) {
                this.headers.append("Content-Type", contentTypeString);
            }
        }
    }
    /** The body of the response.  The body will be automatically processed when
   * the response is being sent and converted to a `Uint8Array` or a
   * `Deno.Reader`.
   *
   * Automatic conversion to a `Deno.Reader` occurs for async iterables. */ get body() {
        return this.#body;
    }
    /** The body of the response.  The body will be automatically processed when
   * the response is being sent and converted to a `Uint8Array` or a
   * `Deno.Reader`.
   *
   * Automatic conversion to a `Deno.Reader` occurs for async iterables. */ set body(value) {
        if (!this.#writable) {
            throw new Error("The response is not writable.");
        }
        this.#bodySet = true;
        this.#body = value;
    }
    /** Headers that will be returned in the response. */ get headers() {
        return this.#headers;
    }
    /** Headers that will be returned in the response. */ set headers(value) {
        if (!this.#writable) {
            throw new Error("The response is not writable.");
        }
        this.#headers = value;
    }
    /** The HTTP status of the response.  If this has not been explicitly set,
   * reading the value will return what would be the value of status if the
   * response were sent at this point in processing the middleware.  If the body
   * has been set, the status will be `200 OK`.  If a value for the body has
   * not been set yet, the status will be `404 Not Found`. */ get status() {
        if (this.#status) {
            return this.#status;
        }
        return this.body != null ? Status.OK : this.#bodySet ? Status.NoContent : Status.NotFound;
    }
    /** The HTTP status of the response.  If this has not been explicitly set,
   * reading the value will return what would be the value of status if the
   * response were sent at this point in processing the middleware.  If the body
   * has been set, the status will be `200 OK`.  If a value for the body has
   * not been set yet, the status will be `404 Not Found`. */ set status(value) {
        if (!this.#writable) {
            throw new Error("The response is not writable.");
        }
        this.#status = value;
    }
    /** The media type, or extension of the response.  Setting this value will
   * ensure an appropriate `Content-Type` header is added to the response. */ get type() {
        return this.#type;
    }
    /** The media type, or extension of the response.  Setting this value will
   * ensure an appropriate `Content-Type` header is added to the response. */ set type(value) {
        if (!this.#writable) {
            throw new Error("The response is not writable.");
        }
        this.#type = value;
    }
    /** A read-only property which determines if the response is writable or not.
   * Once the response has been processed, this value is set to `false`. */ get writable() {
        return this.#writable;
    }
    constructor(request, jsonBodyReplacer){
        this.#request = request;
        this.#jsonBodyReplacer = jsonBodyReplacer;
    }
    /** Add a resource to the list of resources that will be closed when the
   * request is destroyed. */ addResource(rid) {
        this.#resources.push(rid);
    }
    /** Release any resources that are being tracked by the response.
   *
   * @param closeResources close any resource IDs registered with the response
   */ destroy(closeResources = true) {
        this.#writable = false;
        this.#body = undefined;
        this.#domResponse = undefined;
        if (closeResources) {
            for (const rid of this.#resources){
                try {
                    Deno.close(rid);
                } catch  {
                // we don't care about errors here
                }
            }
        }
    }
    redirect(url, alt = "/") {
        if (url === REDIRECT_BACK) {
            url = this.#request.headers.get("Referer") ?? String(alt);
        } else if (typeof url === "object") {
            url = String(url);
        }
        this.headers.set("Location", encodeUrl(url));
        if (!this.status || !isRedirectStatus(this.status)) {
            this.status = Status.Found;
        }
        if (this.#request.accepts("html")) {
            url = encodeURI(url);
            this.type = "text/html; charset=UTF-8";
            this.body = `Redirecting to <a href="${url}">${url}</a>.`;
            return;
        }
        this.type = "text/plain; charset=UTF-8";
        this.body = `Redirecting to ${url}.`;
    }
    async toDomResponse() {
        if (this.#domResponse) {
            return this.#domResponse;
        }
        const bodyInit = await this.#getBodyInit();
        this.#setContentType();
        const { headers  } = this;
        // If there is no body and no content type and no set length, then set the
        // content length to 0
        if (!(bodyInit || headers.has("Content-Type") || headers.has("Content-Length"))) {
            headers.append("Content-Length", "0");
        }
        this.#writable = false;
        const status = this.status;
        const responseInit = {
            headers,
            status,
            statusText: STATUS_TEXT[status]
        };
        return this.#domResponse = new DomResponse(bodyInit, responseInit);
    }
    [Symbol.for("Deno.customInspect")](inspect) {
        const { body , headers , status , type , writable  } = this;
        return `${this.constructor.name} ${inspect({
            body,
            headers,
            status,
            type,
            writable
        })}`;
    }
    [Symbol.for("nodejs.util.inspect.custom")](depth, // deno-lint-ignore no-explicit-any
    options, inspect) {
        if (depth < 0) {
            return options.stylize(`[${this.constructor.name}]`, "special");
        }
        const newOptions = Object.assign({}, options, {
            depth: options.depth === null ? null : options.depth - 1
        });
        const { body , headers , status , type , writable  } = this;
        return `${options.stylize(this.constructor.name, "special")} ${inspect({
            body,
            headers,
            status,
            type,
            writable
        }, newOptions)}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvb2FrQHYxMS4xLjAvcmVzcG9uc2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiB0aGUgb2FrIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBjb250ZW50VHlwZSwgU3RhdHVzLCBTVEFUVVNfVEVYVCB9IGZyb20gXCIuL2RlcHMudHNcIjtcbmltcG9ydCB7IERvbVJlc3BvbnNlIH0gZnJvbSBcIi4vaHR0cF9zZXJ2ZXJfbmF0aXZlX3JlcXVlc3QudHNcIjtcbmltcG9ydCB0eXBlIHsgUmVxdWVzdCB9IGZyb20gXCIuL3JlcXVlc3QudHNcIjtcbmltcG9ydCB7XG4gIEJPRFlfVFlQRVMsXG4gIGVuY29kZVVybCxcbiAgaXNBc3luY0l0ZXJhYmxlLFxuICBpc0h0bWwsXG4gIGlzUmVhZGVyLFxuICBpc1JlZGlyZWN0U3RhdHVzLFxuICByZWFkYWJsZVN0cmVhbUZyb21Bc3luY0l0ZXJhYmxlLFxuICByZWFkYWJsZVN0cmVhbUZyb21SZWFkZXIsXG4gIFVpbnQ4QXJyYXlUcmFuc2Zvcm1TdHJlYW0sXG59IGZyb20gXCIuL3V0aWwudHNcIjtcblxuZXhwb3J0IHR5cGUgUmVzcG9uc2VCb2R5ID1cbiAgfCBzdHJpbmdcbiAgfCBudW1iZXJcbiAgfCBiaWdpbnRcbiAgfCBib29sZWFuXG4gIHwgc3ltYm9sXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgYmFuLXR5cGVzXG4gIHwgb2JqZWN0XG4gIHwgdW5kZWZpbmVkXG4gIHwgbnVsbDtcbmV4cG9ydCB0eXBlIFJlc3BvbnNlQm9keUZ1bmN0aW9uID0gKCkgPT4gUmVzcG9uc2VCb2R5IHwgUHJvbWlzZTxSZXNwb25zZUJvZHk+O1xuXG4vKiogQSBzeW1ib2wgdGhhdCBpbmRpY2F0ZXMgdG8gYHJlc3BvbnNlLnJlZGlyZWN0KClgIHRvIGF0dGVtcHQgdG8gcmVkaXJlY3RcbiAqIGJhY2sgdG8gdGhlIHJlcXVlc3QgcmVmZXJyZXIuICBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQXBwbGljYXRpb24sIFJFRElSRUNUX0JBQ0sgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9vYWsvbW9kLnRzXCI7XG4gKlxuICogY29uc3QgYXBwID0gbmV3IEFwcGxpY2F0aW9uKCk7XG4gKlxuICogYXBwLnVzZSgoY3R4KSA9PiB7XG4gKiAgIGlmIChjdHgucmVxdWVzdC51cmwucGF0aE5hbWUgPT09IFwiL2JhY2tcIikge1xuICogICAgIGN0eC5yZXNwb25zZS5yZWRpcmVjdChSRURJUkVDVF9CQUNLLCBcIi9cIik7XG4gKiAgIH1cbiAqIH0pO1xuICpcbiAqIGF3YWl0IGFwcC5saXN0ZW4oeyBwb3J0OiA4MCB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUkVESVJFQ1RfQkFDSyA9IFN5bWJvbChcInJlZGlyZWN0IGJhY2t3YXJkc1wiKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbnZlcnRCb2R5VG9Cb2R5SW5pdChcbiAgYm9keTogUmVzcG9uc2VCb2R5IHwgUmVzcG9uc2VCb2R5RnVuY3Rpb24sXG4gIHR5cGU/OiBzdHJpbmcsXG4gIGpzb25Cb2R5UmVwbGFjZXI/OiAoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSA9PiB1bmtub3duLFxuKTogUHJvbWlzZTxbZ2xvYmFsVGhpcy5Cb2R5SW5pdCB8IHVuZGVmaW5lZCwgc3RyaW5nIHwgdW5kZWZpbmVkXT4ge1xuICBsZXQgcmVzdWx0OiBnbG9iYWxUaGlzLkJvZHlJbml0IHwgdW5kZWZpbmVkO1xuICBpZiAoQk9EWV9UWVBFUy5pbmNsdWRlcyh0eXBlb2YgYm9keSkpIHtcbiAgICByZXN1bHQgPSBTdHJpbmcoYm9keSk7XG4gICAgdHlwZSA9IHR5cGUgPz8gKGlzSHRtbChyZXN1bHQpID8gXCJodG1sXCIgOiBcInRleHQvcGxhaW5cIik7XG4gIH0gZWxzZSBpZiAoaXNSZWFkZXIoYm9keSkpIHtcbiAgICByZXN1bHQgPSByZWFkYWJsZVN0cmVhbUZyb21SZWFkZXIoYm9keSk7XG4gIH0gZWxzZSBpZiAoXG4gICAgQXJyYXlCdWZmZXIuaXNWaWV3KGJvZHkpIHx8IGJvZHkgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciB8fFxuICAgIGJvZHkgaW5zdGFuY2VvZiBCbG9iIHx8IGJvZHkgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXNcbiAgKSB7XG4gICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICByZXN1bHQgPSBib2R5IGFzIGFueTtcbiAgfSBlbHNlIGlmIChib2R5IGluc3RhbmNlb2YgUmVhZGFibGVTdHJlYW0pIHtcbiAgICByZXN1bHQgPSBib2R5LnBpcGVUaHJvdWdoKG5ldyBVaW50OEFycmF5VHJhbnNmb3JtU3RyZWFtKCkpO1xuICB9IGVsc2UgaWYgKGJvZHkgaW5zdGFuY2VvZiBGb3JtRGF0YSkge1xuICAgIHJlc3VsdCA9IGJvZHk7XG4gICAgdHlwZSA9IFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiO1xuICB9IGVsc2UgaWYgKGlzQXN5bmNJdGVyYWJsZShib2R5KSkge1xuICAgIHJlc3VsdCA9IHJlYWRhYmxlU3RyZWFtRnJvbUFzeW5jSXRlcmFibGUoYm9keSk7XG4gIH0gZWxzZSBpZiAoYm9keSAmJiB0eXBlb2YgYm9keSA9PT0gXCJvYmplY3RcIikge1xuICAgIHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KGJvZHksIGpzb25Cb2R5UmVwbGFjZXIpO1xuICAgIHR5cGUgPSB0eXBlID8/IFwianNvblwiO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBjb25zdCByZXN1bHQgPSBib2R5LmNhbGwobnVsbCk7XG4gICAgcmV0dXJuIGNvbnZlcnRCb2R5VG9Cb2R5SW5pdChhd2FpdCByZXN1bHQsIHR5cGUsIGpzb25Cb2R5UmVwbGFjZXIpO1xuICB9IGVsc2UgaWYgKGJvZHkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVzcG9uc2UgYm9keSB3YXMgc2V0IGJ1dCBjb3VsZCBub3QgYmUgY29udmVydGVkLlwiKTtcbiAgfVxuICByZXR1cm4gW3Jlc3VsdCwgdHlwZV07XG59XG5cbi8qKiBBbiBpbnRlcmZhY2UgdG8gY29udHJvbCB3aGF0IHJlc3BvbnNlIHdpbGwgYmUgc2VudCB3aGVuIHRoZSBtaWRkbGV3YXJlXG4gKiBmaW5pc2hlcyBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LlxuICpcbiAqIFRoZSByZXNwb25zZSBpcyB1c3VhbGx5IGFjY2Vzc2VkIHZpYSB0aGUgY29udGV4dCdzIGAucmVzcG9uc2VgIHByb3BlcnR5LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IEFwcGxpY2F0aW9uLCBTdGF0dXMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9vYWsvbW9kLnRzXCI7XG4gKlxuICogY29uc3QgYXBwID0gbmV3IEFwcGxpY2F0aW9uKCk7XG4gKlxuICogYXBwLnVzZSgoY3R4KSA9PiB7XG4gKiAgIGN0eC5yZXNwb25zZS5ib2R5ID0geyBoZWxsbzogXCJvYWtcIiB9O1xuICogICBjdHgucmVzcG9uc2UudHlwZSA9IFwianNvblwiO1xuICogICBjdHgucmVzcG9uc2Uuc3RhdHVzID0gU3RhdHVzLk9LO1xuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJlc3BvbnNlIHtcbiAgI2JvZHk/OiBSZXNwb25zZUJvZHkgfCBSZXNwb25zZUJvZHlGdW5jdGlvbjtcbiAgI2JvZHlTZXQgPSBmYWxzZTtcbiAgI2RvbVJlc3BvbnNlPzogZ2xvYmFsVGhpcy5SZXNwb25zZTtcbiAgI2hlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICAjanNvbkJvZHlSZXBsYWNlcj86IChrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pID0+IHVua25vd247XG4gICNyZXF1ZXN0OiBSZXF1ZXN0O1xuICAjcmVzb3VyY2VzOiBudW1iZXJbXSA9IFtdO1xuICAjc3RhdHVzPzogU3RhdHVzO1xuICAjdHlwZT86IHN0cmluZztcbiAgI3dyaXRhYmxlID0gdHJ1ZTtcblxuICBhc3luYyAjZ2V0Qm9keUluaXQoKTogUHJvbWlzZTxnbG9iYWxUaGlzLkJvZHlJbml0IHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgW2JvZHksIHR5cGVdID0gYXdhaXQgY29udmVydEJvZHlUb0JvZHlJbml0KFxuICAgICAgdGhpcy5ib2R5LFxuICAgICAgdGhpcy50eXBlLFxuICAgICAgdGhpcy4janNvbkJvZHlSZXBsYWNlcixcbiAgICApO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cblxuICAjc2V0Q29udGVudFR5cGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudHlwZSkge1xuICAgICAgY29uc3QgY29udGVudFR5cGVTdHJpbmcgPSBjb250ZW50VHlwZSh0aGlzLnR5cGUpO1xuICAgICAgaWYgKGNvbnRlbnRUeXBlU3RyaW5nICYmICF0aGlzLmhlYWRlcnMuaGFzKFwiQ29udGVudC1UeXBlXCIpKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycy5hcHBlbmQoXCJDb250ZW50LVR5cGVcIiwgY29udGVudFR5cGVTdHJpbmcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgYm9keSBvZiB0aGUgcmVzcG9uc2UuICBUaGUgYm9keSB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgcHJvY2Vzc2VkIHdoZW5cbiAgICogdGhlIHJlc3BvbnNlIGlzIGJlaW5nIHNlbnQgYW5kIGNvbnZlcnRlZCB0byBhIGBVaW50OEFycmF5YCBvciBhXG4gICAqIGBEZW5vLlJlYWRlcmAuXG4gICAqXG4gICAqIEF1dG9tYXRpYyBjb252ZXJzaW9uIHRvIGEgYERlbm8uUmVhZGVyYCBvY2N1cnMgZm9yIGFzeW5jIGl0ZXJhYmxlcy4gKi9cbiAgZ2V0IGJvZHkoKTogUmVzcG9uc2VCb2R5IHwgUmVzcG9uc2VCb2R5RnVuY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLiNib2R5O1xuICB9XG5cbiAgLyoqIFRoZSBib2R5IG9mIHRoZSByZXNwb25zZS4gIFRoZSBib2R5IHdpbGwgYmUgYXV0b21hdGljYWxseSBwcm9jZXNzZWQgd2hlblxuICAgKiB0aGUgcmVzcG9uc2UgaXMgYmVpbmcgc2VudCBhbmQgY29udmVydGVkIHRvIGEgYFVpbnQ4QXJyYXlgIG9yIGFcbiAgICogYERlbm8uUmVhZGVyYC5cbiAgICpcbiAgICogQXV0b21hdGljIGNvbnZlcnNpb24gdG8gYSBgRGVuby5SZWFkZXJgIG9jY3VycyBmb3IgYXN5bmMgaXRlcmFibGVzLiAqL1xuICBzZXQgYm9keSh2YWx1ZTogUmVzcG9uc2VCb2R5IHwgUmVzcG9uc2VCb2R5RnVuY3Rpb24pIHtcbiAgICBpZiAoIXRoaXMuI3dyaXRhYmxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgcmVzcG9uc2UgaXMgbm90IHdyaXRhYmxlLlwiKTtcbiAgICB9XG4gICAgdGhpcy4jYm9keVNldCA9IHRydWU7XG4gICAgdGhpcy4jYm9keSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqIEhlYWRlcnMgdGhhdCB3aWxsIGJlIHJldHVybmVkIGluIHRoZSByZXNwb25zZS4gKi9cbiAgZ2V0IGhlYWRlcnMoKTogSGVhZGVycyB7XG4gICAgcmV0dXJuIHRoaXMuI2hlYWRlcnM7XG4gIH1cblxuICAvKiogSGVhZGVycyB0aGF0IHdpbGwgYmUgcmV0dXJuZWQgaW4gdGhlIHJlc3BvbnNlLiAqL1xuICBzZXQgaGVhZGVycyh2YWx1ZTogSGVhZGVycykge1xuICAgIGlmICghdGhpcy4jd3JpdGFibGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSByZXNwb25zZSBpcyBub3Qgd3JpdGFibGUuXCIpO1xuICAgIH1cbiAgICB0aGlzLiNoZWFkZXJzID0gdmFsdWU7XG4gIH1cblxuICAvKiogVGhlIEhUVFAgc3RhdHVzIG9mIHRoZSByZXNwb25zZS4gIElmIHRoaXMgaGFzIG5vdCBiZWVuIGV4cGxpY2l0bHkgc2V0LFxuICAgKiByZWFkaW5nIHRoZSB2YWx1ZSB3aWxsIHJldHVybiB3aGF0IHdvdWxkIGJlIHRoZSB2YWx1ZSBvZiBzdGF0dXMgaWYgdGhlXG4gICAqIHJlc3BvbnNlIHdlcmUgc2VudCBhdCB0aGlzIHBvaW50IGluIHByb2Nlc3NpbmcgdGhlIG1pZGRsZXdhcmUuICBJZiB0aGUgYm9keVxuICAgKiBoYXMgYmVlbiBzZXQsIHRoZSBzdGF0dXMgd2lsbCBiZSBgMjAwIE9LYC4gIElmIGEgdmFsdWUgZm9yIHRoZSBib2R5IGhhc1xuICAgKiBub3QgYmVlbiBzZXQgeWV0LCB0aGUgc3RhdHVzIHdpbGwgYmUgYDQwNCBOb3QgRm91bmRgLiAqL1xuICBnZXQgc3RhdHVzKCk6IFN0YXR1cyB7XG4gICAgaWYgKHRoaXMuI3N0YXR1cykge1xuICAgICAgcmV0dXJuIHRoaXMuI3N0YXR1cztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYm9keSAhPSBudWxsXG4gICAgICA/IFN0YXR1cy5PS1xuICAgICAgOiB0aGlzLiNib2R5U2V0XG4gICAgICA/IFN0YXR1cy5Ob0NvbnRlbnRcbiAgICAgIDogU3RhdHVzLk5vdEZvdW5kO1xuICB9XG5cbiAgLyoqIFRoZSBIVFRQIHN0YXR1cyBvZiB0aGUgcmVzcG9uc2UuICBJZiB0aGlzIGhhcyBub3QgYmVlbiBleHBsaWNpdGx5IHNldCxcbiAgICogcmVhZGluZyB0aGUgdmFsdWUgd2lsbCByZXR1cm4gd2hhdCB3b3VsZCBiZSB0aGUgdmFsdWUgb2Ygc3RhdHVzIGlmIHRoZVxuICAgKiByZXNwb25zZSB3ZXJlIHNlbnQgYXQgdGhpcyBwb2ludCBpbiBwcm9jZXNzaW5nIHRoZSBtaWRkbGV3YXJlLiAgSWYgdGhlIGJvZHlcbiAgICogaGFzIGJlZW4gc2V0LCB0aGUgc3RhdHVzIHdpbGwgYmUgYDIwMCBPS2AuICBJZiBhIHZhbHVlIGZvciB0aGUgYm9keSBoYXNcbiAgICogbm90IGJlZW4gc2V0IHlldCwgdGhlIHN0YXR1cyB3aWxsIGJlIGA0MDQgTm90IEZvdW5kYC4gKi9cbiAgc2V0IHN0YXR1cyh2YWx1ZTogU3RhdHVzKSB7XG4gICAgaWYgKCF0aGlzLiN3cml0YWJsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHJlc3BvbnNlIGlzIG5vdCB3cml0YWJsZS5cIik7XG4gICAgfVxuICAgIHRoaXMuI3N0YXR1cyA9IHZhbHVlO1xuICB9XG5cbiAgLyoqIFRoZSBtZWRpYSB0eXBlLCBvciBleHRlbnNpb24gb2YgdGhlIHJlc3BvbnNlLiAgU2V0dGluZyB0aGlzIHZhbHVlIHdpbGxcbiAgICogZW5zdXJlIGFuIGFwcHJvcHJpYXRlIGBDb250ZW50LVR5cGVgIGhlYWRlciBpcyBhZGRlZCB0byB0aGUgcmVzcG9uc2UuICovXG4gIGdldCB0eXBlKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuI3R5cGU7XG4gIH1cbiAgLyoqIFRoZSBtZWRpYSB0eXBlLCBvciBleHRlbnNpb24gb2YgdGhlIHJlc3BvbnNlLiAgU2V0dGluZyB0aGlzIHZhbHVlIHdpbGxcbiAgICogZW5zdXJlIGFuIGFwcHJvcHJpYXRlIGBDb250ZW50LVR5cGVgIGhlYWRlciBpcyBhZGRlZCB0byB0aGUgcmVzcG9uc2UuICovXG4gIHNldCB0eXBlKHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAoIXRoaXMuI3dyaXRhYmxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgcmVzcG9uc2UgaXMgbm90IHdyaXRhYmxlLlwiKTtcbiAgICB9XG4gICAgdGhpcy4jdHlwZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqIEEgcmVhZC1vbmx5IHByb3BlcnR5IHdoaWNoIGRldGVybWluZXMgaWYgdGhlIHJlc3BvbnNlIGlzIHdyaXRhYmxlIG9yIG5vdC5cbiAgICogT25jZSB0aGUgcmVzcG9uc2UgaGFzIGJlZW4gcHJvY2Vzc2VkLCB0aGlzIHZhbHVlIGlzIHNldCB0byBgZmFsc2VgLiAqL1xuICBnZXQgd3JpdGFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuI3dyaXRhYmxlO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVxdWVzdDogUmVxdWVzdCxcbiAgICBqc29uQm9keVJlcGxhY2VyPzogKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikgPT4gdW5rbm93bixcbiAgKSB7XG4gICAgdGhpcy4jcmVxdWVzdCA9IHJlcXVlc3Q7XG4gICAgdGhpcy4janNvbkJvZHlSZXBsYWNlciA9IGpzb25Cb2R5UmVwbGFjZXI7XG4gIH1cblxuICAvKiogQWRkIGEgcmVzb3VyY2UgdG8gdGhlIGxpc3Qgb2YgcmVzb3VyY2VzIHRoYXQgd2lsbCBiZSBjbG9zZWQgd2hlbiB0aGVcbiAgICogcmVxdWVzdCBpcyBkZXN0cm95ZWQuICovXG4gIGFkZFJlc291cmNlKHJpZDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy4jcmVzb3VyY2VzLnB1c2gocmlkKTtcbiAgfVxuXG4gIC8qKiBSZWxlYXNlIGFueSByZXNvdXJjZXMgdGhhdCBhcmUgYmVpbmcgdHJhY2tlZCBieSB0aGUgcmVzcG9uc2UuXG4gICAqXG4gICAqIEBwYXJhbSBjbG9zZVJlc291cmNlcyBjbG9zZSBhbnkgcmVzb3VyY2UgSURzIHJlZ2lzdGVyZWQgd2l0aCB0aGUgcmVzcG9uc2VcbiAgICovXG4gIGRlc3Ryb3koY2xvc2VSZXNvdXJjZXMgPSB0cnVlKTogdm9pZCB7XG4gICAgdGhpcy4jd3JpdGFibGUgPSBmYWxzZTtcbiAgICB0aGlzLiNib2R5ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuI2RvbVJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgIGlmIChjbG9zZVJlc291cmNlcykge1xuICAgICAgZm9yIChjb25zdCByaWQgb2YgdGhpcy4jcmVzb3VyY2VzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgRGVuby5jbG9zZShyaWQpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyB3ZSBkb24ndCBjYXJlIGFib3V0IGVycm9ycyBoZXJlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgcmVzcG9uc2UgdG8gcmVkaXJlY3QgdG8gdGhlIHN1cHBsaWVkIGB1cmxgLlxuICAgKlxuICAgKiBJZiB0aGUgYC5zdGF0dXNgIGlzIG5vdCBjdXJyZW50bHkgYSByZWRpcmVjdCBzdGF0dXMsIHRoZSBzdGF0dXMgd2lsbCBiZSBzZXRcbiAgICogdG8gYDMwMiBGb3VuZGAuXG4gICAqXG4gICAqIFRoZSBib2R5IHdpbGwgYmUgc2V0IHRvIGEgbWVzc2FnZSBpbmRpY2F0aW5nIHRoZSByZWRpcmVjdGlvbiBpcyBvY2N1cnJpbmcuXG4gICAqL1xuICByZWRpcmVjdCh1cmw6IHN0cmluZyB8IFVSTCk6IHZvaWQ7XG4gIC8qKiBTZXRzIHRoZSByZXNwb25zZSB0byByZWRpcmVjdCBiYWNrIHRvIHRoZSByZWZlcnJlciBpZiBhdmFpbGFibGUsIHdpdGggYW5cbiAgICogb3B0aW9uYWwgYGFsdGAgVVJMIGlmIHRoZXJlIGlzIG5vIHJlZmVycmVyIGhlYWRlciBvbiB0aGUgcmVxdWVzdC4gIElmIHRoZXJlXG4gICAqIGlzIG5vIHJlZmVycmVyIGhlYWRlciwgbm9yIGFuIGBhbHRgIHBhcmFtZXRlciwgdGhlIHJlZGlyZWN0IGlzIHNldCB0byBgL2AuXG4gICAqXG4gICAqIElmIHRoZSBgLnN0YXR1c2AgaXMgbm90IGN1cnJlbnRseSBhIHJlZGlyZWN0IHN0YXR1cywgdGhlIHN0YXR1cyB3aWxsIGJlIHNldFxuICAgKiB0byBgMzAyIEZvdW5kYC5cbiAgICpcbiAgICogVGhlIGJvZHkgd2lsbCBiZSBzZXQgdG8gYSBtZXNzYWdlIGluZGljYXRpbmcgdGhlIHJlZGlyZWN0aW9uIGlzIG9jY3VycmluZy5cbiAgICovXG4gIHJlZGlyZWN0KHVybDogdHlwZW9mIFJFRElSRUNUX0JBQ0ssIGFsdD86IHN0cmluZyB8IFVSTCk6IHZvaWQ7XG4gIHJlZGlyZWN0KFxuICAgIHVybDogc3RyaW5nIHwgVVJMIHwgdHlwZW9mIFJFRElSRUNUX0JBQ0ssXG4gICAgYWx0OiBzdHJpbmcgfCBVUkwgPSBcIi9cIixcbiAgKTogdm9pZCB7XG4gICAgaWYgKHVybCA9PT0gUkVESVJFQ1RfQkFDSykge1xuICAgICAgdXJsID0gdGhpcy4jcmVxdWVzdC5oZWFkZXJzLmdldChcIlJlZmVyZXJcIikgPz8gU3RyaW5nKGFsdCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdXJsID09PSBcIm9iamVjdFwiKSB7XG4gICAgICB1cmwgPSBTdHJpbmcodXJsKTtcbiAgICB9XG4gICAgdGhpcy5oZWFkZXJzLnNldChcIkxvY2F0aW9uXCIsIGVuY29kZVVybCh1cmwpKTtcbiAgICBpZiAoIXRoaXMuc3RhdHVzIHx8ICFpc1JlZGlyZWN0U3RhdHVzKHRoaXMuc3RhdHVzKSkge1xuICAgICAgdGhpcy5zdGF0dXMgPSBTdGF0dXMuRm91bmQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuI3JlcXVlc3QuYWNjZXB0cyhcImh0bWxcIikpIHtcbiAgICAgIHVybCA9IGVuY29kZVVSSSh1cmwpO1xuICAgICAgdGhpcy50eXBlID0gXCJ0ZXh0L2h0bWw7IGNoYXJzZXQ9VVRGLThcIjtcbiAgICAgIHRoaXMuYm9keSA9IGBSZWRpcmVjdGluZyB0byA8YSBocmVmPVwiJHt1cmx9XCI+JHt1cmx9PC9hPi5gO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnR5cGUgPSBcInRleHQvcGxhaW47IGNoYXJzZXQ9VVRGLThcIjtcbiAgICB0aGlzLmJvZHkgPSBgUmVkaXJlY3RpbmcgdG8gJHt1cmx9LmA7XG4gIH1cblxuICBhc3luYyB0b0RvbVJlc3BvbnNlKCk6IFByb21pc2U8Z2xvYmFsVGhpcy5SZXNwb25zZT4ge1xuICAgIGlmICh0aGlzLiNkb21SZXNwb25zZSkge1xuICAgICAgcmV0dXJuIHRoaXMuI2RvbVJlc3BvbnNlO1xuICAgIH1cblxuICAgIGNvbnN0IGJvZHlJbml0ID0gYXdhaXQgdGhpcy4jZ2V0Qm9keUluaXQoKTtcblxuICAgIHRoaXMuI3NldENvbnRlbnRUeXBlKCk7XG5cbiAgICBjb25zdCB7IGhlYWRlcnMgfSA9IHRoaXM7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBubyBib2R5IGFuZCBubyBjb250ZW50IHR5cGUgYW5kIG5vIHNldCBsZW5ndGgsIHRoZW4gc2V0IHRoZVxuICAgIC8vIGNvbnRlbnQgbGVuZ3RoIHRvIDBcbiAgICBpZiAoXG4gICAgICAhKFxuICAgICAgICBib2R5SW5pdCB8fFxuICAgICAgICBoZWFkZXJzLmhhcyhcIkNvbnRlbnQtVHlwZVwiKSB8fFxuICAgICAgICBoZWFkZXJzLmhhcyhcIkNvbnRlbnQtTGVuZ3RoXCIpXG4gICAgICApXG4gICAgKSB7XG4gICAgICBoZWFkZXJzLmFwcGVuZChcIkNvbnRlbnQtTGVuZ3RoXCIsIFwiMFwiKTtcbiAgICB9XG5cbiAgICB0aGlzLiN3cml0YWJsZSA9IGZhbHNlO1xuXG4gICAgY29uc3Qgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gICAgY29uc3QgcmVzcG9uc2VJbml0OiBSZXNwb25zZUluaXQgPSB7XG4gICAgICBoZWFkZXJzLFxuICAgICAgc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogU1RBVFVTX1RFWFRbc3RhdHVzXSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuI2RvbVJlc3BvbnNlID0gbmV3IERvbVJlc3BvbnNlKGJvZHlJbml0LCByZXNwb25zZUluaXQpO1xuICB9XG5cbiAgW1N5bWJvbC5mb3IoXCJEZW5vLmN1c3RvbUluc3BlY3RcIildKGluc3BlY3Q6ICh2YWx1ZTogdW5rbm93bikgPT4gc3RyaW5nKSB7XG4gICAgY29uc3QgeyBib2R5LCBoZWFkZXJzLCBzdGF0dXMsIHR5cGUsIHdyaXRhYmxlIH0gPSB0aGlzO1xuICAgIHJldHVybiBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9ICR7XG4gICAgICBpbnNwZWN0KHsgYm9keSwgaGVhZGVycywgc3RhdHVzLCB0eXBlLCB3cml0YWJsZSB9KVxuICAgIH1gO1xuICB9XG5cbiAgW1N5bWJvbC5mb3IoXCJub2RlanMudXRpbC5pbnNwZWN0LmN1c3RvbVwiKV0oXG4gICAgZGVwdGg6IG51bWJlcixcbiAgICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAgIG9wdGlvbnM6IGFueSxcbiAgICBpbnNwZWN0OiAodmFsdWU6IHVua25vd24sIG9wdGlvbnM/OiB1bmtub3duKSA9PiBzdHJpbmcsXG4gICkge1xuICAgIGlmIChkZXB0aCA8IDApIHtcbiAgICAgIHJldHVybiBvcHRpb25zLnN0eWxpemUoYFske3RoaXMuY29uc3RydWN0b3IubmFtZX1dYCwgXCJzcGVjaWFsXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IG5ld09wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7XG4gICAgICBkZXB0aDogb3B0aW9ucy5kZXB0aCA9PT0gbnVsbCA/IG51bGwgOiBvcHRpb25zLmRlcHRoIC0gMSxcbiAgICB9KTtcbiAgICBjb25zdCB7IGJvZHksIGhlYWRlcnMsIHN0YXR1cywgdHlwZSwgd3JpdGFibGUgfSA9IHRoaXM7XG4gICAgcmV0dXJuIGAke29wdGlvbnMuc3R5bGl6ZSh0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIFwic3BlY2lhbFwiKX0gJHtcbiAgICAgIGluc3BlY3QoXG4gICAgICAgIHsgYm9keSwgaGVhZGVycywgc3RhdHVzLCB0eXBlLCB3cml0YWJsZSB9LFxuICAgICAgICBuZXdPcHRpb25zLFxuICAgICAgKVxuICAgIH1gO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUVBQXlFO0FBRXpFLFNBQVMsV0FBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLFFBQVEsV0FBVyxDQUFDO0FBQzdELFNBQVMsV0FBVyxRQUFRLGlDQUFpQyxDQUFDO0FBRTlELFNBQ0UsVUFBVSxFQUNWLFNBQVMsRUFDVCxlQUFlLEVBQ2YsTUFBTSxFQUNOLFFBQVEsRUFDUixnQkFBZ0IsRUFDaEIsK0JBQStCLEVBQy9CLHdCQUF3QixFQUN4Qix5QkFBeUIsUUFDcEIsV0FBVyxDQUFDO0FBY25COzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0JDLEdBQ0QsT0FBTyxNQUFNLGFB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