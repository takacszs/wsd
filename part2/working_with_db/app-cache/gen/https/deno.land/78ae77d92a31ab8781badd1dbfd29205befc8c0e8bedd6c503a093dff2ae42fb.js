import Parse from "./parse.ts";
/* END TYPES */ /**
 * Compiles a template string to a function string. Most often users just use `compile()`, which calls `compileToString` and creates a new function using the result
 *
 * **Example**
 *
 * ```js
 * compileToString("Hi <%= it.user %>", eta.config)
 * // "var tR='',include=E.include.bind(E),includeFile=E.includeFile.bind(E);tR+='Hi ';tR+=E.e(it.user);if(cb){cb(null,tR)} return tR"
 * ```
 */ export default function compileToString(str, config) {
    const buffer = Parse(str, config);
    let res = "var tR='',__l,__lP" + (config.include ? ",include=E.include.bind(E)" : "") + (config.includeFile ? ",includeFile=E.includeFile.bind(E)" : "") + "\nfunction layout(p,d){__l=p;__lP=d}\n" + (config.useWith ? "with(" + config.varName + "||{}){" : "") + compileScope(buffer, config) + (config.includeFile ? "if(__l)tR=" + (config.async ? "await " : "") + `includeFile(__l,Object.assign(${config.varName},{body:tR},__lP))\n` : config.include ? "if(__l)tR=" + (config.async ? "await " : "") + `include(__l,Object.assign(${config.varName},{body:tR},__lP))\n` : "") + "if(cb){cb(null,tR)} return tR" + (config.useWith ? "}" : "");
    if (config.plugins) {
        for(let i = 0; i < config.plugins.length; i++){
            const plugin = config.plugins[i];
            if (plugin.processFnString) {
                res = plugin.processFnString(res, config);
            }
        }
    }
    return res;
};
/**
 * Loops through the AST generated by `parse` and transform each item into JS calls
 *
 * **Example**
 *
 * ```js
 * // AST version of 'Hi <%= it.user %>'
 * let templateAST = ['Hi ', { val: 'it.user', t: 'i' }]
 * compileScope(templateAST, eta.config)
 * // "tR+='Hi ';tR+=E.e(it.user);"
 * ```
 */ function compileScope(buff, config) {
    let i = 0;
    const buffLength = buff.length;
    let returnStr = "";
    for(i; i < buffLength; i++){
        const currentBlock = buff[i];
        if (typeof currentBlock === "string") {
            const str = currentBlock;
            // we know string exists
            returnStr += "tR+='" + str + "'\n";
        } else {
            const type = currentBlock.t; // ~, s, !, ?, r
            let content = currentBlock.val || "";
            if (type === "r") {
                // raw
                if (config.filter) {
                    content = "E.filter(" + content + ")";
                }
                returnStr += "tR+=" + content + "\n";
            } else if (type === "i") {
                // interpolate
                if (config.filter) {
                    content = "E.filter(" + content + ")";
                }
                if (config.autoEscape) {
                    content = "E.e(" + content + ")";
                }
                returnStr += "tR+=" + content + "\n";
            // reference
            } else if (type === "e") {
                // execute
                returnStr += content + "\n"; // you need a \n in case you have <% } %>
            }
        }
    }
    return returnStr;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZXRhQHYyLjAuMC9jb21waWxlLXN0cmluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUGFyc2UgZnJvbSBcIi4vcGFyc2UudHNcIjtcblxuLyogVFlQRVMgKi9cblxuaW1wb3J0IHR5cGUgeyBFdGFDb25maWcgfSBmcm9tIFwiLi9jb25maWcudHNcIjtcbmltcG9ydCB0eXBlIHsgQXN0T2JqZWN0IH0gZnJvbSBcIi4vcGFyc2UudHNcIjtcblxuLyogRU5EIFRZUEVTICovXG5cbi8qKlxuICogQ29tcGlsZXMgYSB0ZW1wbGF0ZSBzdHJpbmcgdG8gYSBmdW5jdGlvbiBzdHJpbmcuIE1vc3Qgb2Z0ZW4gdXNlcnMganVzdCB1c2UgYGNvbXBpbGUoKWAsIHdoaWNoIGNhbGxzIGBjb21waWxlVG9TdHJpbmdgIGFuZCBjcmVhdGVzIGEgbmV3IGZ1bmN0aW9uIHVzaW5nIHRoZSByZXN1bHRcbiAqXG4gKiAqKkV4YW1wbGUqKlxuICpcbiAqIGBgYGpzXG4gKiBjb21waWxlVG9TdHJpbmcoXCJIaSA8JT0gaXQudXNlciAlPlwiLCBldGEuY29uZmlnKVxuICogLy8gXCJ2YXIgdFI9JycsaW5jbHVkZT1FLmluY2x1ZGUuYmluZChFKSxpbmNsdWRlRmlsZT1FLmluY2x1ZGVGaWxlLmJpbmQoRSk7dFIrPSdIaSAnO3RSKz1FLmUoaXQudXNlcik7aWYoY2Ipe2NiKG51bGwsdFIpfSByZXR1cm4gdFJcIlxuICogYGBgXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29tcGlsZVRvU3RyaW5nKFxuICBzdHI6IHN0cmluZyxcbiAgY29uZmlnOiBFdGFDb25maWcsXG4pOiBzdHJpbmcge1xuICBjb25zdCBidWZmZXI6IEFycmF5PEFzdE9iamVjdD4gPSBQYXJzZShzdHIsIGNvbmZpZyk7XG5cbiAgbGV0IHJlcyA9IFwidmFyIHRSPScnLF9fbCxfX2xQXCIgK1xuICAgIChjb25maWcuaW5jbHVkZSA/IFwiLGluY2x1ZGU9RS5pbmNsdWRlLmJpbmQoRSlcIiA6IFwiXCIpICtcbiAgICAoY29uZmlnLmluY2x1ZGVGaWxlID8gXCIsaW5jbHVkZUZpbGU9RS5pbmNsdWRlRmlsZS5iaW5kKEUpXCIgOiBcIlwiKSArXG4gICAgXCJcXG5mdW5jdGlvbiBsYXlvdXQocCxkKXtfX2w9cDtfX2xQPWR9XFxuXCIgK1xuICAgIChjb25maWcudXNlV2l0aCA/IFwid2l0aChcIiArIGNvbmZpZy52YXJOYW1lICsgXCJ8fHt9KXtcIiA6IFwiXCIpICtcbiAgICBjb21waWxlU2NvcGUoYnVmZmVyLCBjb25maWcpICtcbiAgICAoY29uZmlnLmluY2x1ZGVGaWxlXG4gICAgICA/IFwiaWYoX19sKXRSPVwiICtcbiAgICAgICAgKGNvbmZpZy5hc3luYyA/IFwiYXdhaXQgXCIgOiBcIlwiKSArXG4gICAgICAgIGBpbmNsdWRlRmlsZShfX2wsT2JqZWN0LmFzc2lnbigke2NvbmZpZy52YXJOYW1lfSx7Ym9keTp0Un0sX19sUCkpXFxuYFxuICAgICAgOiBjb25maWcuaW5jbHVkZVxuICAgICAgPyBcImlmKF9fbCl0Uj1cIiArXG4gICAgICAgIChjb25maWcuYXN5bmMgPyBcImF3YWl0IFwiIDogXCJcIikgK1xuICAgICAgICBgaW5jbHVkZShfX2wsT2JqZWN0LmFzc2lnbigke2NvbmZpZy52YXJOYW1lfSx7Ym9keTp0Un0sX19sUCkpXFxuYFxuICAgICAgOiBcIlwiKSArXG4gICAgXCJpZihjYil7Y2IobnVsbCx0Uil9IHJldHVybiB0UlwiICtcbiAgICAoY29uZmlnLnVzZVdpdGggPyBcIn1cIiA6IFwiXCIpO1xuXG4gIGlmIChjb25maWcucGx1Z2lucykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29uZmlnLnBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHBsdWdpbiA9IGNvbmZpZy5wbHVnaW5zW2ldO1xuICAgICAgaWYgKHBsdWdpbi5wcm9jZXNzRm5TdHJpbmcpIHtcbiAgICAgICAgcmVzID0gcGx1Z2luLnByb2Nlc3NGblN0cmluZyhyZXMsIGNvbmZpZyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBMb29wcyB0aHJvdWdoIHRoZSBBU1QgZ2VuZXJhdGVkIGJ5IGBwYXJzZWAgYW5kIHRyYW5zZm9ybSBlYWNoIGl0ZW0gaW50byBKUyBjYWxsc1xuICpcbiAqICoqRXhhbXBsZSoqXG4gKlxuICogYGBganNcbiAqIC8vIEFTVCB2ZXJzaW9uIG9mICdIaSA8JT0gaXQudXNlciAlPidcbiAqIGxldCB0ZW1wbGF0ZUFTVCA9IFsnSGkgJywgeyB2YWw6ICdpdC51c2VyJywgdDogJ2knIH1dXG4gKiBjb21waWxlU2NvcGUodGVtcGxhdGVBU1QsIGV0YS5jb25maWcpXG4gKiAvLyBcInRSKz0nSGkgJzt0Uis9RS5lKGl0LnVzZXIpO1wiXG4gKiBgYGBcbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlU2NvcGUoYnVmZjogQXJyYXk8QXN0T2JqZWN0PiwgY29uZmlnOiBFdGFDb25maWcpIHtcbiAgbGV0IGkgPSAwO1xuICBjb25zdCBidWZmTGVuZ3RoID0gYnVmZi5sZW5ndGg7XG4gIGxldCByZXR1cm5TdHIgPSBcIlwiO1xuXG4gIGZvciAoaTsgaSA8IGJ1ZmZMZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGN1cnJlbnRCbG9jayA9IGJ1ZmZbaV07XG4gICAgaWYgKHR5cGVvZiBjdXJyZW50QmxvY2sgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGNvbnN0IHN0ciA9IGN1cnJlbnRCbG9jaztcblxuICAgICAgLy8gd2Uga25vdyBzdHJpbmcgZXhpc3RzXG4gICAgICByZXR1cm5TdHIgKz0gXCJ0Uis9J1wiICsgc3RyICsgXCInXFxuXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGUgPSBjdXJyZW50QmxvY2sudDsgLy8gfiwgcywgISwgPywgclxuICAgICAgbGV0IGNvbnRlbnQgPSBjdXJyZW50QmxvY2sudmFsIHx8IFwiXCI7XG5cbiAgICAgIGlmICh0eXBlID09PSBcInJcIikge1xuICAgICAgICAvLyByYXdcblxuICAgICAgICBpZiAoY29uZmlnLmZpbHRlcikge1xuICAgICAgICAgIGNvbnRlbnQgPSBcIkUuZmlsdGVyKFwiICsgY29udGVudCArIFwiKVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuU3RyICs9IFwidFIrPVwiICsgY29udGVudCArIFwiXFxuXCI7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiaVwiKSB7XG4gICAgICAgIC8vIGludGVycG9sYXRlXG5cbiAgICAgICAgaWYgKGNvbmZpZy5maWx0ZXIpIHtcbiAgICAgICAgICBjb250ZW50ID0gXCJFLmZpbHRlcihcIiArIGNvbnRlbnQgKyBcIilcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcuYXV0b0VzY2FwZSkge1xuICAgICAgICAgIGNvbnRlbnQgPSBcIkUuZShcIiArIGNvbnRlbnQgKyBcIilcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5TdHIgKz0gXCJ0Uis9XCIgKyBjb250ZW50ICsgXCJcXG5cIjtcbiAgICAgICAgLy8gcmVmZXJlbmNlXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiZVwiKSB7XG4gICAgICAgIC8vIGV4ZWN1dGVcbiAgICAgICAgcmV0dXJuU3RyICs9IGNvbnRlbnQgKyBcIlxcblwiOyAvLyB5b3UgbmVlZCBhIFxcbiBpbiBjYXNlIHlvdSBoYXZlIDwlIH0gJT5cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmV0dXJuU3RyO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLFlBQVksQ0FBQztBQU8vQixhQUFhLEdBRWI7Ozs7Ozs7OztDQVNDLEdBRUQsZUFBZSxTQUFTLGVBQWUsQ0FDckMsR0FBVyxFQUNYLE1BQWlCLEVBQ1Q7SUFDUixNQUFNLE1BQU0sR0FBcUIsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQUFBQztJQUVwRCxJQUFJLEdBQUcsR0FBRyxvQkFB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