"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNameOptions = void 0;
function toNameOptions(value) {
    return {
        name: Object.keys(value)[0],
        options: value[Object.keys(value)[0]]
    };
}
exports.toNameOptions = toNameOptions;
