import compile from "./compile.ts";
import { getConfig } from "./config.ts";
import { promiseImpl } from "./polyfills.ts";
import EtaErr from "./err.ts";
/* END TYPES */ function handleCache(template, options) {
    if (options.cache && options.name && options.templates.get(options.name)) {
        return options.templates.get(options.name);
    }
    const templateFunc = typeof template === "function" ? template : compile(template, options);
    // Note that we don't have to check if it already exists in the cache;
    // it would have returned earlier if it had
    if (options.cache && options.name) {
        options.templates.define(options.name, templateFunc);
    }
    return templateFunc;
}
/**
 * Render a template
 *
 * If `template` is a string, Eta will compile it to a function and then call it with the provided data.
 * If `template` is a template function, Eta will call it with the provided data.
 *
 * If `config.async` is `false`, Eta will return the rendered template.
 *
 * If `config.async` is `true` and there's a callback function, Eta will call the callback with `(err, renderedTemplate)`.
 * If `config.async` is `true` and there's not a callback function, Eta will return a Promise that resolves to the rendered template.
 *
 * If `config.cache` is `true` and `config` has a `name` or `filename` property, Eta will cache the template on the first render and use the cached template for all subsequent renders.
 *
 * @param template Template string or template function
 * @param data Data to render the template with
 * @param config Optional config options
 * @param cb Callback function
 */ export default function render(template, data, config, cb) {
    const options = getConfig(config || {});
    if (options.async) {
        if (cb) {
            // If user passes callback
            try {
                // Note: if there is an error while rendering the template,
                // It will bubble up and be caught here
                const templateFn = handleCache(template, options);
                templateFn(data, options, cb);
            } catch (err) {
                return cb(err);
            }
        } else {
            // No callback, try returning a promise
            if (typeof promiseImpl === "function") {
                return new promiseImpl(function(resolve, reject) {
                    try {
                        resolve(handleCache(template, options)(data, options));
                    } catch (err) {
                        reject(err);
                    }
                });
            } else {
                throw EtaErr("Please provide a callback function, this env doesn't support Promises");
            }
        }
    } else {
        return handleCache(template, options)(data, options);
    }
};
/**
 * Render a template asynchronously
 *
 * If `template` is a string, Eta will compile it to a function and call it with the provided data.
 * If `template` is a function, Eta will call it with the provided data.
 *
 * If there is a callback function, Eta will call it with `(err, renderedTemplate)`.
 * If there is not a callback function, Eta will return a Promise that resolves to the rendered template
 *
 * @param template Template string or template function
 * @param data Data to render the template with
 * @param config Optional config options
 * @param cb Callback function
 */ export function renderAsync(template, data, config, cb) {
    // Using Object.assign to lower bundle size, using spread operator makes it larger because of typescript injected polyfills
    return render(template, data, Object.assign({}, config, {
        async: true
    }), cb);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZXRhQHYxLjEyLjMvcmVuZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjb21waWxlIGZyb20gXCIuL2NvbXBpbGUudHNcIjtcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gXCIuL2NvbmZpZy50c1wiO1xuaW1wb3J0IHsgcHJvbWlzZUltcGwgfSBmcm9tIFwiLi9wb2x5ZmlsbHMudHNcIjtcbmltcG9ydCBFdGFFcnIgZnJvbSBcIi4vZXJyLnRzXCI7XG5cbi8qIFRZUEVTICovXG5cbmltcG9ydCB0eXBlIHsgRXRhQ29uZmlnLCBQYXJ0aWFsQ29uZmlnIH0gZnJvbSBcIi4vY29uZmlnLnRzXCI7XG5pbXBvcnQgdHlwZSB7IFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi9jb21waWxlLnRzXCI7XG5pbXBvcnQgdHlwZSB7IENhbGxiYWNrRm4gfSBmcm9tIFwiLi9maWxlLWhhbmRsZXJzLnRzXCI7XG5cbi8qIEVORCBUWVBFUyAqL1xuXG5mdW5jdGlvbiBoYW5kbGVDYWNoZShcbiAgdGVtcGxhdGU6IHN0cmluZyB8IFRlbXBsYXRlRnVuY3Rpb24sXG4gIG9wdGlvbnM6IEV0YUNvbmZpZyxcbik6IFRlbXBsYXRlRnVuY3Rpb24ge1xuICBpZiAob3B0aW9ucy5jYWNoZSAmJiBvcHRpb25zLm5hbWUgJiYgb3B0aW9ucy50ZW1wbGF0ZXMuZ2V0KG9wdGlvbnMubmFtZSkpIHtcbiAgICByZXR1cm4gb3B0aW9ucy50ZW1wbGF0ZXMuZ2V0KG9wdGlvbnMubmFtZSk7XG4gIH1cblxuICBjb25zdCB0ZW1wbGF0ZUZ1bmMgPSB0eXBlb2YgdGVtcGxhdGUgPT09IFwiZnVuY3Rpb25cIlxuICAgID8gdGVtcGxhdGVcbiAgICA6IGNvbXBpbGUodGVtcGxhdGUsIG9wdGlvbnMpO1xuXG4gIC8vIE5vdGUgdGhhdCB3ZSBkb24ndCBoYXZlIHRvIGNoZWNrIGlmIGl0IGFscmVhZHkgZXhpc3RzIGluIHRoZSBjYWNoZTtcbiAgLy8gaXQgd291bGQgaGF2ZSByZXR1cm5lZCBlYXJsaWVyIGlmIGl0IGhhZFxuICBpZiAob3B0aW9ucy5jYWNoZSAmJiBvcHRpb25zLm5hbWUpIHtcbiAgICBvcHRpb25zLnRlbXBsYXRlcy5kZWZpbmUob3B0aW9ucy5uYW1lLCB0ZW1wbGF0ZUZ1bmMpO1xuICB9XG5cbiAgcmV0dXJuIHRlbXBsYXRlRnVuYztcbn1cblxuLyoqXG4gKiBSZW5kZXIgYSB0ZW1wbGF0ZVxuICpcbiAqIElmIGB0ZW1wbGF0ZWAgaXMgYSBzdHJpbmcsIEV0YSB3aWxsIGNvbXBpbGUgaXQgdG8gYSBmdW5jdGlvbiBhbmQgdGhlbiBjYWxsIGl0IHdpdGggdGhlIHByb3ZpZGVkIGRhdGEuXG4gKiBJZiBgdGVtcGxhdGVgIGlzIGEgdGVtcGxhdGUgZnVuY3Rpb24sIEV0YSB3aWxsIGNhbGwgaXQgd2l0aCB0aGUgcHJvdmlkZWQgZGF0YS5cbiAqXG4gKiBJZiBgY29uZmlnLmFzeW5jYCBpcyBgZmFsc2VgLCBFdGEgd2lsbCByZXR1cm4gdGhlIHJlbmRlcmVkIHRlbXBsYXRlLlxuICpcbiAqIElmIGBjb25maWcuYXN5bmNgIGlzIGB0cnVlYCBhbmQgdGhlcmUncyBhIGNhbGxiYWNrIGZ1bmN0aW9uLCBFdGEgd2lsbCBjYWxsIHRoZSBjYWxsYmFjayB3aXRoIGAoZXJyLCByZW5kZXJlZFRlbXBsYXRlKWAuXG4gKiBJZiBgY29uZmlnLmFzeW5jYCBpcyBgdHJ1ZWAgYW5kIHRoZXJlJ3Mgbm90IGEgY2FsbGJhY2sgZnVuY3Rpb24sIEV0YSB3aWxsIHJldHVybiBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgcmVuZGVyZWQgdGVtcGxhdGUuXG4gKlxuICogSWYgYGNvbmZpZy5jYWNoZWAgaXMgYHRydWVgIGFuZCBgY29uZmlnYCBoYXMgYSBgbmFtZWAgb3IgYGZpbGVuYW1lYCBwcm9wZXJ0eSwgRXRhIHdpbGwgY2FjaGUgdGhlIHRlbXBsYXRlIG9uIHRoZSBmaXJzdCByZW5kZXIgYW5kIHVzZSB0aGUgY2FjaGVkIHRlbXBsYXRlIGZvciBhbGwgc3Vic2VxdWVudCByZW5kZXJzLlxuICpcbiAqIEBwYXJhbSB0ZW1wbGF0ZSBUZW1wbGF0ZSBzdHJpbmcgb3IgdGVtcGxhdGUgZnVuY3Rpb25cbiAqIEBwYXJhbSBkYXRhIERhdGEgdG8gcmVuZGVyIHRoZSB0ZW1wbGF0ZSB3aXRoXG4gKiBAcGFyYW0gY29uZmlnIE9wdGlvbmFsIGNvbmZpZyBvcHRpb25zXG4gKiBAcGFyYW0gY2IgQ2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXIoXG4gIHRlbXBsYXRlOiBzdHJpbmcgfCBUZW1wbGF0ZUZ1bmN0aW9uLFxuICBkYXRhOiBvYmplY3QsXG4gIGNvbmZpZz86IFBhcnRpYWxDb25maWcsXG4gIGNiPzogQ2FsbGJhY2tGbixcbik6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPiB8IHZvaWQge1xuICBjb25zdCBvcHRpb25zID0gZ2V0Q29uZmlnKGNvbmZpZyB8fCB7fSk7XG5cbiAgaWYgKG9wdGlvbnMuYXN5bmMpIHtcbiAgICBpZiAoY2IpIHtcbiAgICAgIC8vIElmIHVzZXIgcGFzc2VzIGNhbGxiYWNrXG4gICAgICB0cnkge1xuICAgICAgICAvLyBOb3RlOiBpZiB0aGVyZSBpcyBhbiBlcnJvciB3aGlsZSByZW5kZXJpbmcgdGhlIHRlbXBsYXRlLFxuICAgICAgICAvLyBJdCB3aWxsIGJ1YmJsZSB1cCBhbmQgYmUgY2F1Z2h0IGhlcmVcbiAgICAgICAgY29uc3QgdGVtcGxhdGVGbiA9IGhhbmRsZUNhY2hlKHRlbXBsYXRlLCBvcHRpb25zKTtcbiAgICAgICAgdGVtcGxhdGVGbihkYXRhLCBvcHRpb25zLCBjYik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vIGNhbGxiYWNrLCB0cnkgcmV0dXJuaW5nIGEgcHJvbWlzZVxuICAgICAgaWYgKHR5cGVvZiBwcm9taXNlSW1wbCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBuZXcgcHJvbWlzZUltcGwoZnVuY3Rpb24gKHJlc29sdmU6IEZ1bmN0aW9uLCByZWplY3Q6IEZ1bmN0aW9uKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc29sdmUoaGFuZGxlQ2FjaGUodGVtcGxhdGUsIG9wdGlvbnMpKGRhdGEsIG9wdGlvbnMpKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBFdGFFcnIoXG4gICAgICAgICAgXCJQbGVhc2UgcHJvdmlkZSBhIGNhbGxiYWNrIGZ1bmN0aW9uLCB0aGlzIGVudiBkb2Vzbid0IHN1cHBvcnQgUHJvbWlzZXNcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGhhbmRsZUNhY2hlKHRlbXBsYXRlLCBvcHRpb25zKShkYXRhLCBvcHRpb25zKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbmRlciBhIHRlbXBsYXRlIGFzeW5jaHJvbm91c2x5XG4gKlxuICogSWYgYHRlbXBsYXRlYCBpcyBhIHN0cmluZywgRXRhIHdpbGwgY29tcGlsZSBpdCB0byBhIGZ1bmN0aW9uIGFuZCBjYWxsIGl0IHdpdGggdGhlIHByb3ZpZGVkIGRhdGEuXG4gKiBJZiBgdGVtcGxhdGVgIGlzIGEgZnVuY3Rpb24sIEV0YSB3aWxsIGNhbGwgaXQgd2l0aCB0aGUgcHJvdmlkZWQgZGF0YS5cbiAqXG4gKiBJZiB0aGVyZSBpcyBhIGNhbGxiYWNrIGZ1bmN0aW9uLCBFdGEgd2lsbCBjYWxsIGl0IHdpdGggYChlcnIsIHJlbmRlcmVkVGVtcGxhdGUpYC5cbiAqIElmIHRoZXJlIGlzIG5vdCBhIGNhbGxiYWNrIGZ1bmN0aW9uLCBFdGEgd2lsbCByZXR1cm4gYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHJlbmRlcmVkIHRlbXBsYXRlXG4gKlxuICogQHBhcmFtIHRlbXBsYXRlIFRlbXBsYXRlIHN0cmluZyBvciB0ZW1wbGF0ZSBmdW5jdGlvblxuICogQHBhcmFtIGRhdGEgRGF0YSB0byByZW5kZXIgdGhlIHRlbXBsYXRlIHdpdGhcbiAqIEBwYXJhbSBjb25maWcgT3B0aW9uYWwgY29uZmlnIG9wdGlvbnNcbiAqIEBwYXJhbSBjYiBDYWxsYmFjayBmdW5jdGlvblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJBc3luYyhcbiAgdGVtcGxhdGU6IHN0cmluZyB8IFRlbXBsYXRlRnVuY3Rpb24sXG4gIGRhdGE6IG9iamVjdCxcbiAgY29uZmlnPzogUGFydGlhbENvbmZpZyxcbiAgY2I/OiBDYWxsYmFja0ZuLFxuKTogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+IHwgdm9pZCB7XG4gIC8vIFVzaW5nIE9iamVjdC5hc3NpZ24gdG8gbG93ZXIgYnVuZGxlIHNpemUsIHVzaW5nIHNwcmVhZCBvcGVyYXRvciBtYWtlcyBpdCBsYXJnZXIgYmVjYXVzZSBvZiB0eXBlc2NyaXB0IGluamVjdGVkIHBvbHlmaWxsc1xuICByZXR1cm4gcmVuZGVyKHRlbXBsYXRlLCBkYXRhLCBPYmplY3QuYXNzaWduKHt9LCBjb25maWcsIHsgYXN5bmM6IHRydWUgfSksIGNiKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sTUFBTSxjQUFjLENBQUM7QUFDbkMsU0FBUyxTQUFTLFFBQVEsYUFBYSxDQUFDO0FBQ3hDLFNBQVMsV0FBVyxRQUFRLGdCQUFnQixDQUFDO0FBQzdDLE9BQU8sTUFBTSxNQUFNLFVBQVUsQ0FBQztBQVE5QixhQUFhLEdBRWIsU0FBUyxXQUFXLENBQ2xCLFFBQW1DLEVBQ25DLE9BQWtCLEVBQ0E7SUFDbEIsSUFBSSxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FB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