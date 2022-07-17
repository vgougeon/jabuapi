import { Knex } from "knex";
import { IField } from "../types/app.interface";
import { Field } from "./field.class";
import { FieldBoolean } from "./normal/boolean";
import { FieldCreatedAt } from "./normal/createdAt";
import { FieldDate } from "./normal/date";
import { FieldEmail } from "./normal/email";
import { FieldFloat } from "./normal/float";
import { FieldId } from "./normal/id";
import { FieldInteger } from "./normal/integer";
import { FieldIP } from "./normal/ip";
import { FieldJSON } from "./normal/json";
import { FieldPassword } from "./normal/password";
import { FieldRichText } from "./normal/richText";
import { FieldString } from "./normal/string";
import { FieldText } from "./normal/text";
import { FieldUpdatedAt } from "./normal/updatedAt";

export abstract class FieldSingleton {
    static fields: Field[] = [
        new FieldId(), 
        new FieldBoolean(), 
        new FieldCreatedAt(), 
        new FieldDate(),
        new FieldEmail(),
        new FieldFloat(),
        new FieldInteger(),
        new FieldIP(),
        new FieldJSON(),
        new FieldPassword(),
        new FieldRichText(),
        new FieldString(),
        new FieldText(),
        new FieldUpdatedAt(),
    ]

    static get(name: string) {
        const c = FieldSingleton.fields.find(f => f.name === name)
        console.log("Getting type " + name)
        if(!c) console.error('No field class found with name : ' + name)
        return c
    }
}