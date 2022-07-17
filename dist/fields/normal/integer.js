"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldInteger = void 0;
const field_class_1 = require("../field.class");
class FieldInteger extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'INTEGER';
    }
    createField(table, field) {
        let t = table.integer(field.name);
        if (field.options.nullable)
            t.nullable();
        else
            t.notNullable();
        if (field.options.unique)
            t.unique();
    }
}
exports.FieldInteger = FieldInteger;
