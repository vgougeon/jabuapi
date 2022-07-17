import { Knex } from "knex";
import { IField } from "../../types/app.interface";
import { Field } from "../field.class";

export class FieldDate extends Field {
    name = 'DATE'
    
    createField(table: Knex.CreateTableBuilder, field: { name: string; options: IField; }): void {
        let t = table.datetime(field.name)
        if (field.options.nullable) t.nullable(); else t.notNullable()
        if (field.options.unique) t.unique();
    }
}