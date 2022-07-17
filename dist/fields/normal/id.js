"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldId = void 0;
const field_class_1 = require("../field.class");
class FieldId extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'ID';
    }
    createField(table, field) {
        let t = table.increments();
        if (field.options.nullable)
            t.nullable();
        else
            t.notNullable();
        if (field.options.unique)
            t.unique();
    }
}
exports.FieldId = FieldId;
