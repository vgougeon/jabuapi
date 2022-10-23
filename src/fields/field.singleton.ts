import API from "..";
import { Field } from "./field.class";
import { FieldBoolean } from "./normal/boolean";
import { FieldCreatedAt } from "./normal/createdAt";
import { FieldDate } from "./normal/date";
import { FieldEmail } from "./normal/email";
import { FieldEnum } from "./normal/enum";
import { FieldFloat } from "./normal/float";
import { FieldId } from "./normal/id";
import { FieldInteger } from "./normal/integer";
import { FieldIP } from "./normal/ip";
import { FieldJSON } from "./normal/json";
import { FieldMedia } from "./normal/media";
import { FieldPassword } from "./normal/password";
import { FieldRichText } from "./normal/richText";
import { FieldString } from "./normal/string";
import { FieldText } from "./normal/text";
import { FieldUpdatedAt } from "./normal/updatedAt";
import { RelationAsymmetric } from "./relations/asymmetric";
import { RelationManyToMany } from "./relations/manytomany";
import { RelationOneToOne } from "./relations/onetoone";
import { RelationOrderedList } from "./relations/orderedlist";

export class Fields {

    constructor(private api: API) {}

    fields: Field[] = [
        new FieldId(this.api), 
        new FieldBoolean(this.api), 
        new FieldCreatedAt(this.api), 
        new FieldDate(this.api),
        new FieldEmail(this.api),
        new FieldFloat(this.api),
        new FieldInteger(this.api),
        new FieldIP(this.api),
        new FieldJSON(this.api),
        new FieldPassword(this.api),
        new FieldRichText(this.api),
        new FieldString(this.api),
        new FieldText(this.api),
        new FieldEnum(this.api),
        new FieldUpdatedAt(this.api),
        new FieldMedia(this.api),
        new RelationAsymmetric(this.api),
        new RelationManyToMany(this.api),
        new RelationOrderedList(this.api),
        new RelationOneToOne(this.api)
    ]

    get(name: string) {
        const c = this.fields.find(f => f.name === name)
        if(!c) console.error('No field class found with name : ' + name)
        return c
    }
}