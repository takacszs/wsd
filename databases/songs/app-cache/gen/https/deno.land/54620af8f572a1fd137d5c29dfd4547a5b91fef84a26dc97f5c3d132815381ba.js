function setPrototypeOf(obj, proto) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(obj, proto);
    } else {
        obj.__proto__ = proto;
    }
}
// This is pretty much the only way to get nice, extended Errors
// without using ES6
/**
 * This returns a new Error with a custom prototype. Note that it's _not_ a constructor
 *
 * @param message Error message
 *
 * **Example**
 *
 * ```js
 * throw EtaErr("template not found")
 * ```
 */ export default function EtaErr(message) {
    const err = new Error(message);
    setPrototypeOf(err, EtaErr.prototype);
    return err;
};
EtaErr.prototype = Object.create(Error.prototype, {
    name: {
        value: "Eta Error",
        enumerable: false
    }
});
/**
 * Throws an EtaErr with a nicely formatted error and message showing where in the template the error occurred.
 */ export function ParseErr(message, str, indx) {
    const whitespace = str.slice(0, indx).split(/\n/);
    const lineNo = whitespace.length;
    const colNo = whitespace[lineNo - 1].length + 1;
    message += " at line " + lineNo + " col " + colNo + ":\n\n" + "  " + str.split(/\n/)[lineNo - 1] + "\n" + "  " + Array(colNo).join(" ") + "^";
    throw EtaErr(message);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZXRhQHYxLjEyLjMvZXJyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIHNldFByb3RvdHlwZU9mKG9iajogYW55LCBwcm90bzogYW55KSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKG9iaiwgcHJvdG8pO1xuICB9IGVsc2Uge1xuICAgIG9iai5fX3Byb3RvX18gPSBwcm90bztcbiAgfVxufVxuXG4vLyBUaGlzIGlzIHByZXR0eSBtdWNoIHRoZSBvbmx5IHdheSB0byBnZXQgbmljZSwgZXh0ZW5kZWQgRXJyb3JzXG4vLyB3aXRob3V0IHVzaW5nIEVTNlxuXG4vKipcbiAqIFRoaXMgcmV0dXJucyBhIG5ldyBFcnJvciB3aXRoIGEgY3VzdG9tIHByb3RvdHlwZS4gTm90ZSB0aGF0IGl0J3MgX25vdF8gYSBjb25zdHJ1Y3RvclxuICpcbiAqIEBwYXJhbSBtZXNzYWdlIEVycm9yIG1lc3NhZ2VcbiAqXG4gKiAqKkV4YW1wbGUqKlxuICpcbiAqIGBgYGpzXG4gKiB0aHJvdyBFdGFFcnIoXCJ0ZW1wbGF0ZSBub3QgZm91bmRcIilcbiAqIGBgYFxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV0YUVycihtZXNzYWdlOiBzdHJpbmcpOiBFcnJvciB7XG4gIGNvbnN0IGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgc2V0UHJvdG90eXBlT2YoZXJyLCBFdGFFcnIucHJvdG90eXBlKTtcbiAgcmV0dXJuIGVycjtcbn1cblxuRXRhRXJyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlLCB7XG4gIG5hbWU6IHsgdmFsdWU6IFwiRXRhIEVycm9yXCIsIGVudW1lcmFibGU6IGZhbHNlIH0sXG59KTtcblxuLyoqXG4gKiBUaHJvd3MgYW4gRXRhRXJyIHdpdGggYSBuaWNlbHkgZm9ybWF0dGVkIGVycm9yIGFuZCBtZXNzYWdlIHNob3dpbmcgd2hlcmUgaW4gdGhlIHRlbXBsYXRlIHRoZSBlcnJvciBvY2N1cnJlZC5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gUGFyc2VFcnIobWVzc2FnZTogc3RyaW5nLCBzdHI6IHN0cmluZywgaW5keDogbnVtYmVyKTogdm9pZCB7XG4gIGNvbnN0IHdoaXRlc3BhY2UgPSBzdHIuc2xpY2UoMCwgaW5keCkuc3BsaXQoL1xcbi8pO1xuXG4gIGNvbnN0IGxpbmVObyA9IHdoaXRlc3BhY2UubGVuZ3RoO1xuICBjb25zdCBjb2xObyA9IHdoaXRlc3BhY2VbbGluZU5vIC0gMV0ubGVuZ3RoICsgMTtcbiAgbWVzc2FnZSArPSBcIiBhdCBsaW5lIFwiICtcbiAgICBsaW5lTm8gK1xuICAgIFwiIGNvbCBcIiArXG4gICAgY29sTm8gK1xuICAgIFwiOlxcblxcblwiICtcbiAgICBcIiAgXCIgK1xuICAgIHN0ci5zcGxpdCgvXFxuLylbbGluZU5vIC0gMV0gK1xuICAgIFwiXFxuXCIgK1xuICAgIFwiICBcIiArXG4gICAgQXJyYXkoY29sTm8pLmpvaW4oXCIgXCIpICtcbiAgICBcIl5cIjtcbiAgdGhyb3cgRXRhRXJyKG1lc3NhZ2UpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsY0FBYyxDQUFDLEdBQVEsRUFBRSxLQUFVLEVBQUU7SUFDNUMseURBQXlEO0lBQ3pELElBQUksTUFBTSxDQUFDLGNBQWMsRUFBRTtRQUN6QixNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwQyxPQUFPO1FBQ0wsR0FBRyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDeEIsQ0FBQztBQUNILENBQUM7QUFFRCxnRUFBZ0U7QUFDaEUsb0JBQW9CO0FBRXBCOzs7Ozs7Ozs7O0NBVUMsR0FFRCxlQUFlLFNBQVMsTUFBTSxDQUFDLE9BQWUsRUFBUztJQUNyRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQUFBQztJQUMvQixjQUFjLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0QyxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO0lBQ2hELElBQUksRUFBRTtRQUFFLEtBQUssRUFBRSxXQUFXO1FBQUUsVUFBVSxFQUFFLEtBQUs7S0FBRTtDQUNoRCxDQUFDLENBQUM7QUFFSDs7Q0FFQyxHQUVELE9BQU8sU0FBUyxRQUFRLENBQUMsT0FBZSxFQUFFLEdBQVcsRUFBRSxJQUFZLEVBQVE7SUFDekUsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxNQUFNLEFBQUM7SUFFbEQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQUFBQztJQUNqQyxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUM7SUFDaEQsT0FBTyxJQUFJLFdBQVcsR0FDcEIsTUFBTSxHQUNOLE9BQU8sR0FDUCxLQUFLLEdBQ0wsT0FBTyxHQUNQLElBQUksR0FDSixHQUFHLENBQUMsS0FBSyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUMzQixJQUFJLEdBQ0osSUFBSSxHQUNKLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQ3RCLEdBQUcsQ0FBQztJQUNOLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hCLENBQUMifQ==