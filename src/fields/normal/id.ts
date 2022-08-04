import { Knex } from "knex";
import { IField } from "../../types/app.interface";
import { Field } from "../field.class";

export class FieldId extends Field {
    name = 'ID'
    
    async createField(table: string, field: { name: string; options: IField; }) {
        super.createField(table, field)
        await this.api.db.userDb?.schema.alterTable(table, (builder) => {
            let t = builder.increments(field.name)
            if (field.options.nullable) t.nullable(); else t.notNullable()
            if (field.options.unique) t.unique();
        })
    }

    async deleteField(table: string, name: string) {
        super.deleteField(table, name)
        await this.api.db.userDb?.schema.alterTable(table, (table) => {
            table.dropColumn(name)
        })
    }

    async mapField(field: { name: string; options: IField }, mapped: any, error: any, context: any) {
        super.mapField(field, mapped, error, context)
        if(context.body[field.name]) {
            mapped[field.name] = context.body[field.name]
        }
    }
}