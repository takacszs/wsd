import { copyProps } from "./utils.ts";
/**
 * Handles storage and accessing of values
 *
 * In this case, we use it to store compiled template functions
 * Indexed by their `name` or `filename`
 */ class Cacher {
    constructor(cache){
        this.cache = cache;
    }
    define(key, val) {
        this.cache[key] = val;
    }
    get(key) {
        // string | array.
        // TODO: allow array of keys to look down
        // TODO: create plugin to allow referencing helpers, filters with dot notation
        return this.cache[key];
    }
    remove(key) {
        delete this.cache[key];
    }
    reset() {
        this.cache = {};
    }
    load(cacheObj) {
        copyProps(this.cache, cacheObj);
    }
    cache;
}
export { Cacher };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZXRhQHYxLjEyLjMvc3RvcmFnZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb3B5UHJvcHMgfSBmcm9tIFwiLi91dGlscy50c1wiO1xuXG4vKipcbiAqIEhhbmRsZXMgc3RvcmFnZSBhbmQgYWNjZXNzaW5nIG9mIHZhbHVlc1xuICpcbiAqIEluIHRoaXMgY2FzZSwgd2UgdXNlIGl0IHRvIHN0b3JlIGNvbXBpbGVkIHRlbXBsYXRlIGZ1bmN0aW9uc1xuICogSW5kZXhlZCBieSB0aGVpciBgbmFtZWAgb3IgYGZpbGVuYW1lYFxuICovXG5jbGFzcyBDYWNoZXI8VD4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhY2hlOiBSZWNvcmQ8c3RyaW5nLCBUPikge31cbiAgZGVmaW5lKGtleTogc3RyaW5nLCB2YWw6IFQpOiB2b2lkIHtcbiAgICB0aGlzLmNhY2hlW2tleV0gPSB2YWw7XG4gIH1cbiAgZ2V0KGtleTogc3RyaW5nKTogVCB7XG4gICAgLy8gc3RyaW5nIHwgYXJyYXkuXG4gICAgLy8gVE9ETzogYWxsb3cgYXJyYXkgb2Yga2V5cyB0byBsb29rIGRvd25cbiAgICAvLyBUT0RPOiBjcmVhdGUgcGx1Z2luIHRvIGFsbG93IHJlZmVyZW5jaW5nIGhlbHBlcnMsIGZpbHRlcnMgd2l0aCBkb3Qgbm90YXRpb25cbiAgICByZXR1cm4gdGhpcy5jYWNoZVtrZXldO1xuICB9XG4gIHJlbW92ZShrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGRlbGV0ZSB0aGlzLmNhY2hlW2tleV07XG4gIH1cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5jYWNoZSA9IHt9O1xuICB9XG4gIGxvYWQoY2FjaGVPYmo6IFJlY29yZDxzdHJpbmcsIFQ+KTogdm9pZCB7XG4gICAgY29weVByb3BzKHRoaXMuY2FjaGUsIGNhY2hlT2JqKTtcbiAgfVxufVxuXG5leHBvcnQgeyBDYWNoZXIgfTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFNBQVMsUUFBUSxZQUFZLENBQUM7QUFFdkM7Ozs7O0NBS0MsR0FDRCxNQUFNLE1BQU07SUFDVixZQUFvQixLQUF3QixDQUFFO1FBQTFCLGFBQUEsS0FBd0IsQ0FBQTtJQUFHO0lBQy9DLE1BQU0sQ0FBQyxHQUFXLEVBQUUsR0FBTSxFQUFRO1FBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ3hCO0lBQ0EsR0FBRyxDQUFDLEdBQVcsRUFBSztRQUNsQixrQkFBa0I7UUFDbEIseUNBQXlDO1FBQ3pDLDhFQUE4RTtRQUM5RSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekI7SUFDQSxNQUFNLENBQUMsR0FBVyxFQUFRO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QjtJQUNBLEtBQUssR0FBUztRQUNaLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2xCO0lBQ0EsSUFBSSxDQUFDLFFBQTJCLEVBQVE7UUFDdEMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEM7SUFsQm9CLEtBQXdCO0NBbUI3QztBQUVELFNBQVMsTUFBTSxHQUFHIn0=