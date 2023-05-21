// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { fromFileUrl } from "../path.ts";
import { EventEmitter } from "../events.ts";
import { notImplemented } from "../_utils.ts";
export function asyncIterableIteratorToCallback(iterator, callback) {
    function next() {
        iterator.next().then((obj)=>{
            if (obj.done) {
                callback(obj.value, true);
                return;
            }
            callback(obj.value);
            next();
        });
    }
    next();
}
export function asyncIterableToCallback(iter, callback, errCallback) {
    const iterator = iter[Symbol.asyncIterator]();
    function next() {
        iterator.next().then((obj)=>{
            if (obj.done) {
                callback(obj.value, true);
                return;
            }
            callback(obj.value);
            next();
        }, errCallback);
    }
    next();
}
export function watch(filename, optionsOrListener, optionsOrListener2) {
    const listener = typeof optionsOrListener === "function" ? optionsOrListener : typeof optionsOrListener2 === "function" ? optionsOrListener2 : undefined;
    const options = typeof optionsOrListener === "object" ? optionsOrListener : typeof optionsOrListener2 === "object" ? optionsOrListener2 : undefined;
    filename = filename instanceof URL ? fromFileUrl(filename) : filename;
    const iterator = Deno.watchFs(filename, {
        recursive: options?.recursive || false
    });
    if (!listener) throw new Error("No callback function supplied");
    const fsWatcher = new FSWatcher(()=>{
        if (iterator.return) iterator.return();
    });
    fsWatcher.on("change", listener);
    asyncIterableToCallback(iterator, (val, done)=>{
        if (done) return;
        fsWatcher.emit("change", val.kind, val.paths[0]);
    }, (e)=>{
        fsWatcher.emit("error", e);
    });
    return fsWatcher;
}
export { watch as watchFile };
class FSWatcher extends EventEmitter {
    close;
    constructor(closer){
        super();
        this.close = closer;
    }
    ref() {
        notImplemented("FSWatcher.ref() is not implemented");
    }
    unref() {
        notImplemented("FSWatcher.unref() is not implemented");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvX2ZzL19mc193YXRjaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgZnJvbUZpbGVVcmwgfSBmcm9tIFwiLi4vcGF0aC50c1wiO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSBcIi4uL2V2ZW50cy50c1wiO1xuaW1wb3J0IHsgbm90SW1wbGVtZW50ZWQgfSBmcm9tIFwiLi4vX3V0aWxzLnRzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhYmxlSXRlcmF0b3JUb0NhbGxiYWNrPFQ+KFxuICBpdGVyYXRvcjogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+LFxuICBjYWxsYmFjazogKHZhbDogVCwgZG9uZT86IGJvb2xlYW4pID0+IHZvaWQsXG4pIHtcbiAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICBpdGVyYXRvci5uZXh0KCkudGhlbigob2JqKSA9PiB7XG4gICAgICBpZiAob2JqLmRvbmUpIHtcbiAgICAgICAgY2FsbGJhY2sob2JqLnZhbHVlLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2sob2JqLnZhbHVlKTtcbiAgICAgIG5leHQoKTtcbiAgICB9KTtcbiAgfVxuICBuZXh0KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhYmxlVG9DYWxsYmFjazxUPihcbiAgaXRlcjogQXN5bmNJdGVyYWJsZTxUPixcbiAgY2FsbGJhY2s6ICh2YWw6IFQsIGRvbmU/OiBib29sZWFuKSA9PiB2b2lkLFxuICBlcnJDYWxsYmFjazogKGU6IHVua25vd24pID0+IHZvaWQsXG4pIHtcbiAgY29uc3QgaXRlcmF0b3IgPSBpdGVyW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICBmdW5jdGlvbiBuZXh0KCkge1xuICAgIGl0ZXJhdG9yLm5leHQoKS50aGVuKChvYmopID0+IHtcbiAgICAgIGlmIChvYmouZG9uZSkge1xuICAgICAgICBjYWxsYmFjayhvYmoudmFsdWUsIHRydWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjYWxsYmFjayhvYmoudmFsdWUpO1xuICAgICAgbmV4dCgpO1xuICAgIH0sIGVyckNhbGxiYWNrKTtcbiAgfVxuICBuZXh0KCk7XG59XG5cbnR5cGUgd2F0Y2hPcHRpb25zID0ge1xuICBwZXJzaXN0ZW50PzogYm9vbGVhbjtcbiAgcmVjdXJzaXZlPzogYm9vbGVhbjtcbiAgZW5jb2Rpbmc/OiBzdHJpbmc7XG59O1xuXG50eXBlIHdhdGNoTGlzdGVuZXIgPSAoZXZlbnRUeXBlOiBzdHJpbmcsIGZpbGVuYW1lOiBzdHJpbmcpID0+IHZvaWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXRjaChcbiAgZmlsZW5hbWU6IHN0cmluZyB8IFVSTCxcbiAgb3B0aW9uczogd2F0Y2hPcHRpb25zLFxuICBsaXN0ZW5lcjogd2F0Y2hMaXN0ZW5lcixcbik6IEZTV2F0Y2hlcjtcbmV4cG9ydCBmdW5jdGlvbiB3YXRjaChcbiAgZmlsZW5hbWU6IHN0cmluZyB8IFVSTCxcbiAgbGlzdGVuZXI6IHdhdGNoTGlzdGVuZXIsXG4pOiBGU1dhdGNoZXI7XG5leHBvcnQgZnVuY3Rpb24gd2F0Y2goXG4gIGZpbGVuYW1lOiBzdHJpbmcgfCBVUkwsXG4gIG9wdGlvbnM6IHdhdGNoT3B0aW9ucyxcbik6IEZTV2F0Y2hlcjtcbmV4cG9ydCBmdW5jdGlvbiB3YXRjaChmaWxlbmFtZTogc3RyaW5nIHwgVVJMKTogRlNXYXRjaGVyO1xuZXhwb3J0IGZ1bmN0aW9uIHdhdGNoKFxuICBmaWxlbmFtZTogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zT3JMaXN0ZW5lcj86IHdhdGNoT3B0aW9ucyB8IHdhdGNoTGlzdGVuZXIsXG4gIG9wdGlvbnNPckxpc3RlbmVyMj86IHdhdGNoT3B0aW9ucyB8IHdhdGNoTGlzdGVuZXIsXG4pIHtcbiAgY29uc3QgbGlzdGVuZXIgPSB0eXBlb2Ygb3B0aW9uc09yTGlzdGVuZXIgPT09IFwiZnVuY3Rpb25cIlxuICAgID8gb3B0aW9uc09yTGlzdGVuZXJcbiAgICA6IHR5cGVvZiBvcHRpb25zT3JMaXN0ZW5lcjIgPT09IFwiZnVuY3Rpb25cIlxuICAgID8gb3B0aW9uc09yTGlzdGVuZXIyXG4gICAgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uc09yTGlzdGVuZXIgPT09IFwib2JqZWN0XCJcbiAgICA/IG9wdGlvbnNPckxpc3RlbmVyXG4gICAgOiB0eXBlb2Ygb3B0aW9uc09yTGlzdGVuZXIyID09PSBcIm9iamVjdFwiXG4gICAgPyBvcHRpb25zT3JMaXN0ZW5lcjJcbiAgICA6IHVuZGVmaW5lZDtcbiAgZmlsZW5hbWUgPSBmaWxlbmFtZSBpbnN0YW5jZW9mIFVSTCA/IGZyb21GaWxlVXJsKGZpbGVuYW1lKSA6IGZpbGVuYW1lO1xuXG4gIGNvbnN0IGl0ZXJhdG9yID0gRGVuby53YXRjaEZzKGZpbGVuYW1lLCB7XG4gICAgcmVjdXJzaXZlOiBvcHRpb25zPy5yZWN1cnNpdmUgfHwgZmFsc2UsXG4gIH0pO1xuXG4gIGlmICghbGlzdGVuZXIpIHRocm93IG5ldyBFcnJvcihcIk5vIGNhbGxiYWNrIGZ1bmN0aW9uIHN1cHBsaWVkXCIpO1xuXG4gIGNvbnN0IGZzV2F0Y2hlciA9IG5ldyBGU1dhdGNoZXIoKCkgPT4ge1xuICAgIGlmIChpdGVyYXRvci5yZXR1cm4pIGl0ZXJhdG9yLnJldHVybigpO1xuICB9KTtcblxuICBmc1dhdGNoZXIub24oXCJjaGFuZ2VcIiwgbGlzdGVuZXIpO1xuXG4gIGFzeW5jSXRlcmFibGVUb0NhbGxiYWNrPERlbm8uRnNFdmVudD4oaXRlcmF0b3IsICh2YWwsIGRvbmUpID0+IHtcbiAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgIGZzV2F0Y2hlci5lbWl0KFwiY2hhbmdlXCIsIHZhbC5raW5kLCB2YWwucGF0aHNbMF0pO1xuICB9LCAoZSkgPT4ge1xuICAgIGZzV2F0Y2hlci5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gIH0pO1xuXG4gIHJldHVybiBmc1dhdGNoZXI7XG59XG5cbmV4cG9ydCB7IHdhdGNoIGFzIHdhdGNoRmlsZSB9O1xuXG5jbGFzcyBGU1dhdGNoZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjbG9zZTogKCkgPT4gdm9pZDtcbiAgY29uc3RydWN0b3IoY2xvc2VyOiAoKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNsb3NlID0gY2xvc2VyO1xuICB9XG4gIHJlZigpIHtcbiAgICBub3RJbXBsZW1lbnRlZChcIkZTV2F0Y2hlci5yZWYoKSBpcyBub3QgaW1wbGVtZW50ZWRcIik7XG4gIH1cbiAgdW5yZWYoKSB7XG4gICAgbm90SW1wbGVtZW50ZWQoXCJGU1dhdGNoZXIudW5yZWYoKSBpcyBub3QgaW1wbGVtZW50ZWRcIik7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBUyxXQUFXLFFBQVEsWUFBWSxDQUFDO0FBQ3pDLFNBQVMsWUFBWSxRQUFRLGNBQWMsQ0FBQztBQUM1QyxTQUFTLGNBQWMsUUFBUSxjQUFjLENBQUM7QUFFOUMsT0FBTyxTQUFTLCtCQUErQixDQUM3QyxRQUFrQyxFQUNsQyxRQUEwQyxFQUMxQztJQUNBLFNBQVMsSUFBSSxHQUFHO1FBQ2QsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBSztZQUM1QixJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzFCLE9BQU87WUFDVCxDQUFDO1lBQ0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwQixJQUFJLEVBQUUsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELElBQUksRUFB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