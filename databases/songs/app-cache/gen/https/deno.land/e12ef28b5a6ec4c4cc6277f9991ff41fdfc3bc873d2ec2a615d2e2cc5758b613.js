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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZXRhQHYxLjEyLjMvY29tcGlsZS1zdHJpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFBhcnNlIGZyb20gXCIuL3BhcnNlLnRzXCI7XG5cbi8qIFRZUEVTICovXG5cbmltcG9ydCB0eXBlIHsgRXRhQ29uZmlnIH0gZnJvbSBcIi4vY29uZmlnLnRzXCI7XG5pbXBvcnQgdHlwZSB7IEFzdE9iamVjdCB9IGZyb20gXCIuL3BhcnNlLnRzXCI7XG5cbi8qIEVORCBUWVBFUyAqL1xuXG4vKipcbiAqIENvbXBpbGVzIGEgdGVtcGxhdGUgc3RyaW5nIHRvIGEgZnVuY3Rpb24gc3RyaW5nLiBNb3N0IG9mdGVuIHVzZXJzIGp1c3QgdXNlIGBjb21waWxlKClgLCB3aGljaCBjYWxscyBgY29tcGlsZVRvU3RyaW5nYCBhbmQgY3JlYXRlcyBhIG5ldyBmdW5jdGlvbiB1c2luZyB0aGUgcmVzdWx0XG4gKlxuICogKipFeGFtcGxlKipcbiAqXG4gKiBgYGBqc1xuICogY29tcGlsZVRvU3RyaW5nKFwiSGkgPCU9IGl0LnVzZXIgJT5cIiwgZXRhLmNvbmZpZylcbiAqIC8vIFwidmFyIHRSPScnLGluY2x1ZGU9RS5pbmNsdWRlLmJpbmQoRSksaW5jbHVkZUZpbGU9RS5pbmNsdWRlRmlsZS5iaW5kKEUpO3RSKz0nSGkgJzt0Uis9RS5lKGl0LnVzZXIpO2lmKGNiKXtjYihudWxsLHRSKX0gcmV0dXJuIHRSXCJcbiAqIGBgYFxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbXBpbGVUb1N0cmluZyhcbiAgc3RyOiBzdHJpbmcsXG4gIGNvbmZpZzogRXRhQ29uZmlnLFxuKTogc3RyaW5nIHtcbiAgY29uc3QgYnVmZmVyOiBBcnJheTxBc3RPYmplY3Q+ID0gUGFyc2Uoc3RyLCBjb25maWcpO1xuXG4gIGxldCByZXMgPSBcInZhciB0Uj0nJyxfX2wsX19sUFwiICtcbiAgICAoY29uZmlnLmluY2x1ZGUgPyBcIixpbmNsdWRlPUUuaW5jbHVkZS5iaW5kKEUpXCIgOiBcIlwiKSArXG4gICAgKGNvbmZpZy5pbmNsdWRlRmlsZSA/IFwiLGluY2x1ZGVGaWxlPUUuaW5jbHVkZUZpbGUuYmluZChFKVwiIDogXCJcIikgK1xuICAgIFwiXFxuZnVuY3Rpb24gbGF5b3V0KHAsZCl7X19sPXA7X19sUD1kfVxcblwiICtcbiAgICAoY29uZmlnLnVzZVdpdGggPyBcIndpdGgoXCIgKyBjb25maWcudmFyTmFtZSArIFwifHx7fSl7XCIgOiBcIlwiKSArXG4gICAgY29tcGlsZVNjb3BlKGJ1ZmZlciwgY29uZmlnKSArXG4gICAgKGNvbmZpZy5pbmNsdWRlRmlsZVxuICAgICAgPyBcImlmKF9fbCl0Uj1cIiArXG4gICAgICAgIChjb25maWcuYXN5bmMgPyBcImF3YWl0IFwiIDogXCJcIikgK1xuICAgICAgICBgaW5jbHVkZUZpbGUoX19sLE9iamVjdC5hc3NpZ24oJHtjb25maWcudmFyTmFtZX0se2JvZHk6dFJ9LF9fbFApKVxcbmBcbiAgICAgIDogY29uZmlnLmluY2x1ZGVcbiAgICAgID8gXCJpZihfX2wpdFI9XCIgK1xuICAgICAgICAoY29uZmlnLmFzeW5jID8gXCJhd2FpdCBcIiA6IFwiXCIpICtcbiAgICAgICAgYGluY2x1ZGUoX19sLE9iamVjdC5hc3NpZ24oJHtjb25maWcudmFyTmFtZX0se2JvZHk6dFJ9LF9fbFApKVxcbmBcbiAgICAgIDogXCJcIikgK1xuICAgIFwiaWYoY2Ipe2NiKG51bGwsdFIpfSByZXR1cm4gdFJcIiArXG4gICAgKGNvbmZpZy51c2VXaXRoID8gXCJ9XCIgOiBcIlwiKTtcblxuICBpZiAoY29uZmlnLnBsdWdpbnMpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbmZpZy5wbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwbHVnaW4gPSBjb25maWcucGx1Z2luc1tpXTtcbiAgICAgIGlmIChwbHVnaW4ucHJvY2Vzc0ZuU3RyaW5nKSB7XG4gICAgICAgIHJlcyA9IHBsdWdpbi5wcm9jZXNzRm5TdHJpbmcocmVzLCBjb25maWcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogTG9vcHMgdGhyb3VnaCB0aGUgQVNUIGdlbmVyYXRlZCBieSBgcGFyc2VgIGFuZCB0cmFuc2Zvcm0gZWFjaCBpdGVtIGludG8gSlMgY2FsbHNcbiAqXG4gKiAqKkV4YW1wbGUqKlxuICpcbiAqIGBgYGpzXG4gKiAvLyBBU1QgdmVyc2lvbiBvZiAnSGkgPCU9IGl0LnVzZXIgJT4nXG4gKiBsZXQgdGVtcGxhdGVBU1QgPSBbJ0hpICcsIHsgdmFsOiAnaXQudXNlcicsIHQ6ICdpJyB9XVxuICogY29tcGlsZVNjb3BlKHRlbXBsYXRlQVNULCBldGEuY29uZmlnKVxuICogLy8gXCJ0Uis9J0hpICc7dFIrPUUuZShpdC51c2VyKTtcIlxuICogYGBgXG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZVNjb3BlKGJ1ZmY6IEFycmF5PEFzdE9iamVjdD4sIGNvbmZpZzogRXRhQ29uZmlnKSB7XG4gIGxldCBpID0gMDtcbiAgY29uc3QgYnVmZkxlbmd0aCA9IGJ1ZmYubGVuZ3RoO1xuICBsZXQgcmV0dXJuU3RyID0gXCJcIjtcblxuICBmb3IgKGk7IGkgPCBidWZmTGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjdXJyZW50QmxvY2sgPSBidWZmW2ldO1xuICAgIGlmICh0eXBlb2YgY3VycmVudEJsb2NrID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBjb25zdCBzdHIgPSBjdXJyZW50QmxvY2s7XG5cbiAgICAgIC8vIHdlIGtub3cgc3RyaW5nIGV4aXN0c1xuICAgICAgcmV0dXJuU3RyICs9IFwidFIrPSdcIiArIHN0ciArIFwiJ1xcblwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlID0gY3VycmVudEJsb2NrLnQ7IC8vIH4sIHMsICEsID8sIHJcbiAgICAgIGxldCBjb250ZW50ID0gY3VycmVudEJsb2NrLnZhbCB8fCBcIlwiO1xuXG4gICAgICBpZiAodHlwZSA9PT0gXCJyXCIpIHtcbiAgICAgICAgLy8gcmF3XG5cbiAgICAgICAgaWYgKGNvbmZpZy5maWx0ZXIpIHtcbiAgICAgICAgICBjb250ZW50ID0gXCJFLmZpbHRlcihcIiArIGNvbnRlbnQgKyBcIilcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVyblN0ciArPSBcInRSKz1cIiArIGNvbnRlbnQgKyBcIlxcblwiO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcImlcIikge1xuICAgICAgICAvLyBpbnRlcnBvbGF0ZVxuXG4gICAgICAgIGlmIChjb25maWcuZmlsdGVyKSB7XG4gICAgICAgICAgY29udGVudCA9IFwiRS5maWx0ZXIoXCIgKyBjb250ZW50ICsgXCIpXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29uZmlnLmF1dG9Fc2NhcGUpIHtcbiAgICAgICAgICBjb250ZW50ID0gXCJFLmUoXCIgKyBjb250ZW50ICsgXCIpXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuU3RyICs9IFwidFIrPVwiICsgY29udGVudCArIFwiXFxuXCI7XG4gICAgICAgIC8vIHJlZmVyZW5jZVxuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcImVcIikge1xuICAgICAgICAvLyBleGVjdXRlXG4gICAgICAgIHJldHVyblN0ciArPSBjb250ZW50ICsgXCJcXG5cIjsgLy8geW91IG5lZWQgYSBcXG4gaW4gY2FzZSB5b3UgaGF2ZSA8JSB9ICU+XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJldHVyblN0cjtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssTUFBTSxZQUFZLENBQUM7QUFPL0IsYUFBYSxHQUViOzs7Ozs7Ozs7Q0FTQyxHQUVELGVBQWUsU0FBUyxlQUFlLENBQ3JDLEdBQVcsRUFDWCxNQUFpQixFQUNUO0lBQ1IsTUFBTSxNQUFNLEdBQXFCLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEFBQUM7SUFFcEQsSUFBSSxHQUFHLEdBQUcsb0JB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