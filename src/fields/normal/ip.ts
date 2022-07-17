import { Knex } from "knex";
import { IField } from "../../types/app.interface";
import { Field } from "../field.class";

export class FieldIP extends Field {
    name = 'IP'
    
    createField(table: Knex.CreateTableBuilder, field: { name: string; options: IField; }): void {
        let t = table.string(field.name)
        if (field.options.nullable) t.nullable(); else t.notNullable()
        if (field.options.unique) t.unique();
    }
}