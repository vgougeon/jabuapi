import { IField } from "../../types/app.interface";
import { Field } from "../field.class";

export class FieldIP extends Field {
    name = 'IP'
    
    async createField(table: string, field: { name: string; options: IField; }) {
        super.createField(table, field)
        await this.api.db.userDb?.schema.alterTable(table, (builder) => {
            let t = builder.string(field.name)
            if (field.options.nullable) t.nullable(); else t.notNullable()
            if (field.options.unique) t.unique();
            if (field.options.default !== undefined) t.defaultTo(field.options.default);
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
        if(context.body[field.name] !== undefined) {
            mapped[field.name] = context.body[field.name]
        }
        else if(context.context === 'insert') mapped[field.name] = context.options.req.ip || 'localhost'
    }
}