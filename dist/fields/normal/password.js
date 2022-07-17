"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldPassword = void 0;
const field_class_1 = require("../field.class");
class FieldPassword extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'PASSWORD';
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
exports.FieldPassword = FieldPassword;
