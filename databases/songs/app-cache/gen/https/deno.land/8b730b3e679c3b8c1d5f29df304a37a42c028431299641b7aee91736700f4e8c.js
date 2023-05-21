// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { notImplemented } from "../_utils.ts";
export default class Dirent {
    constructor(entry){
        this.entry = entry;
    }
    isBlockDevice() {
        notImplemented("Deno does not yet support identification of block devices");
        return false;
    }
    isCharacterDevice() {
        notImplemented("Deno does not yet support identification of character devices");
        return false;
    }
    isDirectory() {
        return this.entry.isDirectory;
    }
    isFIFO() {
        notImplemented("Deno does not yet support identification of FIFO named pipes");
        return false;
    }
    isFile() {
        return this.entry.isFile;
    }
    isSocket() {
        notImplemented("Deno does not yet support identification of sockets");
        return false;
    }
    isSymbolicLink() {
        return this.entry.isSymlink;
    }
    get name() {
        return this.entry.name;
    }
    entry;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvX2ZzL19mc19kaXJlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IG5vdEltcGxlbWVudGVkIH0gZnJvbSBcIi4uL191dGlscy50c1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXJlbnQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVudHJ5OiBEZW5vLkRpckVudHJ5KSB7fVxuXG4gIGlzQmxvY2tEZXZpY2UoKTogYm9vbGVhbiB7XG4gICAgbm90SW1wbGVtZW50ZWQoXCJEZW5vIGRvZXMgbm90IHlldCBzdXBwb3J0IGlkZW50aWZpY2F0aW9uIG9mIGJsb2NrIGRldmljZXNcIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaXNDaGFyYWN0ZXJEZXZpY2UoKTogYm9vbGVhbiB7XG4gICAgbm90SW1wbGVtZW50ZWQoXG4gICAgICBcIkRlbm8gZG9lcyBub3QgeWV0IHN1cHBvcnQgaWRlbnRpZmljYXRpb24gb2YgY2hhcmFjdGVyIGRldmljZXNcIixcbiAgICApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzRGlyZWN0b3J5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmVudHJ5LmlzRGlyZWN0b3J5O1xuICB9XG5cbiAgaXNGSUZPKCk6IGJvb2xlYW4ge1xuICAgIG5vdEltcGxlbWVudGVkKFxuICAgICAgXCJEZW5vIGRvZXMgbm90IHlldCBzdXBwb3J0IGlkZW50aWZpY2F0aW9uIG9mIEZJRk8gbmFtZWQgcGlwZXNcIixcbiAgICApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzRmlsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyeS5pc0ZpbGU7XG4gIH1cblxuICBpc1NvY2tldCgpOiBib29sZWFuIHtcbiAgICBub3RJbXBsZW1lbnRlZChcIkRlbm8gZG9lcyBub3QgeWV0IHN1cHBvcnQgaWRlbnRpZmljYXRpb24gb2Ygc29ja2V0c1wiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc1N5bWJvbGljTGluaygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyeS5pc1N5bWxpbms7XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyeS5uYW1lO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsY0FBYyxRQUFRLGNBQWMsQ0FBQztBQUU5QyxlQUFlLE1BQU0sTUFBTTtJQUN6QixZQUFvQixLQUFvQixDQUFFO1FBQXRCLGFBQUEsS0FBb0IsQ0FBQTtJQUFHO0lBRTNDLGFBQWEsR0FBWTtRQUN2QixjQUFjLENBQUMsMkRBQTJELENBQUMsQ0FBQztRQUM1RSxPQUFPLEtBQUssQ0FBQztJQUNmO0lBRUEsaUJBQWlCLEdBQVk7UUFDM0IsY0FBYyxDQUNaLCtEQUErRCxDQUNoRSxDQUFDO1FBQ0YsT0FBTyxLQUFLLENBQUM7SUFDZjtJQUVBLFdBQVcsR0FBWTtRQUNyQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2hDO0lBRUEsTUFBTSxHQUFZO1FBQ2hCLGNBQWMsQ0FDWiw4REFBOEQsQ0FDL0QsQ0FBQztRQUNGLE9BQU8sS0FBSyxDQUFDO0lBQ2Y7SUFFQSxNQUFNLEdBQVk7UUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUMzQjtJQUVBLFFBQVEsR0FBWTtRQUNsQixjQUFjLENBQUMscURBQXFELENBQUMsQ0FBQztRQUN0RSxPQUFPLEtBQUssQ0FBQztJQUNmO0lBRUEsY0FBYyxHQUFZO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7SUFDOUI7UUFFSSxJQUFJLEdBQWtCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFDekI7SUF4Q29CLEtBQW9CO0NBeUN6QyxDQUFBIn0=