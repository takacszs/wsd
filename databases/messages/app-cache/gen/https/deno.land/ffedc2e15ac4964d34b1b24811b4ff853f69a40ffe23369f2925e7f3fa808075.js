import { existsSync, path, readFileSync } from "./file-methods.ts";
const _BOM = /^\uFEFF/;
// express is set like: app.engine('html', require('eta').renderFile)
import EtaErr from "./err.ts";
/* END TYPES */ /**
 * Get the path to the included file from the parent file path and the
 * specified path.
 *
 * If `name` does not have an extension, it will default to `.eta`
 *
 * @param name specified path
 * @param parentfile parent file path
 * @param isDirectory whether parentfile is a directory
 * @return absolute path to template
 */ function getWholeFilePath(name, parentfile, isDirectory) {
    const includePath = path.resolve(isDirectory ? parentfile : path.dirname(parentfile), name) + (path.extname(name) ? "" : ".eta");
    return includePath;
}
/**
 * Get the absolute path to an included template
 *
 * If this is called with an absolute path (for example, starting with '/' or 'C:\')
 * then Eta will attempt to resolve the absolute path within options.views. If it cannot,
 * Eta will fallback to options.root or '/'
 *
 * If this is called with a relative path, Eta will:
 * - Look relative to the current template (if the current template has the `filename` property)
 * - Look inside each directory in options.views
 *
 * Note: if Eta is unable to find a template using path and options, it will throw an error.
 *
 * @param path    specified path
 * @param options compilation options
 * @return absolute path to template
 */ function getPath(path, options) {
    let includePath = false;
    const views = options.views;
    let searchedPaths = [];
    // If these four values are the same,
    // getPath() will return the same result every time.
    // We can cache the result to avoid expensive
    // file operations.
    const pathOptions = JSON.stringify({
        filename: options.filename,
        path: path,
        root: options.root,
        views: options.views
    });
    if (options.cache && options.filepathCache && options.filepathCache[pathOptions]) {
        // Use the cached filepath
        return options.filepathCache[pathOptions];
    }
    /** Add a filepath to the list of paths we've checked for a template */ function addPathToSearched(pathSearched) {
        if (!searchedPaths.includes(pathSearched)) {
            searchedPaths.push(pathSearched);
        }
    }
    /**
   * Take a filepath (like 'partials/mypartial.eta'). Attempt to find the template file inside `views`;
   * return the resulting template file path, or `false` to indicate that the template was not found.
   *
   * @param views the filepath that holds templates, or an array of filepaths that hold templates
   * @param path the path to the template
   */ function searchViews(views, path) {
        let filePath;
        // If views is an array, then loop through each directory
        // And attempt to find the template
        if (Array.isArray(views) && views.some(function(v) {
            filePath = getWholeFilePath(path, v, true);
            addPathToSearched(filePath);
            return existsSync(filePath);
        })) {
            // If the above returned true, we know that the filePath was just set to a path
            // That exists (Array.some() returns as soon as it finds a valid element)
            return filePath;
        } else if (typeof views === "string") {
            // Search for the file if views is a single directory
            filePath = getWholeFilePath(path, views, true);
            addPathToSearched(filePath);
            if (existsSync(filePath)) {
                return filePath;
            }
        }
        // Unable to find a file
        return false;
    }
    // Path starts with '/', 'C:\', etc.
    const match = /^[A-Za-z]+:\\|^\//.exec(path);
    // Absolute path, like /partials/partial.eta
    if (match && match.length) {
        // We have to trim the beginning '/' off the path, or else
        // path.resolve(dir, path) will always resolve to just path
        const formattedPath = path.replace(/^\/*/, "");
        // First, try to resolve the path within options.views
        includePath = searchViews(views, formattedPath);
        if (!includePath) {
            // If that fails, searchViews will return false. Try to find the path
            // inside options.root (by default '/', the base of the filesystem)
            const pathFromRoot = getWholeFilePath(formattedPath, options.root || "/", true);
            addPathToSearched(pathFromRoot);
            includePath = pathFromRoot;
        }
    } else {
        // Relative paths
        // Look relative to a passed filename first
        if (options.filename) {
            const filePath = getWholeFilePath(path, options.filename);
            addPathToSearched(filePath);
            if (existsSync(filePath)) {
                includePath = filePath;
            }
        }
        // Then look for the template in options.views
        if (!includePath) {
            includePath = searchViews(views, path);
        }
        if (!includePath) {
            throw EtaErr('Could not find the template "' + path + '". Paths tried: ' + searchedPaths);
        }
    }
    // If caching and filepathCache are enabled,
    // cache the input & output of this function.
    if (options.cache && options.filepathCache) {
        options.filepathCache[pathOptions] = includePath;
    }
    return includePath;
}
/**
 * Reads a file synchronously
 */ function readFile(filePath) {
    try {
        return readFileSync(filePath).toString().replace(_BOM, "") // TODO: is replacing BOM's necessary?
        ;
    } catch  {
        throw EtaErr("Failed to read template at '" + filePath + "'");
    }
}
export { getPath, readFile };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZXRhQHYxLjEyLjMvZmlsZS11dGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGlzdHNTeW5jLCBwYXRoLCByZWFkRmlsZVN5bmMgfSBmcm9tIFwiLi9maWxlLW1ldGhvZHMudHNcIjtcbmNvbnN0IF9CT00gPSAvXlxcdUZFRkYvO1xuXG4vLyBleHByZXNzIGlzIHNldCBsaWtlOiBhcHAuZW5naW5lKCdodG1sJywgcmVxdWlyZSgnZXRhJykucmVuZGVyRmlsZSlcblxuaW1wb3J0IEV0YUVyciBmcm9tIFwiLi9lcnIudHNcIjtcblxuLyogVFlQRVMgKi9cblxuaW1wb3J0IHR5cGUgeyBFdGFDb25maWcgfSBmcm9tIFwiLi9jb25maWcudHNcIjtcblxuLyogRU5EIFRZUEVTICovXG5cbi8qKlxuICogR2V0IHRoZSBwYXRoIHRvIHRoZSBpbmNsdWRlZCBmaWxlIGZyb20gdGhlIHBhcmVudCBmaWxlIHBhdGggYW5kIHRoZVxuICogc3BlY2lmaWVkIHBhdGguXG4gKlxuICogSWYgYG5hbWVgIGRvZXMgbm90IGhhdmUgYW4gZXh0ZW5zaW9uLCBpdCB3aWxsIGRlZmF1bHQgdG8gYC5ldGFgXG4gKlxuICogQHBhcmFtIG5hbWUgc3BlY2lmaWVkIHBhdGhcbiAqIEBwYXJhbSBwYXJlbnRmaWxlIHBhcmVudCBmaWxlIHBhdGhcbiAqIEBwYXJhbSBpc0RpcmVjdG9yeSB3aGV0aGVyIHBhcmVudGZpbGUgaXMgYSBkaXJlY3RvcnlcbiAqIEByZXR1cm4gYWJzb2x1dGUgcGF0aCB0byB0ZW1wbGF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldFdob2xlRmlsZVBhdGgoXG4gIG5hbWU6IHN0cmluZyxcbiAgcGFyZW50ZmlsZTogc3RyaW5nLFxuICBpc0RpcmVjdG9yeT86IGJvb2xlYW4sXG4pOiBzdHJpbmcge1xuICBjb25zdCBpbmNsdWRlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICBpc0RpcmVjdG9yeSA/IHBhcmVudGZpbGUgOiBwYXRoLmRpcm5hbWUocGFyZW50ZmlsZSksIC8vIHJldHVybnMgZGlyZWN0b3J5IHRoZSBwYXJlbnQgZmlsZSBpcyBpblxuICAgIG5hbWUsIC8vIGZpbGVcbiAgKSArIChwYXRoLmV4dG5hbWUobmFtZSkgPyBcIlwiIDogXCIuZXRhXCIpO1xuICByZXR1cm4gaW5jbHVkZVBhdGg7XG59XG5cbi8qKlxuICogR2V0IHRoZSBhYnNvbHV0ZSBwYXRoIHRvIGFuIGluY2x1ZGVkIHRlbXBsYXRlXG4gKlxuICogSWYgdGhpcyBpcyBjYWxsZWQgd2l0aCBhbiBhYnNvbHV0ZSBwYXRoIChmb3IgZXhhbXBsZSwgc3RhcnRpbmcgd2l0aCAnLycgb3IgJ0M6XFwnKVxuICogdGhlbiBFdGEgd2lsbCBhdHRlbXB0IHRvIHJlc29sdmUgdGhlIGFic29sdXRlIHBhdGggd2l0aGluIG9wdGlvbnMudmlld3MuIElmIGl0IGNhbm5vdCxcbiAqIEV0YSB3aWxsIGZhbGxiYWNrIHRvIG9wdGlvbnMucm9vdCBvciAnLydcbiAqXG4gKiBJZiB0aGlzIGlzIGNhbGxlZCB3aXRoIGEgcmVsYXRpdmUgcGF0aCwgRXRhIHdpbGw6XG4gKiAtIExvb2sgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgdGVtcGxhdGUgKGlmIHRoZSBjdXJyZW50IHRlbXBsYXRlIGhhcyB0aGUgYGZpbGVuYW1lYCBwcm9wZXJ0eSlcbiAqIC0gTG9vayBpbnNpZGUgZWFjaCBkaXJlY3RvcnkgaW4gb3B0aW9ucy52aWV3c1xuICpcbiAqIE5vdGU6IGlmIEV0YSBpcyB1bmFibGUgdG8gZmluZCBhIHRlbXBsYXRlIHVzaW5nIHBhdGggYW5kIG9wdGlvbnMsIGl0IHdpbGwgdGhyb3cgYW4gZXJyb3IuXG4gKlxuICogQHBhcmFtIHBhdGggICAgc3BlY2lmaWVkIHBhdGhcbiAqIEBwYXJhbSBvcHRpb25zIGNvbXBpbGF0aW9uIG9wdGlvbnNcbiAqIEByZXR1cm4gYWJzb2x1dGUgcGF0aCB0byB0ZW1wbGF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldFBhdGgocGF0aDogc3RyaW5nLCBvcHRpb25zOiBFdGFDb25maWcpOiBzdHJpbmcge1xuICBsZXQgaW5jbHVkZVBhdGg6IHN0cmluZyB8IGZhbHNlID0gZmFsc2U7XG4gIGNvbnN0IHZpZXdzID0gb3B0aW9ucy52aWV3cztcbiAgbGV0IHNlYXJjaGVkUGF0aHM6IEFycmF5PHN0cmluZz4gPSBbXTtcblxuICAvLyBJZiB0aGVzZSBmb3VyIHZhbHVlcyBhcmUgdGhlIHNhbWUsXG4gIC8vIGdldFBhdGgoKSB3aWxsIHJldHVybiB0aGUgc2FtZSByZXN1bHQgZXZlcnkgdGltZS5cbiAgLy8gV2UgY2FuIGNhY2hlIHRoZSByZXN1bHQgdG8gYXZvaWQgZXhwZW5zaXZlXG4gIC8vIGZpbGUgb3BlcmF0aW9ucy5cbiAgY29uc3QgcGF0aE9wdGlvbnMgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgZmlsZW5hbWU6IG9wdGlvbnMuZmlsZW5hbWUsIC8vIGZpbGVuYW1lIG9mIHRoZSB0ZW1wbGF0ZSB3aGljaCBjYWxsZWQgaW5jbHVkZUZpbGUoKVxuICAgIHBhdGg6IHBhdGgsXG4gICAgcm9vdDogb3B0aW9ucy5yb290LFxuICAgIHZpZXdzOiBvcHRpb25zLnZpZXdzLFxuICB9KTtcblxuICBpZiAoXG4gICAgb3B0aW9ucy5jYWNoZSAmJiBvcHRpb25zLmZpbGVwYXRoQ2FjaGUgJiYgb3B0aW9ucy5maWxlcGF0aENhY2hlW3BhdGhPcHRpb25zXVxuICApIHtcbiAgICAvLyBVc2UgdGhlIGNhY2hlZCBmaWxlcGF0aFxuICAgIHJldHVybiBvcHRpb25zLmZpbGVwYXRoQ2FjaGVbcGF0aE9wdGlvbnNdO1xuICB9XG5cbiAgLyoqIEFkZCBhIGZpbGVwYXRoIHRvIHRoZSBsaXN0IG9mIHBhdGhzIHdlJ3ZlIGNoZWNrZWQgZm9yIGEgdGVtcGxhdGUgKi9cbiAgZnVuY3Rpb24gYWRkUGF0aFRvU2VhcmNoZWQocGF0aFNlYXJjaGVkOiBzdHJpbmcpIHtcbiAgICBpZiAoIXNlYXJjaGVkUGF0aHMuaW5jbHVkZXMocGF0aFNlYXJjaGVkKSkge1xuICAgICAgc2VhcmNoZWRQYXRocy5wdXNoKHBhdGhTZWFyY2hlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgYSBmaWxlcGF0aCAobGlrZSAncGFydGlhbHMvbXlwYXJ0aWFsLmV0YScpLiBBdHRlbXB0IHRvIGZpbmQgdGhlIHRlbXBsYXRlIGZpbGUgaW5zaWRlIGB2aWV3c2A7XG4gICAqIHJldHVybiB0aGUgcmVzdWx0aW5nIHRlbXBsYXRlIGZpbGUgcGF0aCwgb3IgYGZhbHNlYCB0byBpbmRpY2F0ZSB0aGF0IHRoZSB0ZW1wbGF0ZSB3YXMgbm90IGZvdW5kLlxuICAgKlxuICAgKiBAcGFyYW0gdmlld3MgdGhlIGZpbGVwYXRoIHRoYXQgaG9sZHMgdGVtcGxhdGVzLCBvciBhbiBhcnJheSBvZiBmaWxlcGF0aHMgdGhhdCBob2xkIHRlbXBsYXRlc1xuICAgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aCB0byB0aGUgdGVtcGxhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gc2VhcmNoVmlld3MoXG4gICAgdmlld3M6IEFycmF5PHN0cmluZz4gfCBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcGF0aDogc3RyaW5nLFxuICApOiBzdHJpbmcgfCBmYWxzZSB7XG4gICAgbGV0IGZpbGVQYXRoO1xuXG4gICAgLy8gSWYgdmlld3MgaXMgYW4gYXJyYXksIHRoZW4gbG9vcCB0aHJvdWdoIGVhY2ggZGlyZWN0b3J5XG4gICAgLy8gQW5kIGF0dGVtcHQgdG8gZmluZCB0aGUgdGVtcGxhdGVcbiAgICBpZiAoXG4gICAgICBBcnJheS5pc0FycmF5KHZpZXdzKSAmJlxuICAgICAgdmlld3Muc29tZShmdW5jdGlvbiAodikge1xuICAgICAgICBmaWxlUGF0aCA9IGdldFdob2xlRmlsZVBhdGgocGF0aCwgdiwgdHJ1ZSk7XG5cbiAgICAgICAgYWRkUGF0aFRvU2VhcmNoZWQoZmlsZVBhdGgpO1xuXG4gICAgICAgIHJldHVybiBleGlzdHNTeW5jKGZpbGVQYXRoKTtcbiAgICAgIH0pXG4gICAgKSB7XG4gICAgICAvLyBJZiB0aGUgYWJvdmUgcmV0dXJuZWQgdHJ1ZSwgd2Uga25vdyB0aGF0IHRoZSBmaWxlUGF0aCB3YXMganVzdCBzZXQgdG8gYSBwYXRoXG4gICAgICAvLyBUaGF0IGV4aXN0cyAoQXJyYXkuc29tZSgpIHJldHVybnMgYXMgc29vbiBhcyBpdCBmaW5kcyBhIHZhbGlkIGVsZW1lbnQpXG4gICAgICByZXR1cm4gKGZpbGVQYXRoIGFzIHVua25vd24pIGFzIHN0cmluZztcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2aWV3cyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgLy8gU2VhcmNoIGZvciB0aGUgZmlsZSBpZiB2aWV3cyBpcyBhIHNpbmdsZSBkaXJlY3RvcnlcbiAgICAgIGZpbGVQYXRoID0gZ2V0V2hvbGVGaWxlUGF0aChwYXRoLCB2aWV3cywgdHJ1ZSk7XG5cbiAgICAgIGFkZFBhdGhUb1NlYXJjaGVkKGZpbGVQYXRoKTtcblxuICAgICAgaWYgKGV4aXN0c1N5bmMoZmlsZVBhdGgpKSB7XG4gICAgICAgIHJldHVybiBmaWxlUGF0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBVbmFibGUgdG8gZmluZCBhIGZpbGVcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBQYXRoIHN0YXJ0cyB3aXRoICcvJywgJ0M6XFwnLCBldGMuXG4gIGNvbnN0IG1hdGNoID0gL15bQS1aYS16XSs6XFxcXHxeXFwvLy5leGVjKHBhdGgpO1xuXG4gIC8vIEFic29sdXRlIHBhdGgsIGxpa2UgL3BhcnRpYWxzL3BhcnRpYWwuZXRhXG4gIGlmIChtYXRjaCAmJiBtYXRjaC5sZW5ndGgpIHtcbiAgICAvLyBXZSBoYXZlIHRvIHRyaW0gdGhlIGJlZ2lubmluZyAnLycgb2ZmIHRoZSBwYXRoLCBvciBlbHNlXG4gICAgLy8gcGF0aC5yZXNvbHZlKGRpciwgcGF0aCkgd2lsbCBhbHdheXMgcmVzb2x2ZSB0byBqdXN0IHBhdGhcbiAgICBjb25zdCBmb3JtYXR0ZWRQYXRoID0gcGF0aC5yZXBsYWNlKC9eXFwvKi8sIFwiXCIpO1xuXG4gICAgLy8gRmlyc3QsIHRyeSB0byByZXNvbHZlIHRoZSBwYXRoIHdpdGhpbiBvcHRpb25zLnZpZXdzXG4gICAgaW5jbHVkZVBhdGggPSBzZWFyY2hWaWV3cyh2aWV3cywgZm9ybWF0dGVkUGF0aCk7XG4gICAgaWYgKCFpbmNsdWRlUGF0aCkge1xuICAgICAgLy8gSWYgdGhhdCBmYWlscywgc2VhcmNoVmlld3Mgd2lsbCByZXR1cm4gZmFsc2UuIFRyeSB0byBmaW5kIHRoZSBwYXRoXG4gICAgICAvLyBpbnNpZGUgb3B0aW9ucy5yb290IChieSBkZWZhdWx0ICcvJywgdGhlIGJhc2Ugb2YgdGhlIGZpbGVzeXN0ZW0pXG4gICAgICBjb25zdCBwYXRoRnJvbVJvb3QgPSBnZXRXaG9sZUZpbGVQYXRoKFxuICAgICAgICBmb3JtYXR0ZWRQYXRoLFxuICAgICAgICBvcHRpb25zLnJvb3QgfHwgXCIvXCIsXG4gICAgICAgIHRydWUsXG4gICAgICApO1xuXG4gICAgICBhZGRQYXRoVG9TZWFyY2hlZChwYXRoRnJvbVJvb3QpO1xuXG4gICAgICBpbmNsdWRlUGF0aCA9IHBhdGhGcm9tUm9vdDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gUmVsYXRpdmUgcGF0aHNcbiAgICAvLyBMb29rIHJlbGF0aXZlIHRvIGEgcGFzc2VkIGZpbGVuYW1lIGZpcnN0XG4gICAgaWYgKG9wdGlvbnMuZmlsZW5hbWUpIHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0V2hvbGVGaWxlUGF0aChwYXRoLCBvcHRpb25zLmZpbGVuYW1lKTtcblxuICAgICAgYWRkUGF0aFRvU2VhcmNoZWQoZmlsZVBhdGgpO1xuXG4gICAgICBpZiAoZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICAgICAgaW5jbHVkZVBhdGggPSBmaWxlUGF0aDtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gVGhlbiBsb29rIGZvciB0aGUgdGVtcGxhdGUgaW4gb3B0aW9ucy52aWV3c1xuICAgIGlmICghaW5jbHVkZVBhdGgpIHtcbiAgICAgIGluY2x1ZGVQYXRoID0gc2VhcmNoVmlld3Modmlld3MsIHBhdGgpO1xuICAgIH1cbiAgICBpZiAoIWluY2x1ZGVQYXRoKSB7XG4gICAgICB0aHJvdyBFdGFFcnIoXG4gICAgICAgICdDb3VsZCBub3QgZmluZCB0aGUgdGVtcGxhdGUgXCInICsgcGF0aCArICdcIi4gUGF0aHMgdHJpZWQ6ICcgK1xuICAgICAgICAgIHNlYXJjaGVkUGF0aHMsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIGNhY2hpbmcgYW5kIGZpbGVwYXRoQ2FjaGUgYXJlIGVuYWJsZWQsXG4gIC8vIGNhY2hlIHRoZSBpbnB1dCAmIG91dHB1dCBvZiB0aGlzIGZ1bmN0aW9uLlxuICBpZiAob3B0aW9ucy5jYWNoZSAmJiBvcHRpb25zLmZpbGVwYXRoQ2FjaGUpIHtcbiAgICBvcHRpb25zLmZpbGVwYXRoQ2FjaGVbcGF0aE9wdGlvbnNdID0gaW5jbHVkZVBhdGg7XG4gIH1cblxuICByZXR1cm4gaW5jbHVkZVBhdGg7XG59XG5cbi8qKlxuICogUmVhZHMgYSBmaWxlIHN5bmNocm9ub3VzbHlcbiAqL1xuXG5mdW5jdGlvbiByZWFkRmlsZShmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVhZEZpbGVTeW5jKGZpbGVQYXRoKS50b1N0cmluZygpLnJlcGxhY2UoX0JPTSwgXCJcIikgLy8gVE9ETzogaXMgcmVwbGFjaW5nIEJPTSdzIG5lY2Vzc2FyeT9cbiAgICA7XG4gIH0gY2F0Y2gge1xuICAgIHRocm93IEV0YUVycihcIkZhaWxlZCB0byByZWFkIHRlbXBsYXRlIGF0ICdcIiArIGZpbGVQYXRoICsgXCInXCIpO1xuICB9XG59XG5cbmV4cG9ydCB7IGdldFBhdGgsIHJlYWRGaWxlIH07XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxVQUFVLEVBQUUsSUFBSSxFQUFFLFlBQVksUUFBUSxtQkFBbUIsQ0FBQztBQUNuRSxNQUFNLElBQUksWUFBWSxBQUFDO0FBRXZCLHFFQUFx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