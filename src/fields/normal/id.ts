import { Knex } from "knex";
import { IField } from "../../types/app.interface";
import { Field } from "../field.class";

export class FieldId extends Field {
    name = 'ID'
    
    createField(table: Knex.CreateTableBuilder, field: { name: string; options: IField; }): void {
        let t = table.increments()
        if (field.options.nullable) t.nullable(); else t.notNullable()
        if (field.options.unique) t.unique();
    }
}