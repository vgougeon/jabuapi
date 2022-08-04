import { isInt, isNumber } from "class-validator";
import { Knex } from "knex";
import { IField } from "../../types/app.interface";
import { Field } from "../field.class";

export class FieldInteger extends Field {
    name = 'INTEGER'

    async createField(table: string, field: { name: string; options: IField; }) {
        super.createField(table, field)
        await this.api.db.userDb?.schema.alterTable(table, (builder) => {
            let t = builder.integer(field.name)
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
        if (context.body[field.name]) {
            if (!isNumber(Number(context.body[field.name]))) error.set(field.name, 'should be a number')
            if (!isInt(Number(context.body[field.name]))) error.set(field.name, 'should be an integer')
            mapped[field.name] = context.body[field.name]
        }
    }
}