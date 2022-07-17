import { Knex } from "knex";
import { IField } from "../../types/app.interface";
import { Field } from "../field.class";

export class FieldBoolean extends Field {
    name = 'BOOLEAN'
    
    createField(table: Knex.CreateTableBuilder, field: { name: string; options: IField; }): void {
        let t = table.boolean(field.name)
        if (field.options.nullable) t.nullable(); else t.notNullable()
        if (field.options.unique) t.unique();
    }
}