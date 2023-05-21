// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { denoErrorToNodeError } from "../internal/errors.ts";
export function convertFileInfoToStats(origin) {
    return {
        dev: origin.dev,
        ino: origin.ino,
        mode: origin.mode,
        nlink: origin.nlink,
        uid: origin.uid,
        gid: origin.gid,
        rdev: origin.rdev,
        size: origin.size,
        blksize: origin.blksize,
        blocks: origin.blocks,
        mtime: origin.mtime,
        atime: origin.atime,
        birthtime: origin.birthtime,
        mtimeMs: origin.mtime?.getTime() || null,
        atimeMs: origin.atime?.getTime() || null,
        birthtimeMs: origin.birthtime?.getTime() || null,
        isFile: ()=>origin.isFile,
        isDirectory: ()=>origin.isDirectory,
        isSymbolicLink: ()=>origin.isSymlink,
        // not sure about those
        isBlockDevice: ()=>false,
        isFIFO: ()=>false,
        isCharacterDevice: ()=>false,
        isSocket: ()=>false,
        ctime: origin.mtime,
        ctimeMs: origin.mtime?.getTime() || null
    };
}
function toBigInt(number) {
    if (number === null || number === undefined) return null;
    return BigInt(number);
}
export function convertFileInfoToBigIntStats(origin) {
    return {
        dev: toBigInt(origin.dev),
        ino: toBigInt(origin.ino),
        mode: toBigInt(origin.mode),
        nlink: toBigInt(origin.nlink),
        uid: toBigInt(origin.uid),
        gid: toBigInt(origin.gid),
        rdev: toBigInt(origin.rdev),
        size: toBigInt(origin.size) || 0n,
        blksize: toBigInt(origin.blksize),
        blocks: toBigInt(origin.blocks),
        mtime: origin.mtime,
        atime: origin.atime,
        birthtime: origin.birthtime,
        mtimeMs: origin.mtime ? BigInt(origin.mtime.getTime()) : null,
        atimeMs: origin.atime ? BigInt(origin.atime.getTime()) : null,
        birthtimeMs: origin.birthtime ? BigInt(origin.birthtime.getTime()) : null,
        mtimeNs: origin.mtime ? BigInt(origin.mtime.getTime()) * 1000000n : null,
        atimeNs: origin.atime ? BigInt(origin.atime.getTime()) * 1000000n : null,
        birthtimeNs: origin.birthtime ? BigInt(origin.birthtime.getTime()) * 1000000n : null,
        isFile: ()=>origin.isFile,
        isDirectory: ()=>origin.isDirectory,
        isSymbolicLink: ()=>origin.isSymlink,
        // not sure about those
        isBlockDevice: ()=>false,
        isFIFO: ()=>false,
        isCharacterDevice: ()=>false,
        isSocket: ()=>false,
        ctime: origin.mtime,
        ctimeMs: origin.mtime ? BigInt(origin.mtime.getTime()) : null,
        ctimeNs: origin.mtime ? BigInt(origin.mtime.getTime()) * 1000000n : null
    };
}
// shortcut for Convert File Info to Stats or BigIntStats
export function CFISBIS(fileInfo, bigInt) {
    if (bigInt) return convertFileInfoToBigIntStats(fileInfo);
    return convertFileInfoToStats(fileInfo);
}
export function stat(path, optionsOrCallback, maybeCallback) {
    const callback = typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback;
    const options = typeof optionsOrCallback === "object" ? optionsOrCallback : {
        bigint: false
    };
    if (!callback) throw new Error("No callback function supplied");
    Deno.stat(path).then((stat)=>callback(null, CFISBIS(stat, options.bigint)), (err)=>callback(denoErrorToNodeError(err, {
            syscall: "stat"
        })));
}
export function statSync(path, options = {
    bigint: false,
    throwIfNoEntry: true
}) {
    try {
        const origin = Deno.statSync(path);
        return CFISBIS(origin, options.bigint);
    } catch (err) {
        if (options?.throwIfNoEntry === false && err instanceof Deno.errors.NotFound) {
            return;
        }
        if (err instanceof Error) {
            throw denoErrorToNodeError(err, {
                syscall: "stat"
            });
        } else {
            throw err;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvX2ZzL19mc19zdGF0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyBkZW5vRXJyb3JUb05vZGVFcnJvciB9IGZyb20gXCIuLi9pbnRlcm5hbC9lcnJvcnMudHNcIjtcblxuZXhwb3J0IHR5cGUgc3RhdE9wdGlvbnMgPSB7XG4gIGJpZ2ludDogYm9vbGVhbjtcbiAgdGhyb3dJZk5vRW50cnk/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgU3RhdHMgPSB7XG4gIC8qKiBJRCBvZiB0aGUgZGV2aWNlIGNvbnRhaW5pbmcgdGhlIGZpbGUuXG4gICAqXG4gICAqIF9MaW51eC9NYWMgT1Mgb25seS5fICovXG4gIGRldjogbnVtYmVyIHwgbnVsbDtcbiAgLyoqIElub2RlIG51bWJlci5cbiAgICpcbiAgICogX0xpbnV4L01hYyBPUyBvbmx5Ll8gKi9cbiAgaW5vOiBudW1iZXIgfCBudWxsO1xuICAvKiogKipVTlNUQUJMRSoqOiBNYXRjaCBiZWhhdmlvciB3aXRoIEdvIG9uIFdpbmRvd3MgZm9yIGBtb2RlYC5cbiAgICpcbiAgICogVGhlIHVuZGVybHlpbmcgcmF3IGBzdF9tb2RlYCBiaXRzIHRoYXQgY29udGFpbiB0aGUgc3RhbmRhcmQgVW5peFxuICAgKiBwZXJtaXNzaW9ucyBmb3IgdGhpcyBmaWxlL2RpcmVjdG9yeS4gKi9cbiAgbW9kZTogbnVtYmVyIHwgbnVsbDtcbiAgLyoqIE51bWJlciBvZiBoYXJkIGxpbmtzIHBvaW50aW5nIHRvIHRoaXMgZmlsZS5cbiAgICpcbiAgICogX0xpbnV4L01hYyBPUyBvbmx5Ll8gKi9cbiAgbmxpbms6IG51bWJlciB8IG51bGw7XG4gIC8qKiBVc2VyIElEIG9mIHRoZSBvd25lciBvZiB0aGlzIGZpbGUuXG4gICAqXG4gICAqIF9MaW51eC9NYWMgT1Mgb25seS5fICovXG4gIHVpZDogbnVtYmVyIHwgbnVsbDtcbiAgLyoqIEdyb3VwIElEIG9mIHRoZSBvd25lciBvZiB0aGlzIGZpbGUuXG4gICAqXG4gICAqIF9MaW51eC9NYWMgT1Mgb25seS5fICovXG4gIGdpZDogbnVtYmVyIHwgbnVsbDtcbiAgLyoqIERldmljZSBJRCBvZiB0aGlzIGZpbGUuXG4gICAqXG4gICAqIF9MaW51eC9NYWMgT1Mgb25seS5fICovXG4gIHJkZXY6IG51bWJlciB8IG51bGw7XG4gIC8qKiBUaGUgc2l6ZSBvZiB0aGUgZmlsZSwgaW4gYnl0ZXMuICovXG4gIHNpemU6IG51bWJlcjtcbiAgLyoqIEJsb2Nrc2l6ZSBmb3IgZmlsZXN5c3RlbSBJL08uXG4gICAqXG4gICAqIF9MaW51eC9NYWMgT1Mgb25seS5fICovXG4gIGJsa3NpemU6IG51bWJlciB8IG51bGw7XG4gIC8qKiBOdW1iZXIgb2YgYmxvY2tzIGFsbG9jYXRlZCB0byB0aGUgZmlsZSwgaW4gNTEyLWJ5dGUgdW5pdHMuXG4gICAqXG4gICAqIF9MaW51eC9NYWMgT1Mgb25seS5fICovXG4gIGJsb2NrczogbnVtYmVyIHwgbnVsbDtcbiAgLyoqIFRoZSBsYXN0IG1vZGlmaWNhdGlvbiB0aW1lIG9mIHRoZSBmaWxlLiBUaGlzIGNvcnJlc3BvbmRzIHRvIHRoZSBgbXRpbWVgXG4gICAqIGZpZWxkIGZyb20gYHN0YXRgIG9uIExpbnV4L01hYyBPUyBhbmQgYGZ0TGFzdFdyaXRlVGltZWAgb24gV2luZG93cy4gVGhpc1xuICAgKiBtYXkgbm90IGJlIGF2YWlsYWJsZSBvbiBhbGwgcGxhdGZvcm1zLiAqL1xuICBtdGltZTogRGF0ZSB8IG51bGw7XG4gIC8qKiBUaGUgbGFzdCBhY2Nlc3MgdGltZSBvZiB0aGUgZmlsZS4gVGhpcyBjb3JyZXNwb25kcyB0byB0aGUgYGF0aW1lYFxuICAgKiBmaWVsZCBmcm9tIGBzdGF0YCBvbiBVbml4IGFuZCBgZnRMYXN0QWNjZXNzVGltZWAgb24gV2luZG93cy4gVGhpcyBtYXkgbm90XG4gICAqIGJlIGF2YWlsYWJsZSBvbiBhbGwgcGxhdGZvcm1zLiAqL1xuICBhdGltZTogRGF0ZSB8IG51bGw7XG4gIC8qKiBUaGUgY3JlYXRpb24gdGltZSBvZiB0aGUgZmlsZS4gVGhpcyBjb3JyZXNwb25kcyB0byB0aGUgYGJpcnRodGltZWBcbiAgICogZmllbGQgZnJvbSBgc3RhdGAgb24gTWFjL0JTRCBhbmQgYGZ0Q3JlYXRpb25UaW1lYCBvbiBXaW5kb3dzLiBUaGlzIG1heVxuICAgKiBub3QgYmUgYXZhaWxhYmxlIG9uIGFsbCBwbGF0Zm9ybXMuICovXG4gIGJpcnRodGltZTogRGF0ZSB8IG51bGw7XG4gIC8qKiBjaGFuZ2UgdGltZSAqL1xuICBjdGltZTogRGF0ZSB8IG51bGw7XG4gIC8qKiBhdGltZSBpbiBtaWxsaXNlY29uZHMgKi9cbiAgYXRpbWVNczogbnVtYmVyIHwgbnVsbDtcbiAgLyoqIGF0aW1lIGluIG1pbGxpc2Vjb25kcyAqL1xuICBtdGltZU1zOiBudW1iZXIgfCBudWxsO1xuICAvKiogYXRpbWUgaW4gbWlsbGlzZWNvbmRzICovXG4gIGN0aW1lTXM6IG51bWJlciB8IG51bGw7XG4gIC8qKiBhdGltZSBpbiBtaWxsaXNlY29uZHMgKi9cbiAgYmlydGh0aW1lTXM6IG51bWJlciB8IG51bGw7XG4gIGlzQmxvY2tEZXZpY2U6ICgpID0+IGJvb2xlYW47XG4gIGlzQ2hhcmFjdGVyRGV2aWNlOiAoKSA9PiBib29sZWFuO1xuICBpc0RpcmVjdG9yeTogKCkgPT4gYm9vbGVhbjtcbiAgaXNGSUZPOiAoKSA9PiBib29sZWFuO1xuICBpc0ZpbGU6ICgpID0+IGJvb2xlYW47XG4gIGlzU29ja2V0OiAoKSA9PiBib29sZWFuO1xuICBpc1N5bWJvbGljTGluazogKCkgPT4gYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEJpZ0ludFN0YXRzID0ge1xuICAvKiogSUQgb2YgdGhlIGRldmljZSBjb250YWluaW5nIHRoZSBmaWxlLlxuICAgKlxuICAgKiBfTGludXgvTWFjIE9TIG9ubHkuXyAqL1xuICBkZXY6IEJpZ0ludCB8IG51bGw7XG4gIC8qKiBJbm9kZSBudW1iZXIuXG4gICAqXG4gICAqIF9MaW51eC9NYWMgT1Mgb25seS5fICovXG4gIGlubzogQmlnSW50IHwgbnVsbDtcbiAgLyoqICoqVU5TVEFCTEUqKjogTWF0Y2ggYmVoYXZpb3Igd2l0aCBHbyBvbiBXaW5kb3dzIGZvciBgbW9kZWAuXG4gICAqXG4gICAqIFRoZSB1bmRlcmx5aW5nIHJhdyBgc3RfbW9kZWAgYml0cyB0aGF0IGNvbnRhaW4gdGhlIHN0YW5kYXJkIFVuaXhcbiAgICogcGVybWlzc2lvbnMgZm9yIHRoaXMgZmlsZS9kaXJlY3RvcnkuICovXG4gIG1vZGU6IEJpZ0ludCB8IG51bGw7XG4gIC8qKiBOdW1iZXIgb2YgaGFyZCBsaW5rcyBwb2ludGluZyB0byB0aGlzIGZpbGUuXG4gICAqXG4gICAqIF9MaW51eC9NYWMgT1Mgb25seS5fICovXG4gIG5saW5rOiBCaWdJbnQgfCBudWxsO1xuICAvKiogVXNlciBJRCBvZiB0aGUgb3duZXIgb2YgdGhpcyBmaWxlLlxuICAgKlxuICAgKiBfTGludXgvTWFjIE9TIG9ubHkuXyAqL1xuICB1aWQ6IEJpZ0ludCB8IG51bGw7XG4gIC8qKiBHcm91cCBJRCBvZiB0aGUgb3duZXIgb2YgdGhpcyBmaWxlLlxuICAgKlxuICAgKiBfTGludXgvTWFjIE9TIG9ubHkuXyAqL1xuICBnaWQ6IEJpZ0ludCB8IG51bGw7XG4gIC8qKiBEZXZpY2UgSUQgb2YgdGhpcyBmaWxlLlxuICAgKlxuICAgKiBfTGludXgvTWFjIE9TIG9ubHkuXyAqL1xuICByZGV2OiBCaWdJbnQgfCBudWxsO1xuICAvKiogVGhlIHNpemUgb2YgdGhlIGZpbGUsIGluIGJ5dGVzLiAqL1xuICBzaXplOiBCaWdJbnQ7XG4gIC8qKiBCbG9ja3NpemUgZm9yIGZpbGVzeXN0ZW0gSS9PLlxuICAgKlxuICAgKiBfTGludXgvTWFjIE9TIG9ubHkuXyAqL1xuICBibGtzaXplOiBCaWdJbnQgfCBudWxsO1xuICAvKiogTnVtYmVyIG9mIGJsb2NrcyBhbGxvY2F0ZWQgdG8gdGhlIGZpbGUsIGluIDUxMi1ieXRlIHVuaXRzLlxuICAgKlxuICAgKiBfTGludXgvTWFjIE9TIG9ubHkuXyAqL1xuICBibG9ja3M6IEJpZ0ludCB8IG51bGw7XG4gIC8qKiBUaGUgbGFzdCBtb2RpZmljYXRpb24gdGltZSBvZiB0aGUgZmlsZS4gVGhpcyBjb3JyZXNwb25kcyB0byB0aGUgYG10aW1lYFxuICAgKiBmaWVsZCBmcm9tIGBzdGF0YCBvbiBMaW51eC9NYWMgT1MgYW5kIGBmdExhc3RXcml0ZVRpbWVgIG9uIFdpbmRvd3MuIFRoaXNcbiAgICogbWF5IG5vdCBiZSBhdmFpbGFibGUgb24gYWxsIHBsYXRmb3Jtcy4gKi9cbiAgbXRpbWU6IERhdGUgfCBudWxsO1xuICAvKiogVGhlIGxhc3QgYWNjZXNzIHRpbWUgb2YgdGhlIGZpbGUuIFRoaXMgY29ycmVzcG9uZHMgdG8gdGhlIGBhdGltZWBcbiAgICogZmllbGQgZnJvbSBgc3RhdGAgb24gVW5peCBhbmQgYGZ0TGFzdEFjY2Vzc1RpbWVgIG9uIFdpbmRvd3MuIFRoaXMgbWF5IG5vdFxuICAgKiBiZSBhdmFpbGFibGUgb24gYWxsIHBsYXRmb3Jtcy4gKi9cbiAgYXRpbWU6IERhdGUgfCBudWxsO1xuICAvKiogVGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIGZpbGUuIFRoaXMgY29ycmVzcG9uZHMgdG8gdGhlIGBiaXJ0aHRpbWVgXG4gICAqIGZpZWxkIGZyb20gYHN0YXRgIG9uIE1hYy9CU0QgYW5kIGBmdENyZWF0aW9uVGltZWAgb24gV2luZG93cy4gVGhpcyBtYXlcbiAgICogbm90IGJlIGF2YWlsYWJsZSBvbiBhbGwgcGxhdGZvcm1zLiAqL1xuICBiaXJ0aHRpbWU6IERhdGUgfCBudWxsO1xuICAvKiogY2hhbmdlIHRpbWUgKi9cbiAgY3RpbWU6IERhdGUgfCBudWxsO1xuICAvKiogYXRpbWUgaW4gbWlsbGlzZWNvbmRzICovXG4gIGF0aW1lTXM6IEJpZ0ludCB8IG51bGw7XG4gIC8qKiBhdGltZSBpbiBtaWxsaXNlY29uZHMgKi9cbiAgbXRpbWVNczogQmlnSW50IHwgbnVsbDtcbiAgLyoqIGF0aW1lIGluIG1pbGxpc2Vjb25kcyAqL1xuICBjdGltZU1zOiBCaWdJbnQgfCBudWxsO1xuICAvKiogYXRpbWUgaW4gbmFub3NlY29uZHMgKi9cbiAgYmlydGh0aW1lTXM6IEJpZ0ludCB8IG51bGw7XG4gIC8qKiBhdGltZSBpbiBuYW5vc2Vjb25kcyAqL1xuICBhdGltZU5zOiBCaWdJbnQgfCBudWxsO1xuICAvKiogYXRpbWUgaW4gbmFub3NlY29uZHMgKi9cbiAgbXRpbWVOczogQmlnSW50IHwgbnVsbDtcbiAgLyoqIGF0aW1lIGluIG5hbm9zZWNvbmRzICovXG4gIGN0aW1lTnM6IEJpZ0ludCB8IG51bGw7XG4gIC8qKiBhdGltZSBpbiBuYW5vc2Vjb25kcyAqL1xuICBiaXJ0aHRpbWVOczogQmlnSW50IHwgbnVsbDtcbiAgaXNCbG9ja0RldmljZTogKCkgPT4gYm9vbGVhbjtcbiAgaXNDaGFyYWN0ZXJEZXZpY2U6ICgpID0+IGJvb2xlYW47XG4gIGlzRGlyZWN0b3J5OiAoKSA9PiBib29sZWFuO1xuICBpc0ZJRk86ICgpID0+IGJvb2xlYW47XG4gIGlzRmlsZTogKCkgPT4gYm9vbGVhbjtcbiAgaXNTb2NrZXQ6ICgpID0+IGJvb2xlYW47XG4gIGlzU3ltYm9saWNMaW5rOiAoKSA9PiBib29sZWFuO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRGaWxlSW5mb1RvU3RhdHMob3JpZ2luOiBEZW5vLkZpbGVJbmZvKTogU3RhdHMge1xuICByZXR1cm4ge1xuICAgIGRldjogb3JpZ2luLmRldixcbiAgICBpbm86IG9yaWdpbi5pbm8sXG4gICAgbW9kZTogb3JpZ2luLm1vZGUsXG4gICAgbmxpbms6IG9yaWdpbi5ubGluayxcbiAgICB1aWQ6IG9yaWdpbi51aWQsXG4gICAgZ2lkOiBvcmlnaW4uZ2lkLFxuICAgIHJkZXY6IG9yaWdpbi5yZGV2LFxuICAgIHNpemU6IG9yaWdpbi5zaXplLFxuICAgIGJsa3NpemU6IG9yaWdpbi5ibGtzaXplLFxuICAgIGJsb2Nrczogb3JpZ2luLmJsb2NrcyxcbiAgICBtdGltZTogb3JpZ2luLm10aW1lLFxuICAgIGF0aW1lOiBvcmlnaW4uYXRpbWUsXG4gICAgYmlydGh0aW1lOiBvcmlnaW4uYmlydGh0aW1lLFxuICAgIG10aW1lTXM6IG9yaWdpbi5tdGltZT8uZ2V0VGltZSgpIHx8IG51bGwsXG4gICAgYXRpbWVNczogb3JpZ2luLmF0aW1lPy5nZXRUaW1lKCkgfHwgbnVsbCxcbiAgICBiaXJ0aHRpbWVNczogb3JpZ2luLmJpcnRodGltZT8uZ2V0VGltZSgpIHx8IG51bGwsXG4gICAgaXNGaWxlOiAoKSA9PiBvcmlnaW4uaXNGaWxlLFxuICAgIGlzRGlyZWN0b3J5OiAoKSA9PiBvcmlnaW4uaXNEaXJlY3RvcnksXG4gICAgaXNTeW1ib2xpY0xpbms6ICgpID0+IG9yaWdpbi5pc1N5bWxpbmssXG4gICAgLy8gbm90IHN1cmUgYWJvdXQgdGhvc2VcbiAgICBpc0Jsb2NrRGV2aWNlOiAoKSA9PiBmYWxzZSxcbiAgICBpc0ZJRk86ICgpID0+IGZhbHNlLFxuICAgIGlzQ2hhcmFjdGVyRGV2aWNlOiAoKSA9PiBmYWxzZSxcbiAgICBpc1NvY2tldDogKCkgPT4gZmFsc2UsXG4gICAgY3RpbWU6IG9yaWdpbi5tdGltZSxcbiAgICBjdGltZU1zOiBvcmlnaW4ubXRpbWU/LmdldFRpbWUoKSB8fCBudWxsLFxuICB9O1xufVxuXG5mdW5jdGlvbiB0b0JpZ0ludChudW1iZXI/OiBudW1iZXIgfCBudWxsKSB7XG4gIGlmIChudW1iZXIgPT09IG51bGwgfHwgbnVtYmVyID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xuICByZXR1cm4gQmlnSW50KG51bWJlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0RmlsZUluZm9Ub0JpZ0ludFN0YXRzKFxuICBvcmlnaW46IERlbm8uRmlsZUluZm8sXG4pOiBCaWdJbnRTdGF0cyB7XG4gIHJldHVybiB7XG4gICAgZGV2OiB0b0JpZ0ludChvcmlnaW4uZGV2KSxcbiAgICBpbm86IHRvQmlnSW50KG9yaWdpbi5pbm8pLFxuICAgIG1vZGU6IHRvQmlnSW50KG9yaWdpbi5tb2RlKSxcbiAgICBubGluazogdG9CaWdJbnQob3JpZ2luLm5saW5rKSxcbiAgICB1aWQ6IHRvQmlnSW50KG9yaWdpbi51aWQpLFxuICAgIGdpZDogdG9CaWdJbnQob3JpZ2luLmdpZCksXG4gICAgcmRldjogdG9CaWdJbnQob3JpZ2luLnJkZXYpLFxuICAgIHNpemU6IHRvQmlnSW50KG9yaWdpbi5zaXplKSB8fCAwbixcbiAgICBibGtzaXplOiB0b0JpZ0ludChvcmlnaW4uYmxrc2l6ZSksXG4gICAgYmxvY2tzOiB0b0JpZ0ludChvcmlnaW4uYmxvY2tzKSxcbiAgICBtdGltZTogb3JpZ2luLm10aW1lLFxuICAgIGF0aW1lOiBvcmlnaW4uYXRpbWUsXG4gICAgYmlydGh0aW1lOiBvcmlnaW4uYmlydGh0aW1lLFxuICAgIG10aW1lTXM6IG9yaWdpbi5tdGltZSA/IEJpZ0ludChvcmlnaW4ubXRpbWUuZ2V0VGltZSgpKSA6IG51bGwsXG4gICAgYXRpbWVNczogb3JpZ2luLmF0aW1lID8gQmlnSW50KG9yaWdpbi5hdGltZS5nZXRUaW1lKCkpIDogbnVsbCxcbiAgICBiaXJ0aHRpbWVNczogb3JpZ2luLmJpcnRodGltZSA/IEJpZ0ludChvcmlnaW4uYmlydGh0aW1lLmdldFRpbWUoKSkgOiBudWxsLFxuICAgIG10aW1lTnM6IG9yaWdpbi5tdGltZSA/IEJpZ0ludChvcmlnaW4ubXRpbWUuZ2V0VGltZSgpKSAqIDEwMDAwMDBuIDogbnVsbCxcbiAgICBhdGltZU5zOiBvcmlnaW4uYXRpbWUgPyBCaWdJbnQob3JpZ2luLmF0aW1lLmdldFRpbWUoKSkgKiAxMDAwMDAwbiA6IG51bGwsXG4gICAgYmlydGh0aW1lTnM6IG9yaWdpbi5iaXJ0aHRpbWVcbiAgICAgID8gQmlnSW50KG9yaWdpbi5iaXJ0aHRpbWUuZ2V0VGltZSgpKSAqIDEwMDAwMDBuXG4gICAgICA6IG51bGwsXG4gICAgaXNGaWxlOiAoKSA9PiBvcmlnaW4uaXNGaWxlLFxuICAgIGlzRGlyZWN0b3J5OiAoKSA9PiBvcmlnaW4uaXNEaXJlY3RvcnksXG4gICAgaXNTeW1ib2xpY0xpbms6ICgpID0+IG9yaWdpbi5pc1N5bWxpbmssXG4gICAgLy8gbm90IHN1cmUgYWJvdXQgdGhvc2VcbiAgICBpc0Jsb2NrRGV2aWNlOiAoKSA9PiBmYWxzZSxcbiAgICBpc0ZJRk86ICgpID0+IGZhbHNlLFxuICAgIGlzQ2hhcmFjdGVyRGV2aWNlOiAoKSA9PiBmYWxzZSxcbiAgICBpc1NvY2tldDogKCkgPT4gZmFsc2UsXG4gICAgY3RpbWU6IG9yaWdpbi5tdGltZSxcbiAgICBjdGltZU1zOiBvcmlnaW4ubXRpbWUgPyBCaWdJbnQob3JpZ2luLm10aW1lLmdldFRpbWUoKSkgOiBudWxsLFxuICAgIGN0aW1lTnM6IG9yaWdpbi5tdGltZSA/IEJpZ0ludChvcmlnaW4ubXRpbWUuZ2V0VGltZSgpKSAqIDEwMDAwMDBuIDogbnVsbCxcbiAgfTtcbn1cblxuLy8gc2hvcnRjdXQgZm9yIENvbnZlcnQgRmlsZSBJbmZvIHRvIFN0YXRzIG9yIEJpZ0ludFN0YXRzXG5leHBvcnQgZnVuY3Rpb24gQ0ZJU0JJUyhmaWxlSW5mbzogRGVuby5GaWxlSW5mbywgYmlnSW50OiBib29sZWFuKSB7XG4gIGlmIChiaWdJbnQpIHJldHVybiBjb252ZXJ0RmlsZUluZm9Ub0JpZ0ludFN0YXRzKGZpbGVJbmZvKTtcbiAgcmV0dXJuIGNvbnZlcnRGaWxlSW5mb1RvU3RhdHMoZmlsZUluZm8pO1xufVxuXG5leHBvcnQgdHlwZSBzdGF0Q2FsbGJhY2tCaWdJbnQgPSAoZXJyOiBFcnJvciB8IG51bGwsIHN0YXQ6IEJpZ0ludFN0YXRzKSA9PiB2b2lkO1xuXG5leHBvcnQgdHlwZSBzdGF0Q2FsbGJhY2sgPSAoZXJyOiBFcnJvciB8IG51bGwsIHN0YXQ6IFN0YXRzKSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhdChwYXRoOiBzdHJpbmcgfCBVUkwsIGNhbGxiYWNrOiBzdGF0Q2FsbGJhY2spOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXQoXG4gIHBhdGg6IHN0cmluZyB8IFVSTCxcbiAgb3B0aW9uczogeyBiaWdpbnQ6IGZhbHNlIH0sXG4gIGNhbGxiYWNrOiBzdGF0Q2FsbGJhY2ssXG4pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXQoXG4gIHBhdGg6IHN0cmluZyB8IFVSTCxcbiAgb3B0aW9uczogeyBiaWdpbnQ6IHRydWUgfSxcbiAgY2FsbGJhY2s6IHN0YXRDYWxsYmFja0JpZ0ludCxcbik6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gc3RhdChcbiAgcGF0aDogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zT3JDYWxsYmFjazogc3RhdENhbGxiYWNrIHwgc3RhdENhbGxiYWNrQmlnSW50IHwgc3RhdE9wdGlvbnMsXG4gIG1heWJlQ2FsbGJhY2s/OiBzdGF0Q2FsbGJhY2sgfCBzdGF0Q2FsbGJhY2tCaWdJbnQsXG4pIHtcbiAgY29uc3QgY2FsbGJhY2sgPVxuICAgICh0eXBlb2Ygb3B0aW9uc09yQ2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBvcHRpb25zT3JDYWxsYmFja1xuICAgICAgOiBtYXliZUNhbGxiYWNrKSBhcyAoXG4gICAgICAgIC4uLmFyZ3M6IFtFcnJvcl0gfCBbbnVsbCwgQmlnSW50U3RhdHMgfCBTdGF0c11cbiAgICAgICkgPT4gdm9pZDtcbiAgY29uc3Qgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb25zT3JDYWxsYmFjayA9PT0gXCJvYmplY3RcIlxuICAgID8gb3B0aW9uc09yQ2FsbGJhY2tcbiAgICA6IHsgYmlnaW50OiBmYWxzZSB9O1xuXG4gIGlmICghY2FsbGJhY2spIHRocm93IG5ldyBFcnJvcihcIk5vIGNhbGxiYWNrIGZ1bmN0aW9uIHN1cHBsaWVkXCIpO1xuXG4gIERlbm8uc3RhdChwYXRoKS50aGVuKFxuICAgIChzdGF0KSA9PiBjYWxsYmFjayhudWxsLCBDRklTQklTKHN0YXQsIG9wdGlvbnMuYmlnaW50KSksXG4gICAgKGVycikgPT4gY2FsbGJhY2soZGVub0Vycm9yVG9Ob2RlRXJyb3IoZXJyLCB7IHN5c2NhbGw6IFwic3RhdFwiIH0pKSxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXRTeW5jKHBhdGg6IHN0cmluZyB8IFVSTCk6IFN0YXRzO1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXRTeW5jKFxuICBwYXRoOiBzdHJpbmcgfCBVUkwsXG4gIG9wdGlvbnM6IHsgYmlnaW50OiBmYWxzZTsgdGhyb3dJZk5vRW50cnk/OiBib29sZWFuIH0sXG4pOiBTdGF0cztcbmV4cG9ydCBmdW5jdGlvbiBzdGF0U3luYyhcbiAgcGF0aDogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zOiB7IGJpZ2ludDogdHJ1ZTsgdGhyb3dJZk5vRW50cnk/OiBib29sZWFuIH0sXG4pOiBCaWdJbnRTdGF0cztcbmV4cG9ydCBmdW5jdGlvbiBzdGF0U3luYyhcbiAgcGF0aDogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zOiBzdGF0T3B0aW9ucyA9IHsgYmlnaW50OiBmYWxzZSwgdGhyb3dJZk5vRW50cnk6IHRydWUgfSxcbik6IFN0YXRzIHwgQmlnSW50U3RhdHMgfCB1bmRlZmluZWQge1xuICB0cnkge1xuICAgIGNvbnN0IG9yaWdpbiA9IERlbm8uc3RhdFN5bmMocGF0aCk7XG4gICAgcmV0dXJuIENGSVNCSVMob3JpZ2luLCBvcHRpb25zLmJpZ2ludCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChcbiAgICAgIG9wdGlvbnM/LnRocm93SWZOb0VudHJ5ID09PSBmYWxzZSAmJlxuICAgICAgZXJyIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmRcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBkZW5vRXJyb3JUb05vZGVFcnJvcihlcnIsIHsgc3lzY2FsbDogXCJzdGF0XCIgfSk7XG4gICAg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