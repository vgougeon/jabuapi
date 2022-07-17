"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldCreatedAt = void 0;
const field_class_1 = require("../field.class");
class FieldCreatedAt extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'CREATED_AT';
    }
    createField(table, field) {
        let t = table.datetime(field.name);
        if (field.options.nullable)
            t.nullable();
        else
            t.notNullable();
        if (field.options.unique)
            t.unique();
    }
}
exports.FieldCreatedAt = FieldCreatedAt;
