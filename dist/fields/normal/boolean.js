"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldBoolean = void 0;
const field_class_1 = require("../field.class");
class FieldBoolean extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'BOOLEAN';
    }
    createField(table, field) {
        let t = table.boolean(field.name);
        if (field.options.nullable)
            t.nullable();
        else
            t.notNullable();
        if (field.options.unique)
            t.unique();
    }
}
exports.FieldBoolean = FieldBoolean;