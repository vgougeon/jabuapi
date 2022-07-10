"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CollectionMapper {
    constructor() { }
    getFieldsFromCollection(collection) {
        return Object.entries(collection.fields).map(([name, options]) => ({ name, options }));
    }
}
exports.default = new CollectionMapper();
