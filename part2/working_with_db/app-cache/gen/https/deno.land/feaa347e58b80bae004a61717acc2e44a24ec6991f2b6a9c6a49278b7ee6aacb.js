// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import Dirent from "./_fs_dirent.ts";
import { assert } from "../../_util/assert.ts";
export default class Dir {
    dirPath;
    syncIterator;
    asyncIterator;
    constructor(path){
        this.dirPath = path;
    }
    get path() {
        if (this.dirPath instanceof Uint8Array) {
            return new TextDecoder().decode(this.dirPath);
        }
        return this.dirPath;
    }
    // deno-lint-ignore no-explicit-any
    read(callback) {
        return new Promise((resolve, reject)=>{
            if (!this.asyncIterator) {
                this.asyncIterator = Deno.readDir(this.path)[Symbol.asyncIterator]();
            }
            assert(this.asyncIterator);
            this.asyncIterator.next().then(({ value  })=>{
                resolve(value ? value : null);
                if (callback) {
                    callback(null, value ? value : null);
                }
            }, (err)=>{
                if (callback) {
                    callback(err);
                }
                reject(err);
            });
        });
    }
    readSync() {
        if (!this.syncIterator) {
            this.syncIterator = Deno.readDirSync(this.path)[Symbol.iterator]();
        }
        const file = this.syncIterator.next().value;
        return file ? new Dirent(file) : null;
    }
    /**
   * Unlike Node, Deno does not require managing resource ids for reading
   * directories, and therefore does not need to close directories when
   * finished reading.
   */ // deno-lint-ignore no-explicit-any
    close(callback) {
        return new Promise((resolve)=>{
            if (callback) {
                callback(null);
            }
            resolve();
        });
    }
    /**
   * Unlike Node, Deno does not require managing resource ids for reading
   * directories, and therefore does not need to close directories when
   * finished reading
   */ closeSync() {
    //No op
    }
    async *[Symbol.asyncIterator]() {
        try {
            while(true){
                const dirent = await this.read();
                if (dirent === null) {
                    break;
                }
                yield dirent;
            }
        } finally{
            await this.close();
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvX2ZzL19mc19kaXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCBEaXJlbnQgZnJvbSBcIi4vX2ZzX2RpcmVudC50c1wiO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIi4uLy4uL191dGlsL2Fzc2VydC50c1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXIge1xuICBwcml2YXRlIGRpclBhdGg6IHN0cmluZyB8IFVpbnQ4QXJyYXk7XG4gIHByaXZhdGUgc3luY0l0ZXJhdG9yITogSXRlcmF0b3I8RGVuby5EaXJFbnRyeT4gfCBudWxsO1xuICBwcml2YXRlIGFzeW5jSXRlcmF0b3IhOiBBc3luY0l0ZXJhdG9yPERlbm8uRGlyRW50cnk+IHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihwYXRoOiBzdHJpbmcgfCBVaW50OEFycmF5KSB7XG4gICAgdGhpcy5kaXJQYXRoID0gcGF0aDtcbiAgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuZGlyUGF0aCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUodGhpcy5kaXJQYXRoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZGlyUGF0aDtcbiAgfVxuXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIHJlYWQoY2FsbGJhY2s/OiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiBQcm9taXNlPERpcmVudCB8IG51bGw+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmFzeW5jSXRlcmF0b3IpIHtcbiAgICAgICAgdGhpcy5hc3luY0l0ZXJhdG9yID0gRGVuby5yZWFkRGlyKHRoaXMucGF0aClbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICB9XG4gICAgICBhc3NlcnQodGhpcy5hc3luY0l0ZXJhdG9yKTtcbiAgICAgIHRoaXMuYXN5bmNJdGVyYXRvclxuICAgICAgICAubmV4dCgpXG4gICAgICAgIC50aGVuKCh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlID8gdmFsdWUgOiBudWxsKTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlID8gdmFsdWUgOiBudWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlYWRTeW5jKCk6IERpcmVudCB8IG51bGwge1xuICAgIGlmICghdGhpcy5zeW5jSXRlcmF0b3IpIHtcbiAgICAgIHRoaXMuc3luY0l0ZXJhdG9yID0gRGVuby5yZWFkRGlyU3luYyh0aGlzLnBhdGgpIVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZTogRGVuby5EaXJFbnRyeSA9IHRoaXMuc3luY0l0ZXJhdG9yLm5leHQoKS52YWx1ZTtcblxuICAgIHJldHVybiBmaWxlID8gbmV3IERpcmVudChmaWxlKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVW5saWtlIE5vZGUsIERlbm8gZG9lcyBub3QgcmVxdWlyZSBtYW5hZ2luZyByZXNvdXJjZSBpZHMgZm9yIHJlYWRpbmdcbiAgICogZGlyZWN0b3JpZXMsIGFuZCB0aGVyZWZvcmUgZG9lcyBub3QgbmVlZCB0byBjbG9zZSBkaXJlY3RvcmllcyB3aGVuXG4gICAqIGZpbmlzaGVkIHJlYWRpbmcuXG4gICAqL1xuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBjbG9zZShjYWxsYmFjaz86ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVubGlrZSBOb2RlLCBEZW5vIGRvZXMgbm90IHJlcXVpcmUgbWFuYWdpbmcgcmVzb3VyY2UgaWRzIGZvciByZWFkaW5nXG4gICAqIGRpcmVjdG9yaWVzLCBhbmQgdGhlcmVmb3JlIGRvZXMgbm90IG5lZWQgdG8gY2xvc2UgZGlyZWN0b3JpZXMgd2hlblxuICAgKiBmaW5pc2hlZCByZWFkaW5nXG4gICAqL1xuICBjbG9zZVN5bmMoKTogdm9pZCB7XG4gICAgLy9ObyBvcFxuICB9XG5cbiAgYXN5bmMgKltTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPERpcmVudD4ge1xuICAgIHRyeSB7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjb25zdCBkaXJlbnQ6IERpcmVudCB8IG51bGwgPSBhd2FpdCB0aGlzLnJlYWQoKTtcbiAgICAgICAgaWYgKGRpcmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkIGRpcmVudDtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQztBQUNyQyxTQUFTLE1BQU0sUUFBUSx1QkFBdUIsQ0FBQztBQUUvQyxl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