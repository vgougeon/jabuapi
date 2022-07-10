"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorMapper {
    constructor() {
        this.errors = {};
    }
    set(key, message) {
        this.errors[key] = [...this.errors[key] || [], message];
    }
    errorsFound() {
        if (Object.values(this.errors).length > 0)
            return true;
        return false;
    }
    getMap() { return this.errors; }
}
exports.default = ErrorMapper;
