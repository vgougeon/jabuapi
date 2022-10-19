"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fields = void 0;
const boolean_1 = require("./normal/boolean");
const createdAt_1 = require("./normal/createdAt");
const date_1 = require("./normal/date");
const email_1 = require("./normal/email");
const enum_1 = require("./normal/enum");
const float_1 = require("./normal/float");
const id_1 = require("./normal/id");
const integer_1 = require("./normal/integer");
const ip_1 = require("./normal/ip");
const json_1 = require("./normal/json");
const media_1 = require("./normal/media");
const password_1 = require("./normal/password");
const richText_1 = require("./normal/richText");
const string_1 = require("./normal/string");
const text_1 = require("./normal/text");
const updatedAt_1 = require("./normal/updatedAt");
const asymmetric_1 = require("./relations/asymmetric");
const manytomany_1 = require("./relations/manytomany");
const orderedlist_1 = require("./relations/orderedlist");
class Fields {
    constructor(api) {
        this.api = api;
        this.fields = [
            new id_1.FieldId(this.api),
            new boolean_1.FieldBoolean(this.api),
            new createdAt_1.FieldCreatedAt(this.api),
            new date_1.FieldDate(this.api),
            new email_1.FieldEmail(this.api),
            new float_1.FieldFloat(this.api),
            new integer_1.FieldInteger(this.api),
            new ip_1.FieldIP(this.api),
            new json_1.FieldJSON(this.api),
            new password_1.FieldPassword(this.api),
            new richText_1.FieldRichText(this.api),
            new string_1.FieldString(this.api),
            new text_1.FieldText(this.api),
            new enum_1.FieldEnum(this.api),
            new updatedAt_1.FieldUpdatedAt(this.api),
            new media_1.FieldMedia(this.api),
            new asymmetric_1.RelationAsymmetric(this.api),
            new manytomany_1.RelationManyToMany(this.api),
            new orderedlist_1.RelationOrderedList(this.api)
        ];
    }
    get(name) {
        const c = this.fields.find(f => f.name === name);
        console.log("Getting type " + name);
        if (!c)
            console.error('No field class found with name : ' + name);
        return c;
    }
}
exports.Fields = Fields;
