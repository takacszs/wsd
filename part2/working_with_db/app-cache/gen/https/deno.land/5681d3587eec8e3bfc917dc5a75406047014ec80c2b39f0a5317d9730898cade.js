// Copyright 2018-2022 the oak authors. All rights reserved. MIT license.
import { errors, readerFromStreamReader } from "./deps.ts";
import { isMediaType } from "./isMediaType.ts";
import { FormDataReader } from "./multipart.ts";
import { assert } from "./util.ts";
const DEFAULT_LIMIT = 10_485_760; // 10mb
const defaultBodyContentTypes = {
    json: [
        "json",
        "application/*+json",
        "application/csp-report"
    ],
    form: [
        "urlencoded"
    ],
    formData: [
        "multipart"
    ],
    text: [
        "text"
    ]
};
function resolveType(contentType, contentTypes) {
    const contentTypesJson = [
        ...defaultBodyContentTypes.json,
        ...contentTypes.json ?? [], 
    ];
    const contentTypesForm = [
        ...defaultBodyContentTypes.form,
        ...contentTypes.form ?? [], 
    ];
    const contentTypesFormData = [
        ...defaultBodyContentTypes.formData,
        ...contentTypes.formData ?? [], 
    ];
    const contentTypesText = [
        ...defaultBodyContentTypes.text,
        ...contentTypes.text ?? [], 
    ];
    if (contentTypes.bytes && isMediaType(contentType, contentTypes.bytes)) {
        return "bytes";
    } else if (isMediaType(contentType, contentTypesJson)) {
        return "json";
    } else if (isMediaType(contentType, contentTypesForm)) {
        return "form";
    } else if (isMediaType(contentType, contentTypesFormData)) {
        return "form-data";
    } else if (isMediaType(contentType, contentTypesText)) {
        return "text";
    }
    return "bytes";
}
const decoder = new TextDecoder();
export class RequestBody {
    #body;
    #formDataReader;
    #headers;
    #jsonBodyReviver;
    #stream;
    #readAllBody;
    #readBody;
    #type;
    #exceedsLimit(limit) {
        if (!limit || limit === Infinity) {
            return false;
        }
        if (!this.#body) {
            return false;
        }
        const contentLength = this.#headers.get("content-length");
        if (!contentLength) {
            return true;
        }
        const parsed = parseInt(contentLength, 10);
        if (isNaN(parsed)) {
            return true;
        }
        return parsed > limit;
    }
    #parse(type, limit1) {
        switch(type){
            case "form":
                this.#type = "bytes";
                if (this.#exceedsLimit(limit1)) {
                    return ()=>Promise.reject(new RangeError(`Body exceeds a limit of ${limit1}.`));
                }
                return async ()=>new URLSearchParams(decoder.decode(await this.#valuePromise()).replace(/\+/g, " "));
            case "form-data":
                this.#type = "form-data";
                return ()=>{
                    const contentType = this.#headers.get("content-type");
                    assert(contentType);
                    const readableStream = this.#body ?? new ReadableStream();
                    return this.#formDataReader ?? (this.#formDataReader = new FormDataReader(contentType, readerFromStreamReader(readableStream.getReader())));
                };
            case "json":
                this.#type = "bytes";
                if (this.#exceedsLimit(limit1)) {
                    return ()=>Promise.reject(new RangeError(`Body exceeds a limit of ${limit1}.`));
                }
                return async ()=>JSON.parse(decoder.decode(await this.#valuePromise()), this.#jsonBodyReviver);
            case "bytes":
                this.#type = "bytes";
                if (this.#exceedsLimit(limit1)) {
                    return ()=>Promise.reject(new RangeError(`Body exceeds a limit of ${limit1}.`));
                }
                return ()=>this.#valuePromise();
            case "text":
                this.#type = "bytes";
                if (this.#exceedsLimit(limit1)) {
                    return ()=>Promise.reject(new RangeError(`Body exceeds a limit of ${limit1}.`));
                }
                return async ()=>decoder.decode(await this.#valuePromise());
            default:
                throw new TypeError(`Invalid body type: "${type}"`);
        }
    }
    #validateGetArgs(type1, contentTypes) {
        if (type1 === "reader" && this.#type && this.#type !== "reader") {
            throw new TypeError(`Body already consumed as "${this.#type}" and cannot be returned as a reader.`);
        }
        if (type1 === "stream" && this.#type && this.#type !== "stream") {
            throw new TypeError(`Body already consumed as "${this.#type}" and cannot be returned as a stream.`);
        }
        if (type1 === "form-data" && this.#type && this.#type !== "form-data") {
            throw new TypeError(`Body already consumed as "${this.#type}" and cannot be returned as a stream.`);
        }
        if (this.#type === "reader" && type1 !== "reader") {
            throw new TypeError("Body already consumed as a reader and can only be returned as a reader.");
        }
        if (this.#type === "stream" && type1 !== "stream") {
            throw new TypeError("Body already consumed as a stream and can only be returned as a stream.");
        }
        if (this.#type === "form-data" && type1 !== "form-data") {
            throw new TypeError("Body already consumed as form data and can only be returned as form data.");
        }
        if (type1 && Object.keys(contentTypes).length) {
            throw new TypeError(`"type" and "contentTypes" cannot be specified at the same time`);
        }
    }
    #valuePromise() {
        return this.#readAllBody ?? (this.#readAllBody = this.#readBody());
    }
    constructor({ body , readBody  }, headers, jsonBodyReviver){
        this.#body = body;
        this.#headers = headers;
        this.#jsonBodyReviver = jsonBodyReviver;
        this.#readBody = readBody;
    }
    get({ limit =DEFAULT_LIMIT , type , contentTypes ={}  } = {}) {
        this.#validateGetArgs(type, contentTypes);
        if (type === "reader") {
            if (!this.#body) {
                this.#type = "undefined";
                throw new TypeError(`Body is undefined and cannot be returned as "reader".`);
            }
            this.#type = "reader";
            return {
                type,
                value: readerFromStreamReader(this.#body.getReader())
            };
        }
        if (type === "stream") {
            if (!this.#body) {
                this.#type = "undefined";
                throw new TypeError(`Body is undefined and cannot be returned as "stream".`);
            }
            this.#type = "stream";
            const streams = (this.#stream ?? this.#body).tee();
            this.#stream = streams[1];
            return {
                type,
                value: streams[0]
            };
        }
        if (!this.has()) {
            this.#type = "undefined";
        } else if (!this.#type) {
            const encoding = this.#headers.get("content-encoding") ?? "identity";
            if (encoding !== "identity") {
                throw new errors.UnsupportedMediaType(`Unsupported content-encoding: ${encoding}`);
            }
        }
        if (this.#type === "undefined" && (!type || type === "undefined")) {
            return {
                type: "undefined",
                value: undefined
            };
        }
        if (!type) {
            const contentType = this.#headers.get("content-type");
            assert(contentType, "The Content-Type header is missing from the request");
            type = resolveType(contentType, contentTypes);
        }
        assert(type);
        const body = Object.create(null);
        Object.defineProperties(body, {
            type: {
                value: type,
                configurable: true,
                enumerable: true
            },
            value: {
                get: this.#parse(type, limit),
                configurable: true,
                enumerable: true
            }
        });
        return body;
    }
    /** Returns if the request might have a body or not, without attempting to
   * consume it.
   *
   * **WARNING** This is an unreliable API. In HTTP/2 it is not possible to
   * determine if certain HTTP methods have a body or not without attempting to
   * read the body. As of Deno 1.16.1 and later, for HTTP/1.1 aligns to the
   * HTTP/2 behaviour.
   */ has() {
        return this.#body != null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvb2FrQHYxMS4xLjAvYm9keS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBvYWsgYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IGVycm9ycywgcmVhZGVyRnJvbVN0cmVhbVJlYWRlciB9IGZyb20gXCIuL2RlcHMudHNcIjtcbmltcG9ydCB7IGlzTWVkaWFUeXBlIH0gZnJvbSBcIi4vaXNNZWRpYVR5cGUudHNcIjtcbmltcG9ydCB7IEZvcm1EYXRhUmVhZGVyIH0gZnJvbSBcIi4vbXVsdGlwYXJ0LnRzXCI7XG5pbXBvcnQgdHlwZSB7IFNlcnZlclJlcXVlc3RCb2R5IH0gZnJvbSBcIi4vdHlwZXMuZC50c1wiO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIi4vdXRpbC50c1wiO1xuXG4vKiogVGhlIHR5cGUgb2YgdGhlIGJvZHksIHdoZXJlOlxuICpcbiAqIC0gYFwiYnl0ZXNcImAgLSB0aGUgYm9keSBpcyBwcm92aWRlZCBhcyBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgdG8gYW5cbiAqICAge0BsaW5rY29kZSBVaW50OEFycmF5fS4gVGhpcyBpcyBlc3NlbnRpYWxseSBhIFwicmF3XCIgYm9keSB0eXBlLlxuICogLSBgXCJmb3JtXCJgIC0gdGhlIGJvZHkgd2FzIGRlY29kZWQgYXMgYSBmb3JtIHdpdGggdGhlIGNvbnRlbnRzIHByb3ZpZGVkIGFzIGFcbiAqICAgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIGEge0BsaW5rY29kZSBVUkxTZWFyY2hQYXJhbXN9LlxuICogLSBgXCJmb3JtLWRhdGFcImAgLSB0aGUgYm9keSB3YXMgZGVjb2RlZCBhcyBhIG11bHRpLXBhcnQgZm9ybSBkYXRhIGFuZCB0aGVcbiAqICAgY29udGVudHMgYXJlIHByb3ZpZGVkIGFzIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIGFcbiAqICAge0BsaW5rY29kZSBGb3JtRGF0YVJlYWRlcn0uXG4gKiAtIGBcImpzb25cImAgLSB0aGUgYm9keSB3YXMgZGVjb2RlZCBhcyBKU09OLCB3aGVyZSB0aGUgY29udGVudHMgYXJlIHByb3ZpZGVkIGFzXG4gKiAgIHRoZSByZXN1bHQgb2YgdXNpbmcgYEpTT04ucGFyc2UoKWAgb24gdGhlIHN0cmluZyBjb250ZW50cyBvZiB0aGUgYm9keS5cbiAqIC0gYFwidGV4dFwiYCAtIHRoZSBib2R5IHdhcyBkZWNvZGVkIGFzIHRleHQsIHdoZXJlIHRoZSBjb250ZW50cyBhcmUgcHJvdmlkZWQgYXNcbiAqICAgYSBzdHJpbmcuXG4gKiAtIGBcInJlYWRlclwiYCAtIHRoZSBib2R5IGlzIHByb3ZpZGVkIGFzIHtAbGlua2NvZGUgRGVuby5SZWFkZXJ9IGludGVyZmFjZSBmb3JcbiAqICAgcmVhZGluZyB0aGUgXCJyYXdcIiBib2R5LlxuICogLSBgXCJzdHJlYW1cImAgLSB0aGUgYm9keSBpcyBwcm92aWRlZCBhcyBhXG4gKiAgIHtAbGlua2NvZGUgUmVhZGFibGVTdHJlYW08VWludDhBcnJheT59IGZvciByZWFkaW5nIHRoZSBcInJhd1wiIGJvZHkuXG4gKiAtIGBcInVuZGVmaW5lZFwiYCAtIHRoZXJlIGlzIG5vIHJlcXVlc3QgYm9keSBvciBpdCBjb3VsZCBub3QgYmUgZGVjb2RlZC5cbiAqL1xuZXhwb3J0IHR5cGUgQm9keVR5cGUgPVxuICB8IFwiYnl0ZXNcIlxuICB8IFwiZm9ybVwiXG4gIHwgXCJmb3JtLWRhdGFcIlxuICB8IFwianNvblwiXG4gIHwgXCJ0ZXh0XCJcbiAgfCBcInJlYWRlclwiXG4gIHwgXCJzdHJlYW1cIlxuICB8IFwidW5kZWZpbmVkXCI7XG5cbi8qKiBUaGUgdGFnZ2VkIHR5cGUgZm9yIGBcImJ5dGVzXCJgIGJvZGllcy4gKi9cbmV4cG9ydCB0eXBlIEJvZHlCeXRlcyA9IHtcbiAgcmVhZG9ubHkgdHlwZTogXCJieXRlc1wiO1xuICByZWFkb25seSB2YWx1ZTogUHJvbWlzZTxVaW50OEFycmF5Pjtcbn07XG4vKiogVGhlIHRhZ2dlZCB0eXBlIGZvciBgXCJqc29uXCJgIGJvZGllcy4gKi9cbmV4cG9ydCB0eXBlIEJvZHlKc29uID0ge1xuICByZWFkb25seSB0eXBlOiBcImpzb25cIjtcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgcmVhZG9ubHkgdmFsdWU6IFByb21pc2U8YW55Pjtcbn07XG4vKiogVGhlIHRhZ2dlZCB0eXBlIGZvciBgXCJmb3JtXCJgIGJvZGllcy4gKi9cbmV4cG9ydCB0eXBlIEJvZHlGb3JtID0ge1xuICByZWFkb25seSB0eXBlOiBcImZvcm1cIjtcbiAgcmVhZG9ubHkgdmFsdWU6IFByb21pc2U8VVJMU2VhcmNoUGFyYW1zPjtcbn07XG4vKiogVGhlIHRhZ2dlZCB0eXBlIGZvciBgXCJmb3JtLWRhdGFcImAgYm9kaWVzLiAqL1xuZXhwb3J0IHR5cGUgQm9keUZvcm1EYXRhID0ge1xuICByZWFkb25seSB0eXBlOiBcImZvcm0tZGF0YVwiO1xuICByZWFkb25seSB2YWx1ZTogRm9ybURhdGFSZWFkZXI7XG59O1xuLyoqIFRoZSB0YWdnZWQgdHlwZSBmb3IgYFwidGV4dFwiYCBib2RpZXMuICovXG5leHBvcnQgdHlwZSBCb2R5VGV4dCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogXCJ0ZXh0XCI7XG4gIHJlYWRvbmx5IHZhbHVlOiBQcm9taXNlPHN0cmluZz47XG59O1xuLyoqIFRoZSB0YWdnZWQgdHlwZSBmb3IgYFwidW5kZWZpbmVkXCJgIGJvZGllcy4gKi9cbmV4cG9ydCB0eXBlIEJvZHlVbmRlZmluZWQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IFwidW5kZWZpbmVkXCI7XG4gIHJlYWRvbmx5IHZhbHVlOiB1bmRlZmluZWQ7XG59O1xuLyoqIFRoZSB0YWdnZWQgdHlwZSBmb3IgYFwicmVhZGVyXCJgIGJvZGllcy4gKi9cbmV4cG9ydCB0eXBlIEJvZHlSZWFkZXIgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IFwicmVhZGVyXCI7XG4gIHJlYWRvbmx5IHZhbHVlOiBEZW5vLlJlYWRlcjtcbn07XG4vKiogVGhlIHRhZ2dlZCB0eXBlIGZvciBgXCJzdHJlYW1cImAgYm9kaWVzLiAqL1xuZXhwb3J0IHR5cGUgQm9keVN0cmVhbSA9IHtcbiAgcmVhZG9ubHkgdHlwZTogXCJzdHJlYW1cIjtcbiAgcmVhZG9ubHkgdmFsdWU6IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+O1xufTtcblxuLyoqIFRoZSB0eXBlIHJldHVybmVkIGZyb20gdGhlIGAuYm9keSgpYCBmdW5jdGlvbiwgd2hpY2ggaXMgYSB0YWdnZWQgdW5pb24gdHlwZVxuICogb2YgYWxsIHRoZSBkaWZmZXJlbnQgdHlwZXMgb2YgYm9kaWVzIHdoaWNoIGNhbiBiZSBpZGVudGlmaWVkIGJ5IHRoZSBgLnR5cGVgXG4gKiBwcm9wZXJ0eSB3aGljaCB3aWxsIGJlIG9mIHR5cGUge0BsaW5rY29kZSBCb2R5VHlwZX0gYW5kIHRoZSBgLnZhbHVlYFxuICogcHJvcGVydHkgYmVpbmcgYSBgUHJvbWlzZWAgd2hpY2ggcmVzb2x2ZXMgd2l0aCB0aGUgYXBwcm9wcmlhdGUgdmFsdWUsIG9yXG4gKiBgdW5kZWZpbmVkYCBpZiB0aGVyZSBpcyBubyBib2R5LiAqL1xuZXhwb3J0IHR5cGUgQm9keSA9XG4gIHwgQm9keUJ5dGVzXG4gIHwgQm9keUpzb25cbiAgfCBCb2R5Rm9ybVxuICB8IEJvZHlGb3JtRGF0YVxuICB8IEJvZHlUZXh0XG4gIHwgQm9keVVuZGVmaW5lZDtcblxudHlwZSBCb2R5VmFsdWVHZXR0ZXIgPSAoKSA9PiBCb2R5W1widmFsdWVcIl07XG5cbi8qKiBXaGVuIHNldHRpbmcgdGhlIGBjb250ZW50VHlwZXNgIHByb3BlcnR5IG9mIHtAbGlua2NvZGUgQm9keU9wdGlvbnN9LCBwcm92aWRlXG4gKiBhZGRpdGlvbmFsIGNvbnRlbnQgdHlwZXMgd2hpY2ggY2FuIGluZmx1ZW5jZSBob3cgdGhlIGJvZHkgaXMgZGVjb2RlZC4gVGhpc1xuICogaXMgc3BlY2lmaWNhbGx5IGRlc2lnbmVkIHRvIGFsbG93IGEgc2VydmVyIHRvIHN1cHBvcnQgY3VzdG9tIG9yIHNwZWNpYWxpemVkXG4gKiBtZWRpYSB0eXBlcyB0aGF0IGFyZSBub3QgcGFydCBvZiB0aGUgcHVibGljIGRhdGFiYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBCb2R5T3B0aW9uc0NvbnRlbnRUeXBlcyB7XG4gIC8qKiBDb250ZW50IHR5cGVzIGxpc3RlZCBoZXJlIHdpbGwgYWx3YXlzIHJldHVybiBhbiBVaW50OEFycmF5LiAqL1xuICBieXRlcz86IHN0cmluZ1tdO1xuICAvKiogQ29udGVudCB0eXBlcyBsaXN0ZWQgaGVyZSB3aWxsIGJlIHBhcnNlZCBhcyBhIEpTT04gc3RyaW5nLiAqL1xuICBqc29uPzogc3RyaW5nW107XG4gIC8qKiBDb250ZW50IHR5cGVzIGxpc3RlZCBoZXJlIHdpbGwgYmUgcGFyc2VkIGFzIGZvcm0gZGF0YSBhbmQgcmV0dXJuXG4gICAqIGBVUkxTZWFyY2hQYXJhbWV0ZXJzYCBhcyB0aGUgdmFsdWUgb2YgdGhlIGJvZHkuICovXG4gIGZvcm0/OiBzdHJpbmdbXTtcbiAgLyoqIENvbnRlbnQgdHlwZXMgbGlzdGVkIGhlcmUgd2lsbCBiZSBwYXJzZWQgYXMgZnJvbSBkYXRhIGFuZCByZXR1cm4gYVxuICAgKiBgRm9ybURhdGFCb2R5YCBpbnRlcmZhY2UgYXMgdGhlIHZhbHVlIG9mIHRoZSBib2R5LiAqL1xuICBmb3JtRGF0YT86IHN0cmluZ1tdO1xuICAvKiogQ29udGVudCB0eXBlcyBsaXN0ZWQgaGVyZSB3aWxsIGJlIHBhcnNlZCBhcyB0ZXh0LiAqL1xuICB0ZXh0Pzogc3RyaW5nW107XG59XG5cbi8qKiBPcHRpb25zIHdoaWNoIGNhbiBiZSB1c2VkIHdoZW4gYWNjZXNzaW5nIHRoZSBgLmJvZHkoKWAgb2YgYSByZXF1ZXN0LlxuICpcbiAqIEB0ZW1wbGF0ZSBUIHRoZSB7QGxpbmtjb2RlIEJvZHlUeXBlfSB0byBhdHRlbXB0IHRvIHVzZSB3aGVuIGRlY29kaW5nIHRoZVxuICogICAgICAgICAgICAgcmVxdWVzdCBib2R5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJvZHlPcHRpb25zPFQgZXh0ZW5kcyBCb2R5VHlwZSA9IEJvZHlUeXBlPiB7XG4gIC8qKiBXaGVuIHJlYWRpbmcgYSBub24tc3RyZWFtaW5nIGJvZHksIHNldCBhIGxpbWl0IHdoZXJlYnkgaWYgdGhlIGNvbnRlbnRcbiAgICogbGVuZ3RoIGlzIGdyZWF0ZXIgdGhlbiB0aGUgbGltaXQgb3Igbm90IHNldCwgcmVhZGluZyB0aGUgYm9keSB3aWxsIHRocm93LlxuICAgKlxuICAgKiBUaGlzIGlzIHRvIHByZXZlbnQgbWFsaWNpb3VzIHJlcXVlc3RzIHdoZXJlIHRoZSBib2R5IGV4Y2VlZHMgdGhlIGNhcGFjaXR5XG4gICAqIG9mIHRoZSBzZXJ2ZXIuIFNldCB0aGUgbGltaXQgdG8gMCB0byBhbGxvdyB1bmJvdW5kZWQgcmVhZHMuICBUaGUgZGVmYXVsdFxuICAgKiBpcyAxMCBNaWIuICovXG4gIGxpbWl0PzogbnVtYmVyO1xuICAvKiogSW5zdGVhZCBvZiB1dGlsaXppbmcgdGhlIGNvbnRlbnQgdHlwZSBvZiB0aGUgcmVxdWVzdCwgYXR0ZW1wdCB0byBwYXJzZSB0aGVcbiAgICogYm9keSBhcyB0aGUgdHlwZSBzcGVjaWZpZWQuIFRoZSB2YWx1ZSBoYXMgdG8gYmUgb2Yge0BsaW5rY29kZSBCb2R5VHlwZX0uICovXG4gIHR5cGU/OiBUO1xuICAvKiogQSBtYXAgb2YgZXh0cmEgY29udGVudCB0eXBlcyB0byBkZXRlcm1pbmUgaG93IHRvIHBhcnNlIHRoZSBib2R5LiAqL1xuICBjb250ZW50VHlwZXM/OiBCb2R5T3B0aW9uc0NvbnRlbnRUeXBlcztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCb2R5Q29udGVudFR5cGVzIHtcbiAganNvbj86IHN0cmluZ1tdO1xuICBmb3JtPzogc3RyaW5nW107XG4gIHRleHQ/OiBzdHJpbmdbXTtcbn1cblxuY29uc3QgREVGQVVMVF9MSU1JVCA9IDEwXzQ4NV83NjA7IC8vIDEwbWJcblxuY29uc3QgZGVmYXVsdEJvZHlDb250ZW50VHlwZXMgPSB7XG4gIGpzb246IFtcImpzb25cIiwgXCJhcHBsaWNhdGlvbi8qK2pzb25cIiwgXCJhcHBsaWNhdGlvbi9jc3AtcmVwb3J0XCJdLFxuICBmb3JtOiBbXCJ1cmxlbmNvZGVkXCJdLFxuICBmb3JtRGF0YTogW1wibXVsdGlwYXJ0XCJdLFxuICB0ZXh0OiBbXCJ0ZXh0XCJdLFxufTtcblxuZnVuY3Rpb24gcmVzb2x2ZVR5cGUoXG4gIGNvbnRlbnRUeXBlOiBzdHJpbmcsXG4gIGNvbnRlbnRUeXBlczogQm9keU9wdGlvbnNDb250ZW50VHlwZXMsXG4pOiBCb2R5VHlwZSB7XG4gIGNvbnN0IGNvbnRlbnRUeXBlc0pzb24gPSBbXG4gICAgLi4uZGVmYXVsdEJvZHlDb250ZW50VHlwZXMuanNvbixcbiAgICAuLi4oY29udGVudFR5cGVzLmpzb24gPz8gW10pLFxuICBdO1xuICBjb25zdCBjb250ZW50VHlwZXNGb3JtID0gW1xuICAgIC4uLmRlZmF1bHRCb2R5Q29udGVudFR5cGVzLmZvcm0sXG4gICAgLi4uKGNvbnRlbnRUeXBlcy5mb3JtID8/IFtdKSxcbiAgXTtcbiAgY29uc3QgY29udGVudFR5cGVzRm9ybURhdGEgPSBbXG4gICAgLi4uZGVmYXVsdEJvZHlDb250ZW50VHlwZXMuZm9ybURhdGEsXG4gICAgLi4uKGNvbnRlbnRUeXBlcy5mb3JtRGF0YSA/PyBbXSksXG4gIF07XG4gIGNvbnN0IGNvbnRlbnRUeXBlc1RleHQgPSBbXG4gICAgLi4uZGVmYXVsdEJvZHlDb250ZW50VHlwZXMudGV4dCxcbiAgICAuLi4oY29udGVudFR5cGVzLnRleHQgPz8gW10pLFxuICBdO1xuICBpZiAoY29udGVudFR5cGVzLmJ5dGVzICYmIGlzTWVkaWFUeXBlKGNvbnRlbnRUeXBlLCBjb250ZW50VHlwZXMuYnl0ZXMpKSB7XG4gICAgcmV0dXJuIFwiYnl0ZXNcIjtcbiAgfSBlbHNlIGlmIChpc01lZGlhVHlwZShjb250ZW50VHlwZSwgY29udGVudFR5cGVzSnNvbikpIHtcbiAgICByZXR1cm4gXCJqc29uXCI7XG4gIH0gZWxzZSBpZiAoaXNNZWRpYVR5cGUoY29udGVudFR5cGUsIGNvbnRlbnRUeXBlc0Zvcm0pKSB7XG4gICAgcmV0dXJuIFwiZm9ybVwiO1xuICB9IGVsc2UgaWYgKGlzTWVkaWFUeXBlKGNvbnRlbnRUeXBlLCBjb250ZW50VHlwZXNGb3JtRGF0YSkpIHtcbiAgICByZXR1cm4gXCJmb3JtLWRhdGFcIjtcbiAgfSBlbHNlIGlmIChpc01lZGlhVHlwZShjb250ZW50VHlwZSwgY29udGVudFR5cGVzVGV4dCkpIHtcbiAgICByZXR1cm4gXCJ0ZXh0XCI7XG4gIH1cbiAgcmV0dXJuIFwiYnl0ZXNcIjtcbn1cblxuY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXG5leHBvcnQgY2xhc3MgUmVxdWVzdEJvZHkge1xuICAjYm9keTogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT4gfCBudWxsO1xuICAjZm9ybURhdGFSZWFkZXI/OiBGb3JtRGF0YVJlYWRlcjtcbiAgI2hlYWRlcnM6IEhlYWRlcnM7XG4gICNqc29uQm9keVJldml2ZXI/OiAoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSA9PiB1bmtub3duO1xuICAjc3RyZWFtPzogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT47XG4gICNyZWFkQWxsQm9keT86IFByb21pc2U8VWludDhBcnJheT47XG4gICNyZWFkQm9keTogKCkgPT4gUHJvbWlzZTxVaW50OEFycmF5PjtcbiAgI3R5cGU/OiBcImJ5dGVzXCIgfCBcImZvcm0tZGF0YVwiIHwgXCJyZWFkZXJcIiB8IFwic3RyZWFtXCIgfCBcInVuZGVmaW5lZFwiO1xuXG4gICNleGNlZWRzTGltaXQobGltaXQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICghbGltaXQgfHwgbGltaXQgPT09IEluZmluaXR5KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghdGhpcy4jYm9keSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50TGVuZ3RoID0gdGhpcy4jaGVhZGVycy5nZXQoXCJjb250ZW50LWxlbmd0aFwiKTtcbiAgICBpZiAoIWNvbnRlbnRMZW5ndGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUludChjb250ZW50TGVuZ3RoLCAxMCk7XG4gICAgaWYgKGlzTmFOKHBhcnNlZCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VkID4gbGltaXQ7XG4gIH1cblxuICAjcGFyc2UodHlwZTogQm9keVR5cGUsIGxpbWl0OiBudW1iZXIpOiBCb2R5VmFsdWVHZXR0ZXIge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBcImZvcm1cIjpcbiAgICAgICAgdGhpcy4jdHlwZSA9IFwiYnl0ZXNcIjtcbiAgICAgICAgaWYgKHRoaXMuI2V4Y2VlZHNMaW1pdChsaW1pdCkpIHtcbiAgICAgICAgICByZXR1cm4gKCkgPT5cbiAgICAgICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBSYW5nZUVycm9yKGBCb2R5IGV4Y2VlZHMgYSBsaW1pdCBvZiAke2xpbWl0fS5gKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFzeW5jICgpID0+XG4gICAgICAgICAgbmV3IFVSTFNlYXJjaFBhcmFtcyhcbiAgICAgICAgICAgIGRlY29kZXIuZGVjb2RlKGF3YWl0IHRoaXMuI3ZhbHVlUHJvbWlzZSgpKS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpLFxuICAgICAgICAgICk7XG4gICAgICBjYXNlIFwiZm9ybS1kYXRhXCI6XG4gICAgICAgIHRoaXMuI3R5cGUgPSBcImZvcm0tZGF0YVwiO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gdGhpcy4jaGVhZGVycy5nZXQoXCJjb250ZW50LXR5cGVcIik7XG4gICAgICAgICAgYXNzZXJ0KGNvbnRlbnRUeXBlKTtcbiAgICAgICAgICBjb25zdCByZWFkYWJsZVN0cmVhbSA9IHRoaXMuI2JvZHkgPz8gbmV3IFJlYWRhYmxlU3RyZWFtKCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuI2Zvcm1EYXRhUmVhZGVyID8/XG4gICAgICAgICAgICAodGhpcy4jZm9ybURhdGFSZWFkZXIgPSBuZXcgRm9ybURhdGFSZWFkZXIoXG4gICAgICAgICAgICAgIGNvbnRlbnRUeXBlLFxuICAgICAgICAgICAgICByZWFkZXJGcm9tU3RyZWFtUmVhZGVyKFxuICAgICAgICAgICAgICAgIChyZWFkYWJsZVN0cmVhbSBhcyBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PikuZ2V0UmVhZGVyKCksXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgXCJqc29uXCI6XG4gICAgICAgIHRoaXMuI3R5cGUgPSBcImJ5dGVzXCI7XG4gICAgICAgIGlmICh0aGlzLiNleGNlZWRzTGltaXQobGltaXQpKSB7XG4gICAgICAgICAgcmV0dXJuICgpID0+XG4gICAgICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgUmFuZ2VFcnJvcihgQm9keSBleGNlZWRzIGEgbGltaXQgb2YgJHtsaW1pdH0uYCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhc3luYyAoKSA9PlxuICAgICAgICAgIEpTT04ucGFyc2UoXG4gICAgICAgICAgICBkZWNvZGVyLmRlY29kZShhd2FpdCB0aGlzLiN2YWx1ZVByb21pc2UoKSksXG4gICAgICAgICAgICB0aGlzLiNqc29uQm9keVJldml2ZXIsXG4gICAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJieXRlc1wiOlxuICAgICAgICB0aGlzLiN0eXBlID0gXCJieXRlc1wiO1xuICAgICAgICBpZiAodGhpcy4jZXhjZWVkc0xpbWl0KGxpbWl0KSkge1xuICAgICAgICAgIHJldHVybiAoKSA9PlxuICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IFJhbmdlRXJyb3IoYEJvZHkgZXhjZWVkcyBhIGxpbWl0IG9mICR7bGltaXR9LmApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKCkgPT4gdGhpcy4jdmFsdWVQcm9taXNlKCk7XG4gICAgICBjYXNlIFwidGV4dFwiOlxuICAgICAgICB0aGlzLiN0eXBlID0gXCJieXRlc1wiO1xuICAgICAgICBpZiAodGhpcy4jZXhjZWVkc0xpbWl0KGxpbWl0KSkge1xuICAgICAgICAgIHJldHVybiAoKSA9PlxuICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IFJhbmdlRXJyb3IoYEJvZHkgZXhjZWVkcyBhIGxpbWl0IG9mICR7bGltaXR9LmApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXN5bmMgKCkgPT4gZGVjb2Rlci5kZWNvZGUoYXdhaXQgdGhpcy4jdmFsdWVQcm9taXNlKCkpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBib2R5IHR5cGU6IFwiJHt0eXBlfVwiYCk7XG4gICAgfVxuICB9XG5cbiAgI3ZhbGlkYXRlR2V0QXJncyhcbiAgICB0eXBlOiBCb2R5VHlwZSB8IHVuZGVmaW5lZCxcbiAgICBjb250ZW50VHlwZXM6IEJvZHlPcHRpb25zQ29udGVudFR5cGVzLFxuICApIHtcbiAgICBpZiAodHlwZSA9PT0gXCJyZWFkZXJcIiAmJiB0aGlzLiN0eXBlICYmIHRoaXMuI3R5cGUgIT09IFwicmVhZGVyXCIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIGBCb2R5IGFscmVhZHkgY29uc3VtZWQgYXMgXCIke3RoaXMuI3R5cGV9XCIgYW5kIGNhbm5vdCBiZSByZXR1cm5lZCBhcyBhIHJlYWRlci5gLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09IFwic3RyZWFtXCIgJiYgdGhpcy4jdHlwZSAmJiB0aGlzLiN0eXBlICE9PSBcInN0cmVhbVwiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBgQm9keSBhbHJlYWR5IGNvbnN1bWVkIGFzIFwiJHt0aGlzLiN0eXBlfVwiIGFuZCBjYW5ub3QgYmUgcmV0dXJuZWQgYXMgYSBzdHJlYW0uYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0eXBlID09PSBcImZvcm0tZGF0YVwiICYmIHRoaXMuI3R5cGUgJiYgdGhpcy4jdHlwZSAhPT0gXCJmb3JtLWRhdGFcIikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgYEJvZHkgYWxyZWFkeSBjb25zdW1lZCBhcyBcIiR7dGhpcy4jdHlwZX1cIiBhbmQgY2Fubm90IGJlIHJldHVybmVkIGFzIGEgc3RyZWFtLmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy4jdHlwZSA9PT0gXCJyZWFkZXJcIiAmJiB0eXBlICE9PSBcInJlYWRlclwiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBcIkJvZHkgYWxyZWFkeSBjb25zdW1lZCBhcyBhIHJlYWRlciBhbmQgY2FuIG9ubHkgYmUgcmV0dXJuZWQgYXMgYSByZWFkZXIuXCIsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy4jdHlwZSA9PT0gXCJzdHJlYW1cIiAmJiB0eXBlICE9PSBcInN0cmVhbVwiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBcIkJvZHkgYWxyZWFkeSBjb25zdW1lZCBhcyBhIHN0cmVhbSBhbmQgY2FuIG9ubHkgYmUgcmV0dXJuZWQgYXMgYSBzdHJlYW0uXCIsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy4jdHlwZSA9PT0gXCJmb3JtLWRhdGFcIiAmJiB0eXBlICE9PSBcImZvcm0tZGF0YVwiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBcIkJvZHkgYWxyZWFkeSBjb25zdW1lZCBhcyBmb3JtIGRhdGEgYW5kIGNhbiBvbmx5IGJlIHJldHVybmVkIGFzIGZvcm0gZGF0YS5cIixcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0eXBlICYmIE9iamVjdC5rZXlzKGNvbnRlbnRUeXBlcykubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBgXCJ0eXBlXCIgYW5kIFwiY29udGVudFR5cGVzXCIgY2Fubm90IGJlIHNwZWNpZmllZCBhdCB0aGUgc2FtZSB0aW1lYCxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgI3ZhbHVlUHJvbWlzZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jcmVhZEFsbEJvZHkgPz8gKHRoaXMuI3JlYWRBbGxCb2R5ID0gdGhpcy4jcmVhZEJvZHkoKSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICB7IGJvZHksIHJlYWRCb2R5IH06IFNlcnZlclJlcXVlc3RCb2R5LFxuICAgIGhlYWRlcnM6IEhlYWRlcnMsXG4gICAganNvbkJvZHlSZXZpdmVyPzogKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikgPT4gdW5rbm93bixcbiAgKSB7XG4gICAgdGhpcy4jYm9keSA9IGJvZHk7XG4gICAgdGhpcy4jaGVhZGVycyA9IGhlYWRlcnM7XG4gICAgdGhpcy4janNvbkJvZHlSZXZpdmVyID0ganNvbkJvZHlSZXZpdmVyO1xuICAgIHRoaXMuI3JlYWRCb2R5ID0gcmVhZEJvZHk7XG4gIH1cblxuICBnZXQoXG4gICAgeyBsaW1pdCA9IERFRkFVTFRfTElNSVQsIHR5cGUsIGNvbnRlbnRUeXBlcyA9IHt9IH06IEJvZHlPcHRpb25zID0ge30sXG4gICk6IEJvZHkgfCBCb2R5UmVhZGVyIHwgQm9keVN0cmVhbSB7XG4gICAgdGhpcy4jdmFsaWRhdGVHZXRBcmdzKHR5cGUsIGNvbnRlbnRUeXBlcyk7XG4gICAgaWYgKHR5cGUgPT09IFwicmVhZGVyXCIpIHtcbiAgICAgIGlmICghdGhpcy4jYm9keSkge1xuICAgICAgICB0aGlzLiN0eXBlID0gXCJ1bmRlZmluZWRcIjtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBgQm9keSBpcyB1bmRlZmluZWQgYW5kIGNhbm5vdCBiZSByZXR1cm5lZCBhcyBcInJlYWRlclwiLmAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLiN0eXBlID0gXCJyZWFkZXJcIjtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGUsXG4gICAgICAgIHZhbHVlOiByZWFkZXJGcm9tU3RyZWFtUmVhZGVyKHRoaXMuI2JvZHkuZ2V0UmVhZGVyKCkpLFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09IFwic3RyZWFtXCIpIHtcbiAgICAgIGlmICghdGhpcy4jYm9keSkge1xuICAgICAgICB0aGlzLiN0eXBlID0gXCJ1bmRlZmluZWRcIjtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBgQm9keSBpcyB1bmRlZmluZWQgYW5kIGNhbm5vdCBiZSByZXR1cm5lZCBhcyBcInN0cmVhbVwiLmAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLiN0eXBlID0gXCJzdHJlYW1cIjtcbiAgICAgIGNvbnN0IHN0cmVhbXMgPVxuICAgICAgICAoKHRoaXMuI3N0cmVhbSA/PyB0aGlzLiNib2R5KSBhcyBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PilcbiAgICAgICAgICAudGVlKCk7XG4gICAgICB0aGlzLiNzdHJlYW0gPSBzdHJlYW1zWzFdO1xuICAgICAgcmV0dXJuIHsgdHlwZSwgdmFsdWU6IHN0cmVhbXNbMF0gfTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmhhcygpKSB7XG4gICAgICB0aGlzLiN0eXBlID0gXCJ1bmRlZmluZWRcIjtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLiN0eXBlKSB7XG4gICAgICBjb25zdCBlbmNvZGluZyA9IHRoaXMuI2hlYWRlcnMuZ2V0KFwiY29udGVudC1lbmNvZGluZ1wiKSA/P1xuICAgICAgICBcImlkZW50aXR5XCI7XG4gICAgICBpZiAoZW5jb2RpbmcgIT09IFwiaWRlbnRpdHlcIikge1xuICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLlVuc3VwcG9ydGVkTWVkaWFUeXBlKFxuICAgICAgICAgIGBVbnN1cHBvcnRlZCBjb250ZW50LWVuY29kaW5nOiAke2VuY29kaW5nfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLiN0eXBlID09PSBcInVuZGVmaW5lZFwiICYmICghdHlwZSB8fCB0eXBlID09PSBcInVuZGVmaW5lZFwiKSkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ1bmRlZmluZWRcIiwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgIH1cbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gdGhpcy4jaGVhZGVycy5nZXQoXCJjb250ZW50LXR5cGVcIik7XG4gICAgICBhc3NlcnQoXG4gICAgICAgIGNvbnRlbnRUeXBlLFxuICAgICAgICBcIlRoZSBDb250ZW50LVR5cGUgaGVhZGVyIGlzIG1pc3NpbmcgZnJvbSB0aGUgcmVxdWVzdFwiLFxuICAgICAgKTtcbiAgICAgIHR5cGUgPSByZXNvbHZlVHlwZShjb250ZW50VHlwZSwgY29udGVudFR5cGVzKTtcbiAgICB9XG4gICAgYXNzZXJ0KHR5cGUpO1xuICAgIGNvbnN0IGJvZHk6IEJvZHkgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGJvZHksIHtcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgdmFsdWU6IHR5cGUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICB2YWx1ZToge1xuICAgICAgICBnZXQ6IHRoaXMuI3BhcnNlKHR5cGUsIGxpbWl0KSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICByZXR1cm4gYm9keTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGlmIHRoZSByZXF1ZXN0IG1pZ2h0IGhhdmUgYSBib2R5IG9yIG5vdCwgd2l0aG91dCBhdHRlbXB0aW5nIHRvXG4gICAqIGNvbnN1bWUgaXQuXG4gICAqXG4gICAqICoqV0FSTklORyoqIFRoaXMgaXMgYW4gdW5yZWxpYWJsZSBBUEkuIEluIEhUVFAvMiBpdCBpcyBub3QgcG9zc2libGUgdG9cbiAgICogZGV0ZXJtaW5lIGlmIGNlcnRhaW4gSFRUUCBtZXRob2RzIGhhdmUgYSBib2R5IG9yIG5vdCB3aXRob3V0IGF0dGVtcHRpbmcgdG9cbiAgICogcmVhZCB0aGUgYm9keS4gQXMgb2YgRGVubyAxLjE2LjEgYW5kIGxhdGVyLCBmb3IgSFRUUC8xLjEgYWxpZ25zIHRvIHRoZVxuICAgKiBIVFRQLzIgYmVoYXZpb3VyLlxuICAgKi9cbiAgaGFzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNib2R5ICE9IG51bGw7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5RUFBeUU7QUFFekUsU0FBUyxNQUFNLEVBQUUsc0JBQXNCLFFBQVEsV0FBVyxDQUFDO0FBQzNELFNBQVMsV0FBVyxRQUFRLGtCQUFrQixDQUFDO0FBQy9DLFNBQVMsY0FBYyxRQUFRLGdCQUFnQixDQUFDO0FBRWhELFNBQVMsTUFBTSxRQUFRLFdBQVcsQ0FBQztBQXFJbkMsTUFBTSxhQUFhLEdBQUcsVUFBVSxBQUFDLEVBQUMsT0FBTztBQUV6QyxNQUFNLHVCQUF1QixHQUFHO0lBQzlCLElBQUksRUFBRTtRQUFDLE1BQU07UUFBRSxvQkFBb0I7UUFBRSx3QkFBd0I7S0FBQztJQUM5RCxJQUFJLEVBQUU7UUFBQyxZQUFZO0tBQUM7SUFDcEIsUUFBUSxFQUFFO1FBQUMsV0FBVztLQUFDO0lBQ3ZCLElBQUksRUFBRTtRQUFDLE1BQU07S0FBQztDQUNmLEFBQUM7QUFFRixTQUFTLFdBQVcsQ0FDbEIsV0FBbUIsRUFDbkIsWUFBcUMsRUFDM0I7SUFDVixNQUFNLGdCQUFnQixHQUFHO1dBQ3BCLHVCQUF1QixDQUFDLElBQUk7V0FDM0IsWUFBWSxDQUFDLElBQUksSUFB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