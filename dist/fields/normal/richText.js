"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldRichText = void 0;
const field_class_1 = require("../field.class");
class FieldRichText extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'RICHTEXT';
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
exports.FieldRichText = FieldRichText;
