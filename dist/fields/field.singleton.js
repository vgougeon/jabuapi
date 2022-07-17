"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldSingleton = void 0;
const boolean_1 = require("./normal/boolean");
const createdAt_1 = require("./normal/createdAt");
const date_1 = require("./normal/date");
const email_1 = require("./normal/email");
const float_1 = require("./normal/float");
const id_1 = require("./normal/id");
const integer_1 = require("./normal/integer");
const ip_1 = require("./normal/ip");
const json_1 = require("./normal/json");
const password_1 = require("./normal/password");
const richText_1 = require("./normal/richText");
const string_1 = require("./normal/string");
const text_1 = require("./normal/text");
const updatedAt_1 = require("./normal/updatedAt");
class FieldSingleton {
    static get(name) {
        const c = FieldSingleton.fields.find(f => f.name === name);
        console.log("Getting type " + name);
        if (!c)
            console.error('No field class found with name : ' + name);
        return c;
    }
}
exports.FieldSingleton = FieldSingleton;
FieldSingleton.fields = [
    new id_1.FieldId(),
    new boolean_1.FieldBoolean(),
    new createdAt_1.FieldCreatedAt(),
    new date_1.FieldDate(),
    new email_1.FieldEmail(),
    new float_1.FieldFloat(),
    new integer_1.FieldInteger(),
    new ip_1.FieldIP(),
    new json_1.FieldJSON(),
    new password_1.FieldPassword(),
    new richText_1.FieldRichText(),
    new string_1.FieldString(),
    new text_1.FieldText(),
    new updatedAt_1.FieldUpdatedAt(),
];
