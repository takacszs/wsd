// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { Buffer } from "../buffer.ts";
import { createHash } from "./hash.ts";
import { MAX_ALLOC } from "./constants.ts";
const createHasher = (algorithm)=>(value)=>Buffer.from(createHash(algorithm).update(value).digest());
function getZeroes(zeros) {
    return Buffer.alloc(zeros);
}
const sizes = {
    md5: 16,
    sha1: 20,
    sha224: 28,
    sha256: 32,
    sha384: 48,
    sha512: 64,
    rmd160: 20,
    ripemd160: 20
};
function toBuffer(bufferable) {
    if (bufferable instanceof Uint8Array || typeof bufferable === "string") {
        return Buffer.from(bufferable);
    } else {
        return Buffer.from(bufferable.buffer);
    }
}
class Hmac {
    hash;
    ipad1;
    opad;
    alg;
    blocksize;
    size;
    ipad2;
    constructor(alg, key, saltLen){
        this.hash = createHasher(alg);
        const blocksize = alg === "sha512" || alg === "sha384" ? 128 : 64;
        if (key.length > blocksize) {
            key = this.hash(key);
        } else if (key.length < blocksize) {
            key = Buffer.concat([
                key,
                getZeroes(blocksize - key.length)
            ], blocksize);
        }
        const ipad = Buffer.allocUnsafe(blocksize + sizes[alg]);
        const opad = Buffer.allocUnsafe(blocksize + sizes[alg]);
        for(let i = 0; i < blocksize; i++){
            ipad[i] = key[i] ^ 0x36;
            opad[i] = key[i] ^ 0x5C;
        }
        const ipad1 = Buffer.allocUnsafe(blocksize + saltLen + 4);
        ipad.copy(ipad1, 0, 0, blocksize);
        this.ipad1 = ipad1;
        this.ipad2 = ipad;
        this.opad = opad;
        this.alg = alg;
        this.blocksize = blocksize;
        this.size = sizes[alg];
    }
    run(data, ipad) {
        data.copy(ipad, this.blocksize);
        const h = this.hash(ipad);
        h.copy(this.opad, this.blocksize);
        return this.hash(this.opad);
    }
}
/**
 * @param iterations Needs to be higher or equal than zero
 * @param keylen  Needs to be higher or equal than zero but less than max allocation size (2^30)
 * @param digest Algorithm to be used for encryption
 */ export function pbkdf2Sync(password, salt, iterations, keylen, digest = "sha1") {
    if (typeof iterations !== "number" || iterations < 0) {
        throw new TypeError("Bad iterations");
    }
    if (typeof keylen !== "number" || keylen < 0 || keylen > MAX_ALLOC) {
        throw new TypeError("Bad key length");
    }
    const bufferedPassword = toBuffer(password);
    const bufferedSalt = toBuffer(salt);
    const hmac = new Hmac(digest, bufferedPassword, bufferedSalt.length);
    const DK = Buffer.allocUnsafe(keylen);
    const block1 = Buffer.allocUnsafe(bufferedSalt.length + 4);
    bufferedSalt.copy(block1, 0, 0, bufferedSalt.length);
    let destPos = 0;
    const hLen = sizes[digest];
    const l = Math.ceil(keylen / hLen);
    for(let i = 1; i <= l; i++){
        block1.writeUInt32BE(i, bufferedSalt.length);
        const T = hmac.run(block1, hmac.ipad1);
        let U = T;
        for(let j = 1; j < iterations; j++){
            U = hmac.run(U, hmac.ipad2);
            for(let k = 0; k < hLen; k++)T[k] ^= U[k];
        }
        T.copy(DK, destPos);
        destPos += hLen;
    }
    return DK;
}
/**
 * @param iterations Needs to be higher or equal than zero
 * @param keylen  Needs to be higher or equal than zero but less than max allocation size (2^30)
 * @param digest Algorithm to be used for encryption
 */ export function pbkdf2(password, salt, iterations, keylen, digest = "sha1", callback) {
    setTimeout(()=>{
        let err = null, res;
        try {
            res = pbkdf2Sync(password, salt, iterations, keylen, digest);
        } catch (e) {
            err = e;
        }
        if (err) {
            callback(err instanceof Error ? err : new Error("[non-error thrown]"));
        } else {
            callback(null, res);
        }
    }, 0);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvX2NyeXB0by9wYmtkZjIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCIuLi9idWZmZXIudHNcIjtcbmltcG9ydCB7IGNyZWF0ZUhhc2ggfSBmcm9tIFwiLi9oYXNoLnRzXCI7XG5pbXBvcnQgeyBNQVhfQUxMT0MgfSBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcbmltcG9ydCB7IEhBU0hfREFUQSB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5cbmV4cG9ydCB0eXBlIE5vcm1hbGl6ZWRBbGdvcml0aG1zID1cbiAgfCBcIm1kNVwiXG4gIHwgXCJyaXBlbWQxNjBcIlxuICB8IFwic2hhMVwiXG4gIHwgXCJzaGEyMjRcIlxuICB8IFwic2hhMjU2XCJcbiAgfCBcInNoYTM4NFwiXG4gIHwgXCJzaGE1MTJcIjtcblxudHlwZSBBbGdvcml0aG1zID1cbiAgfCBcIm1kNVwiXG4gIHwgXCJyaXBlbWQxNjBcIlxuICB8IFwicm1kMTYwXCJcbiAgfCBcInNoYTFcIlxuICB8IFwic2hhMjI0XCJcbiAgfCBcInNoYTI1NlwiXG4gIHwgXCJzaGEzODRcIlxuICB8IFwic2hhNTEyXCI7XG5cbmNvbnN0IGNyZWF0ZUhhc2hlciA9IChhbGdvcml0aG06IHN0cmluZykgPT5cbiAgKHZhbHVlOiBVaW50OEFycmF5KSA9PlxuICAgIEJ1ZmZlci5mcm9tKGNyZWF0ZUhhc2goYWxnb3JpdGhtKS51cGRhdGUodmFsdWUpLmRpZ2VzdCgpIGFzIEJ1ZmZlcik7XG5cbmZ1bmN0aW9uIGdldFplcm9lcyh6ZXJvczogbnVtYmVyKSB7XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoemVyb3MpO1xufVxuXG5jb25zdCBzaXplcyA9IHtcbiAgbWQ1OiAxNixcbiAgc2hhMTogMjAsXG4gIHNoYTIyNDogMjgsXG4gIHNoYTI1NjogMzIsXG4gIHNoYTM4NDogNDgsXG4gIHNoYTUxMjogNjQsXG4gIHJtZDE2MDogMjAsXG4gIHJpcGVtZDE2MDogMjAsXG59O1xuXG5mdW5jdGlvbiB0b0J1ZmZlcihidWZmZXJhYmxlOiBIQVNIX0RBVEEpIHtcbiAgaWYgKGJ1ZmZlcmFibGUgaW5zdGFuY2VvZiBVaW50OEFycmF5IHx8IHR5cGVvZiBidWZmZXJhYmxlID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKGJ1ZmZlcmFibGUgYXMgVWludDhBcnJheSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKGJ1ZmZlcmFibGUuYnVmZmVyKTtcbiAgfVxufVxuXG5jbGFzcyBIbWFjIHtcbiAgaGFzaDogKHZhbHVlOiBVaW50OEFycmF5KSA9PiBCdWZmZXI7XG4gIGlwYWQxOiBCdWZmZXI7XG4gIG9wYWQ6IEJ1ZmZlcjtcbiAgYWxnOiBzdHJpbmc7XG4gIGJsb2Nrc2l6ZTogbnVtYmVyO1xuICBzaXplOiBudW1iZXI7XG4gIGlwYWQyOiBCdWZmZXI7XG5cbiAgY29uc3RydWN0b3IoYWxnOiBBbGdvcml0aG1zLCBrZXk6IEJ1ZmZlciwgc2FsdExlbjogbnVtYmVyKSB7XG4gICAgdGhpcy5oYXNoID0gY3JlYXRlSGFzaGVyKGFsZyk7XG5cbiAgICBjb25zdCBibG9ja3NpemUgPSAoYWxnID09PSBcInNoYTUxMlwiIHx8IGFsZyA9PT0gXCJzaGEzODRcIikgPyAxMjggOiA2NDtcblxuICAgIGlmIChrZXkubGVuZ3RoID4gYmxvY2tzaXplKSB7XG4gICAgICBrZXkgPSB0aGlzLmhhc2goa2V5KTtcbiAgICB9IGVsc2UgaWYgKGtleS5sZW5ndGggPCBibG9ja3NpemUpIHtcbiAgICAgIGtleSA9IEJ1ZmZlci5jb25jYXQoW2tleSwgZ2V0WmVyb2VzKGJsb2Nrc2l6ZSAtIGtleS5sZW5ndGgpXSwgYmxvY2tzaXplKTtcbiAgICB9XG5cbiAgICBjb25zdCBpcGFkID0gQnVmZmVyLmFsbG9jVW5zYWZlKGJsb2Nrc2l6ZSArIHNpemVzW2FsZ10pO1xuICAgIGNvbnN0IG9wYWQgPSBCdWZmZXIuYWxsb2NVbnNhZmUoYmxvY2tzaXplICsgc2l6ZXNbYWxnXSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBibG9ja3NpemU7IGkrKykge1xuICAgICAgaXBhZFtpXSA9IGtleVtpXSBeIDB4MzY7XG4gICAgICBvcGFkW2ldID0ga2V5W2ldIF4gMHg1QztcbiAgICB9XG5cbiAgICBjb25zdCBpcGFkMSA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShibG9ja3NpemUgKyBzYWx0TGVuICsgNCk7XG4gICAgaXBhZC5jb3B5KGlwYWQxLCAwLCAwLCBibG9ja3NpemUpO1xuXG4gICAgdGhpcy5pcGFkMSA9IGlwYWQxO1xuICAgIHRoaXMuaXBhZDIgPSBpcGFkO1xuICAgIHRoaXMub3BhZCA9IG9wYWQ7XG4gICAgdGhpcy5hbGcgPSBhbGc7XG4gICAgdGhpcy5ibG9ja3NpemUgPSBibG9ja3NpemU7XG4gICAgdGhpcy5zaXplID0gc2l6ZXNbYWxnXTtcbiAgfVxuXG4gIHJ1bihkYXRhOiBCdWZmZXIsIGlwYWQ6IEJ1ZmZlcikge1xuICAgIGRhdGEuY29weShpcGFkLCB0aGlzLmJsb2Nrc2l6ZSk7XG4gICAgY29uc3QgaCA9IHRoaXMuaGFzaChpcGFkKTtcbiAgICBoLmNvcHkodGhpcy5vcGFkLCB0aGlzLmJsb2Nrc2l6ZSk7XG4gICAgcmV0dXJuIHRoaXMuaGFzaCh0aGlzLm9wYWQpO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIGl0ZXJhdGlvbnMgTmVlZHMgdG8gYmUgaGlnaGVyIG9yIGVxdWFsIHRoYW4gemVyb1xuICogQHBhcmFtIGtleWxlbiAgTmVlZHMgdG8gYmUgaGlnaGVyIG9yIGVxdWFsIHRoYW4gemVybyBidXQgbGVzcyB0aGFuIG1heCBhbGxvY2F0aW9uIHNpemUgKDJeMzApXG4gKiBAcGFyYW0gZGlnZXN0IEFsZ29yaXRobSB0byBiZSB1c2VkIGZvciBlbmNyeXB0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYmtkZjJTeW5jKFxuICBwYXNzd29yZDogSEFTSF9EQVRBLFxuICBzYWx0OiBIQVNIX0RBVEEsXG4gIGl0ZXJhdGlvbnM6IG51bWJlcixcbiAga2V5bGVuOiBudW1iZXIsXG4gIGRpZ2VzdDogQWxnb3JpdGhtcyA9IFwic2hhMVwiLFxuKTogQnVmZmVyIHtcbiAgaWYgKHR5cGVvZiBpdGVyYXRpb25zICE9PSBcIm51bWJlclwiIHx8IGl0ZXJhdGlvbnMgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkJhZCBpdGVyYXRpb25zXCIpO1xuICB9XG4gIGlmICh0eXBlb2Yga2V5bGVuICE9PSBcIm51bWJlclwiIHx8IGtleWxlbiA8IDAgfHwga2V5bGVuID4gTUFYX0FMTE9DKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkJhZCBrZXkgbGVuZ3RoXCIpO1xuICB9XG5cbiAgY29uc3QgYnVmZmVyZWRQYXNzd29yZCA9IHRvQnVmZmVyKHBhc3N3b3JkKTtcbiAgY29uc3QgYnVmZmVyZWRTYWx0ID0gdG9CdWZmZXIoc2FsdCk7XG5cbiAgY29uc3QgaG1hYyA9IG5ldyBIbWFjKGRpZ2VzdCwgYnVmZmVyZWRQYXNzd29yZCwgYnVmZmVyZWRTYWx0Lmxlbmd0aCk7XG5cbiAgY29uc3QgREsgPSBCdWZmZXIuYWxsb2NVbnNhZmUoa2V5bGVuKTtcbiAgY29uc3QgYmxvY2sxID0gQnVmZmVyLmFsbG9jVW5zYWZlKGJ1ZmZlcmVkU2FsdC5sZW5ndGggKyA0KTtcbiAgYnVmZmVyZWRTYWx0LmNvcHkoYmxvY2sxLCAwLCAwLCBidWZmZXJlZFNhbHQubGVuZ3RoKTtcblxuICBsZXQgZGVzdFBvcyA9IDA7XG4gIGNvbnN0IGhMZW4gPSBzaXplc1tkaWdlc3RdO1xuICBjb25zdCBsID0gTWF0aC5jZWlsKGtleWxlbiAvIGhMZW4pO1xuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IGw7IGkrKykge1xuICAgIGJsb2NrMS53cml0ZVVJbnQzMkJFKGksIGJ1ZmZlcmVkU2FsdC5sZW5ndGgpO1xuXG4gICAgY29uc3QgVCA9IGhtYWMucnVuKGJsb2NrMSwgaG1hYy5pcGFkMSk7XG4gICAgbGV0IFUgPSBUO1xuXG4gICAgZm9yIChsZXQgaiA9IDE7IGogPCBpdGVyYXRpb25zOyBqKyspIHtcbiAgICAgIFUgPSBobWFjLnJ1bihVLCBobWFjLmlwYWQyKTtcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgaExlbjsgaysrKSBUW2tdIF49IFVba107XG4gICAgfVxuXG4gICAgVC5jb3B5KERLLCBkZXN0UG9zKTtcbiAgICBkZXN0UG9zICs9IGhMZW47XG4gIH1cblxuICByZXR1cm4gREs7XG59XG5cbi8qKlxuICogQHBhcmFtIGl0ZXJhdGlvbnMgTmVlZHMgdG8gYmUgaGlnaGVyIG9yIGVxdWFsIHRoYW4gemVyb1xuICogQHBhcmFtIGtleWxlbiAgTmVlZHMgdG8gYmUgaGlnaGVyIG9yIGVxdWFsIHRoYW4gemVybyBidXQgbGVzcyB0aGFuIG1heCBhbGxvY2F0aW9uIHNpemUgKDJeMzApXG4gKiBAcGFyYW0gZGlnZXN0IEFsZ29yaXRobSB0byBiZSB1c2VkIGZvciBlbmNyeXB0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYmtkZjIoXG4gIHBhc3N3b3JkOiBIQVNIX0RBVEEsXG4gIHNhbHQ6IEhBU0hfREFUQSxcbiAgaXRlcmF0aW9uczogbnVtYmVyLFxuICBrZXlsZW46IG51bWJlcixcbiAgZGlnZXN0OiBBbGdvcml0aG1zID0gXCJzaGExXCIsXG4gIGNhbGxiYWNrOiAoKGVycjogRXJyb3IgfCBudWxsLCBkZXJpdmVkS2V5PzogQnVmZmVyKSA9PiB2b2lkKSxcbik6IHZvaWQge1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBsZXQgZXJyID0gbnVsbCwgcmVzO1xuICAgIHRyeSB7XG4gICAgICByZXMgPSBwYmtkZjJTeW5jKFxuICAgICAgICBwYXNzd29yZCxcbiAgICAgICAgc2FsdCxcbiAgICAgICAgaXRlcmF0aW9ucyxcbiAgICAgICAga2V5bGVuLFxuICAgICAgICBkaWdlc3QsXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVyciA9IGU7XG4gICAgfVxuICAgIGlmIChlcnIpIHtcbiAgICAgIGNhbGxiYWNrKGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyIDogbmV3IEVycm9yKFwiW25vbi1lcnJvciB0aHJvd25dXCIpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICB9XG4gIH0sIDApO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxTQUFTLE1BQU0sUUFBUSxjQUFjLENBQUM7QUFDdEMsU0FBUyxVQUFVLFFBQVEsV0FBVyxDQUFDO0FBQ3ZDLFNBQVMsU0FBUyxRQUFRLGdCQUFnQixDQUFDO0FBc0IzQyxNQUFNLFlBQVksR0FBRyxDQUFDLFNBQWlCLEdBQ3JDLENBQUMsS0FBaUIsR0FDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFXLEFBQUM7QUFFeEUsU0FBUyxTQUFTLENBQUMsS0FBYSxFQUFFO0lBQ2hDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQsTUFBTSxLQUFLLEdBQUc7SUFDWixHQUFHLEVBQUUsRUFBRTtJQUNQLElBQUksRUFBRSxFQUFFO0lBQ1IsTUFBTSxFQUFFLEVBQUU7SUFDVixNQUFNLEVBQUUsRUFBRTtJQUNWLE1BQU0sRUFBRSxFQUFFO0lBQ1YsTUFBTSxFQUFFLEVBQUU7SUFDVixNQUFNLEVBQUUsRUFBRTtJQUNWLFNBQVMsRUFBRSxFQUFFO0NBQ2QsQUFBQztBQUVGLFNBQVMsUUFBUSxDQUFDLFVBQXFCLEVBQUU7SUFDdkMsSUFBSSxVQUFVLFlBQVksVUFBVSxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFBRTtRQUN0RSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENB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