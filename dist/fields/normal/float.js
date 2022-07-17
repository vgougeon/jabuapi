"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldFloat = void 0;
const field_class_1 = require("../field.class");
class FieldFloat extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'FLOAT';
    }
    createField(table, field) {
        let t = table.float(field.name);
        if (field.options.nullable)
            t.nullable();
        else
            t.notNullable();
        if (field.options.unique)
            t.unique();
    }
}
exports.FieldFloat = FieldFloat;
