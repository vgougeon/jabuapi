"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldString = void 0;
const field_class_1 = require("../field.class");
class FieldString extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'STRING';
    }
    createField(table, field) {
        let t = table.string(field.name);
        if (field.options.nullable)
            t.nullable();
        else
            t.notNullable();
        if (field.options.unique)
            t.unique();
    }
}
exports.FieldString = FieldString;
