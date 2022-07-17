"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldText = void 0;
const field_class_1 = require("../field.class");
class FieldText extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'TEXT';
    }
    createField(table, field) {
        let t = table.text(field.name);
        if (field.options.nullable)
            t.nullable();
        else
            t.notNullable();
        if (field.options.unique)
            t.unique();
    }
}
exports.FieldText = FieldText;
