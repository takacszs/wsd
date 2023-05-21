import { ParseErr } from "./err.ts";
import { trimWS } from "./utils.ts";
/* END TYPES */ const templateLitReg = /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})*}|(?!\${)[^\\`])*`/g;
const singleQuoteReg = /'(?:\\[\s\w"'\\`]|[^\n\r'\\])*?'/g;
const doubleQuoteReg = /"(?:\\[\s\w"'\\`]|[^\n\r"\\])*?"/g;
/** Escape special regular expression characters inside a string */ function escapeRegExp(string) {
    // From MDN
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
    ;
}
export default function parse(str, config) {
    let buffer = [];
    let trimLeftOfNextStr = false;
    let lastIndex = 0;
    const parseOptions = config.parse;
    if (config.plugins) {
        for(let i = 0; i < config.plugins.length; i++){
            const plugin = config.plugins[i];
            if (plugin.processTemplate) {
                str = plugin.processTemplate(str, config);
            }
        }
    }
    /* Adding for EJS compatibility */ if (config.rmWhitespace) {
        // Code taken directly from EJS
        // Have to use two separate replaces here as `^` and `$` operators don't
        // work well with `\r` and empty lines don't work well with the `m` flag.
        // Essentially, this replaces the whitespace at the beginning and end of
        // each line and removes multiple newlines.
        str = str.replace(/[\r\n]+/g, "\n").replace(/^\s+|\s+$/gm, "");
    }
    /* End rmWhitespace option */ templateLitReg.lastIndex = 0;
    singleQuoteReg.lastIndex = 0;
    doubleQuoteReg.lastIndex = 0;
    function pushString(strng, shouldTrimRightOfString) {
        if (strng) {
            // if string is truthy it must be of type 'string'
            strng = trimWS(strng, config, trimLeftOfNextStr, shouldTrimRightOfString);
            if (strng) {
                // replace \ with \\, ' with \'
                // we're going to convert all CRLF to LF so it doesn't take more than one replace
                strng = strng.replace(/\\|'/g, "\\$&").replace(/\r\n|\n|\r/g, "\\n");
                buffer.push(strng);
            }
        }
    }
    const prefixes = [
        parseOptions.exec,
        parseOptions.interpolate,
        parseOptions.raw, 
    ].reduce(function(accumulator, prefix) {
        if (accumulator && prefix) {
            return accumulator + "|" + escapeRegExp(prefix);
        } else if (prefix) {
            // accumulator is falsy
            return escapeRegExp(prefix);
        } else {
            // prefix and accumulator are both falsy
            return accumulator;
        }
    }, "");
    const parseOpenReg = new RegExp("([^]*?)" + escapeRegExp(config.tags[0]) + "(-|_)?\\s*(" + prefixes + ")?\\s*", "g");
    const parseCloseReg = new RegExp("'|\"|`|\\/\\*|(\\s*(-|_)?" + escapeRegExp(config.tags[1]) + ")", "g");
    // TODO: benchmark having the \s* on either side vs using str.trim()
    let m;
    while(m = parseOpenReg.exec(str)){
        lastIndex = m[0].length + m.index;
        const precedingString = m[1];
        const wsLeft = m[2];
        const prefix = m[3] || ""; // by default either ~, =, or empty
        pushString(precedingString, wsLeft);
        parseCloseReg.lastIndex = lastIndex;
        let closeTag;
        let currentObj = false;
        while(closeTag = parseCloseReg.exec(str)){
            if (closeTag[1]) {
                let content = str.slice(lastIndex, closeTag.index);
                parseOpenReg.lastIndex = lastIndex = parseCloseReg.lastIndex;
                trimLeftOfNextStr = closeTag[2];
                const currentType = prefix === parseOptions.exec ? "e" : prefix === parseOptions.raw ? "r" : prefix === parseOptions.interpolate ? "i" : "";
                currentObj = {
                    t: currentType,
                    val: content
                };
                break;
            } else {
                const char = closeTag[0];
                if (char === "/*") {
                    const commentCloseInd = str.indexOf("*/", parseCloseReg.lastIndex);
                    if (commentCloseInd === -1) {
                        ParseErr("unclosed comment", str, closeTag.index);
                    }
                    parseCloseReg.lastIndex = commentCloseInd;
                } else if (char === "'") {
                    singleQuoteReg.lastIndex = closeTag.index;
                    const singleQuoteMatch = singleQuoteReg.exec(str);
                    if (singleQuoteMatch) {
                        parseCloseReg.lastIndex = singleQuoteReg.lastIndex;
                    } else {
                        ParseErr("unclosed string", str, closeTag.index);
                    }
                } else if (char === '"') {
                    doubleQuoteReg.lastIndex = closeTag.index;
                    const doubleQuoteMatch = doubleQuoteReg.exec(str);
                    if (doubleQuoteMatch) {
                        parseCloseReg.lastIndex = doubleQuoteReg.lastIndex;
                    } else {
                        ParseErr("unclosed string", str, closeTag.index);
                    }
                } else if (char === "`") {
                    templateLitReg.lastIndex = closeTag.index;
                    const templateLitMatch = templateLitReg.exec(str);
                    if (templateLitMatch) {
                        parseCloseReg.lastIndex = templateLitReg.lastIndex;
                    } else {
                        ParseErr("unclosed string", str, closeTag.index);
                    }
                }
            }
        }
        if (currentObj) {
            buffer.push(currentObj);
        } else {
            ParseErr("unclosed tag", str, m.index + precedingString.length);
        }
    }
    pushString(str.slice(lastIndex, str.length), false);
    if (config.plugins) {
        for(let i1 = 0; i1 < config.plugins.length; i1++){
            const plugin1 = config.plugins[i1];
            if (plugin1.processAST) {
                buffer = plugin1.processAST(buffer, config);
            }
        }
    }
    return buffer;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZXRhQHYxLjEyLjMvcGFyc2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFyc2VFcnIgfSBmcm9tIFwiLi9lcnIudHNcIjtcbmltcG9ydCB7IHRyaW1XUyB9IGZyb20gXCIuL3V0aWxzLnRzXCI7XG5cbi8qIFRZUEVTICovXG5cbmltcG9ydCB0eXBlIHsgRXRhQ29uZmlnIH0gZnJvbSBcIi4vY29uZmlnLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFRhZ1R5cGUgPSBcInJcIiB8IFwiZVwiIHwgXCJpXCIgfCBcIlwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlT2JqZWN0IHtcbiAgdDogVGFnVHlwZTtcbiAgdmFsOiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIEFzdE9iamVjdCA9IHN0cmluZyB8IFRlbXBsYXRlT2JqZWN0O1xuXG4vKiBFTkQgVFlQRVMgKi9cblxuY29uc3QgdGVtcGxhdGVMaXRSZWcgPVxuICAvYCg/OlxcXFxbXFxzXFxTXXxcXCR7KD86W157fV18eyg/Oltee31dfHtbXn1dKn0pKn0pKn18KD8hXFwkeylbXlxcXFxgXSkqYC9nO1xuXG5jb25zdCBzaW5nbGVRdW90ZVJlZyA9IC8nKD86XFxcXFtcXHNcXHdcIidcXFxcYF18W15cXG5cXHInXFxcXF0pKj8nL2c7XG5cbmNvbnN0IGRvdWJsZVF1b3RlUmVnID0gL1wiKD86XFxcXFtcXHNcXHdcIidcXFxcYF18W15cXG5cXHJcIlxcXFxdKSo/XCIvZztcblxuLyoqIEVzY2FwZSBzcGVjaWFsIHJlZ3VsYXIgZXhwcmVzc2lvbiBjaGFyYWN0ZXJzIGluc2lkZSBhIHN0cmluZyAqL1xuXG5mdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyaW5nOiBzdHJpbmcpIHtcbiAgLy8gRnJvbSBNRE5cbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bLiorXFwtP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIikgLy8gJCYgbWVhbnMgdGhlIHdob2xlIG1hdGNoZWQgc3RyaW5nXG4gIDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2UoXG4gIHN0cjogc3RyaW5nLFxuICBjb25maWc6IEV0YUNvbmZpZyxcbik6IEFycmF5PEFzdE9iamVjdD4ge1xuICBsZXQgYnVmZmVyOiBBcnJheTxBc3RPYmplY3Q+ID0gW107XG4gIGxldCB0cmltTGVmdE9mTmV4dFN0cjogc3RyaW5nIHwgZmFsc2UgPSBmYWxzZTtcbiAgbGV0IGxhc3RJbmRleCA9IDA7XG4gIGNvbnN0IHBhcnNlT3B0aW9ucyA9IGNvbmZpZy5wYXJzZTtcblxuICBpZiAoY29uZmlnLnBsdWdpbnMpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbmZpZy5wbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwbHVnaW4gPSBjb25maWcucGx1Z2luc1tpXTtcbiAgICAgIGlmIChwbHVnaW4ucHJvY2Vzc1RlbXBsYXRlKSB7XG4gICAgICAgIHN0ciA9IHBsdWdpbi5wcm9jZXNzVGVtcGxhdGUoc3RyLCBjb25maWcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qIEFkZGluZyBmb3IgRUpTIGNvbXBhdGliaWxpdHkgKi9cbiAgaWYgKGNvbmZpZy5ybVdoaXRlc3BhY2UpIHtcbiAgICAvLyBDb2RlIHRha2VuIGRpcmVjdGx5IGZyb20gRUpTXG4gICAgLy8gSGF2ZSB0byB1c2UgdHdvIHNlcGFyYXRlIHJlcGxhY2VzIGhlcmUgYXMgYF5gIGFuZCBgJGAgb3BlcmF0b3JzIGRvbid0XG4gICAgLy8gd29yayB3ZWxsIHdpdGggYFxccmAgYW5kIGVtcHR5IGxpbmVzIGRvbid0IHdvcmsgd2VsbCB3aXRoIHRoZSBgbWAgZmxhZy5cbiAgICAvLyBFc3NlbnRpYWxseSwgdGhpcyByZXBsYWNlcyB0aGUgd2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2ZcbiAgICAvLyBlYWNoIGxpbmUgYW5kIHJlbW92ZXMgbXVsdGlwbGUgbmV3bGluZXMuXG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1tcXHJcXG5dKy9nLCBcIlxcblwiKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nbSwgXCJcIik7XG4gIH1cbiAgLyogRW5kIHJtV2hpdGVzcGFjZSBvcHRpb24gKi9cblxuICB0ZW1wbGF0ZUxpdFJlZy5sYXN0SW5kZXggPSAwO1xuICBzaW5nbGVRdW90ZVJlZy5sYXN0SW5kZXggPSAwO1xuICBkb3VibGVRdW90ZVJlZy5sYXN0SW5kZXggPSAwO1xuXG4gIGZ1bmN0aW9uIHB1c2hTdHJpbmcoc3Rybmc6IHN0cmluZywgc2hvdWxkVHJpbVJpZ2h0T2ZTdHJpbmc/OiBzdHJpbmcgfCBmYWxzZSkge1xuICAgIGlmIChzdHJuZykge1xuICAgICAgLy8gaWYgc3RyaW5nIGlzIHRydXRoeSBpdCBtdXN0IGJlIG9mIHR5cGUgJ3N0cmluZydcblxuICAgICAgc3RybmcgPSB0cmltV1MoXG4gICAgICAgIHN0cm5nLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIHRyaW1MZWZ0T2ZOZXh0U3RyLCAvLyB0aGlzIHdpbGwgb25seSBiZSBmYWxzZSBvbiB0aGUgZmlyc3Qgc3RyLCB0aGUgbmV4dCBvbmVzIHdpbGwgYmUgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgc2hvdWxkVHJpbVJpZ2h0T2ZTdHJpbmcsXG4gICAgICApO1xuXG4gICAgICBpZiAoc3RybmcpIHtcbiAgICAgICAgLy8gcmVwbGFjZSBcXCB3aXRoIFxcXFwsICcgd2l0aCBcXCdcbiAgICAgICAgLy8gd2UncmUgZ29pbmcgdG8gY29udmVydCBhbGwgQ1JMRiB0byBMRiBzbyBpdCBkb2Vzbid0IHRha2UgbW9yZSB0aGFuIG9uZSByZXBsYWNlXG5cbiAgICAgICAgc3RybmcgPSBzdHJuZy5yZXBsYWNlKC9cXFxcfCcvZywgXCJcXFxcJCZcIikucmVwbGFjZSgvXFxyXFxufFxcbnxcXHIvZywgXCJcXFxcblwiKTtcblxuICAgICAgICBidWZmZXIucHVzaChzdHJuZyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcHJlZml4ZXMgPSBbXG4gICAgcGFyc2VPcHRpb25zLmV4ZWMsXG4gICAgcGFyc2VPcHRpb25zLmludGVycG9sYXRlLFxuICAgIHBhcnNlT3B0aW9ucy5yYXcsXG4gIF0ucmVkdWNlKGZ1bmN0aW9uIChcbiAgICBhY2N1bXVsYXRvcixcbiAgICBwcmVmaXgsXG4gICkge1xuICAgIGlmIChhY2N1bXVsYXRvciAmJiBwcmVmaXgpIHtcbiAgICAgIHJldHVybiBhY2N1bXVsYXRvciArIFwifFwiICsgZXNjYXBlUmVnRXhwKHByZWZpeCk7XG4gICAgfSBlbHNlIGlmIChwcmVmaXgpIHtcbiAgICAgIC8vIGFjY3VtdWxhdG9yIGlzIGZhbHN5XG4gICAgICByZXR1cm4gZXNjYXBlUmVnRXhwKHByZWZpeCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHByZWZpeCBhbmQgYWNjdW11bGF0b3IgYXJlIGJvdGggZmFsc3lcbiAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICB9XG4gIH0sIFwiXCIpO1xuXG4gIGNvbnN0IHBhcnNlT3BlblJlZyA9IG5ldyBSZWdFeHAoXG4gICAgXCIoW15dKj8pXCIgKyBlc2NhcGVSZWdFeHAoY29uZmlnLnRhZ3NbMF0pICsgXCIoLXxfKT9cXFxccyooXCIgKyBwcmVmaXhlcyArXG4gICAgICBcIik/XFxcXHMqXCIsXG4gICAgXCJnXCIsXG4gICk7XG5cbiAgY29uc3QgcGFyc2VDbG9zZVJlZyA9IG5ldyBSZWdFeHAoXG4gICAgXCInfFxcXCJ8YHxcXFxcL1xcXFwqfChcXFxccyooLXxfKT9cIiArIGVzY2FwZVJlZ0V4cChjb25maWcudGFnc1sxXSkgKyBcIilcIixcbiAgICBcImdcIixcbiAgKTtcbiAgLy8gVE9ETzogYmVuY2htYXJrIGhhdmluZyB0aGUgXFxzKiBvbiBlaXRoZXIgc2lkZSB2cyB1c2luZyBzdHIudHJpbSgpXG5cbiAgbGV0IG07XG5cbiAgd2hpbGUgKChtID0gcGFyc2VPcGVuUmVnLmV4ZWMoc3RyKSkpIHtcbiAgICBsYXN0SW5kZXggPSBtWzBdLmxlbmd0aCArIG0uaW5kZXg7XG5cbiAgICBjb25zdCBwcmVjZWRpbmdTdHJpbmcgPSBtWzFdO1xuICAgIGNvbnN0IHdzTGVmdCA9IG1bMl07XG4gICAgY29uc3QgcHJlZml4ID0gbVszXSB8fCBcIlwiOyAvLyBieSBkZWZhdWx0IGVpdGhlciB+LCA9LCBvciBlbXB0eVxuXG4gICAgcHVzaFN0cmluZyhwcmVjZWRpbmdTdHJpbmcsIHdzTGVmdCk7XG5cbiAgICBwYXJzZUNsb3NlUmVnLmxhc3RJbmRleCA9IGxhc3RJbmRleDtcbiAgICBsZXQgY2xvc2VUYWc7XG4gICAgbGV0IGN1cnJlbnRPYmo6IEFzdE9iamVjdCB8IGZhbHNlID0gZmFsc2U7XG5cbiAgICB3aGlsZSAoKGNsb3NlVGFnID0gcGFyc2VDbG9zZVJlZy5leGVjKHN0cikpKSB7XG4gICAgICBpZiAoY2xvc2VUYWdbMV0pIHtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBzdHIuc2xpY2UobGFzdEluZGV4LCBjbG9zZVRhZy5pbmRleCk7XG5cbiAgICAgICAgcGFyc2VPcGVuUmVnLmxhc3RJbmRleCA9IGxhc3RJbmRleCA9IHBhcnNlQ2xvc2VSZWcubGFzdEluZGV4O1xuXG4gICAgICAgIHRyaW1MZWZ0T2ZOZXh0U3RyID0gY2xvc2VUYWdbMl07XG5cbiAgICAgICAgY29uc3QgY3VycmVudFR5cGU6IFRhZ1R5cGUgPSBwcmVmaXggPT09IHBhcnNlT3B0aW9ucy5leGVjXG4gICAgICAgICAgPyBcImVcIlxuICAgICAgICAgIDogcHJlZml4ID09PSBwYXJzZU9wdGlvbnMucmF3XG4gICAgICAgICAgPyBcInJcIlxuICAgICAgICAgIDogcHJlZml4ID09PSBwYXJzZU9wdGlvbnMuaW50ZXJwb2xhdGVcbiAgICAgICAgICA/IFwiaVwiXG4gICAgICAgICAgOiBcIlwiO1xuXG4gICAgICAgIGN1cnJlbnRPYmogPSB7IHQ6IGN1cnJlbnRUeXBlLCB2YWw6IGNvbnRlbnQgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjaGFyID0gY2xvc2VUYWdbMF07XG4gICAgICAgIGlmIChjaGFyID09PSBcIi8qXCIpIHtcbiAgICAgICAgICBjb25zdCBjb21tZW50Q2xvc2VJbmQgPSBzdHIuaW5kZXhPZihcIiovXCIsIHBhcnNlQ2xvc2VSZWcubGFzdEluZGV4KTtcblxuICAgICAgICAgIGlmIChjb21tZW50Q2xvc2VJbmQgPT09IC0xKSB7XG4gICAgICAgICAgICBQYXJzZUVycihcInVuY2xvc2VkIGNvbW1lbnRcIiwgc3RyLCBjbG9zZVRhZy5pbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcnNlQ2xvc2VSZWcubGFzdEluZGV4ID0gY29tbWVudENsb3NlSW5kO1xuICAgICAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgc2luZ2xlUXVvdGVSZWcubGFzdEluZGV4ID0gY2xvc2VUYWcuaW5kZXg7XG5cbiAgICAgICAgICBjb25zdCBzaW5nbGVRdW90ZU1hdGNoID0gc2luZ2xlUXVvdGVSZWcuZXhlYyhzdHIpO1xuICAgICAgICAgIGlmIChzaW5nbGVRdW90ZU1hdGNoKSB7XG4gICAgICAgICAgICBwYXJzZUNsb3NlUmVnLmxhc3RJbmRleCA9IHNpbmdsZVF1b3RlUmVnLmxhc3RJbmRleDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUGFyc2VFcnIoXCJ1bmNsb3NlZCBzdHJpbmdcIiwgc3RyLCBjbG9zZVRhZy5pbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGNoYXIgPT09ICdcIicpIHtcbiAgICAgICAgICBkb3VibGVRdW90ZVJlZy5sYXN0SW5kZXggPSBjbG9zZVRhZy5pbmRleDtcbiAgICAgICAgICBjb25zdCBkb3VibGVRdW90ZU1hdGNoID0gZG91YmxlUXVvdGVSZWcuZXhlYyhzdHIpO1xuXG4gICAgICAgICAgaWYgKGRvdWJsZVF1b3RlTWF0Y2gpIHtcbiAgICAgICAgICAgIHBhcnNlQ2xvc2VSZWcubGFzdEluZGV4ID0gZG91YmxlUXVvdGVSZWcubGFzdEluZGV4O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBQYXJzZUVycihcInVuY2xvc2VkIHN0cmluZ1wiLCBzdHIsIGNsb3NlVGFnLmluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCJgXCIpIHtcbiAgICAgICAgICB0ZW1wbGF0ZUxpdFJlZy5sYXN0SW5kZXggPSBjbG9zZVRhZy5pbmRleDtcbiAgICAgICAgICBjb25zdCB0ZW1wbGF0ZUxpdE1hdGNoID0gdGVtcGxhdGVMaXRSZWcuZXhlYyhzdHIpO1xuICAgICAgICAgIGlmICh0ZW1wbGF0ZUxpdE1hdGNoKSB7XG4gICAgICAgICAgICBwYXJzZUNsb3NlUmVnLmxhc3RJbmRleCA9IHRlbXBsYXRlTGl0UmVnLmxhc3RJbmRleDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUGFyc2VFcnIoXCJ1bmNsb3NlZCBzdHJpbmdcIiwgc3RyLCBjbG9zZVRhZy5pbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjdXJyZW50T2JqKSB7XG4gICAgICBidWZmZXIucHVzaChjdXJyZW50T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgUGFyc2VFcnIoXCJ1bmNsb3NlZCB0YWdcIiwgc3RyLCBtLmluZGV4ICsgcHJlY2VkaW5nU3RyaW5nLmxlbmd0aCk7XG4gICAgfVxuICB9XG5cbiAgcHVzaFN0cmluZyhzdHIuc2xpY2UobGFzdEluZGV4LCBzdHIubGVuZ3RoKSwgZmFsc2UpO1xuXG4gIGlmIChjb25maWcucGx1Z2lucykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29uZmlnLnBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHBsdWdpbiA9IGNvbmZpZy5wbHVnaW5zW2ldO1xuICAgICAgaWYgKHBsdWdpbi5wcm9jZXNzQVNUKSB7XG4gICAgICAgIGJ1ZmZlciA9IHBsdWdpbi5wcm9jZXNzQVNUKGJ1ZmZlciwgY29uZmlnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmZmVyO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsUUFBUSxRQUFRLFVBQVUsQ0FBQztBQUNwQyxTQUFTLE1BQU0sUUFBUSxZQUFZLENBQUM7QUFlcEMsYUFBYSxHQUViLE1BQU0sY0FBYyx1RUFDa0QsQUFBQztBQUV2RSxNQUFNLGNBQWMsc0NBQXNDLEFBQUM7QUFFM0QsTUFBTSxjQUFjLHNDQUFzQyxBQUFDO0FBRTNELGlFQUFpRSxHQUVqRSxTQUFTLFlBQVksQ0FBQyxNQUFjLEVBQUU7SUFDcEMsV0FBVztJQUNYLE9BQU8sTUFBTSxDQUFDLE9BQU8sMEJBQTBCLE1BQU0sQ0FBQyxDQUFDLG9DQUFvQztLQUMxRjtBQUNILENBQUM7QUFFRCxlQUFlLFNBQVMsS0FBSyxDQUMzQixHQUFXLEVBQ1gsTUFBaUIsRUFDQztJQUNsQixJQUFJLE1BQU0sR0FBcUIsRUFBRSxBQUFDO0lBQ2xDLElBQUksaUJBQWlCLEdBQW1CLEtBQUssQUFBQztJQUM5QyxJQUFJLFNBQVMsR0FBRyxDQUFDLEFBQUM7SUFDbEIsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssQUFBQztJQUVsQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7UUFDbEIsSUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFFO1lBQzlDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEFBQUM7WUFDakMsSUFBSSxNQUFNLENBQUMsZUFBZSxFQUFFO2dCQUMxQixHQUFHLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsZ0NBQWdDLEdBQ2hDLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRTtR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