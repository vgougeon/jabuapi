"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldJSON = void 0;
const field_class_1 = require("../field.class");
class FieldJSON extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'JSON';
    }
    createField(table, field) {
        let t = table.json(field.name);
        if (field.options.nullable)
            t.nullable();
        else
            t.notNullable();
        if (field.options.unique)
            t.unique();
    }
}
exports.FieldJSON = FieldJSON;
