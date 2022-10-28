import { maxLength } from "class-validator";
import { IField } from "../../types/app.interface";
import { Field } from "../field.class";

export class FieldEnum extends Field {
    name = 'ENUM'
    
    async createField(table: string, field: { name: string; options: IField; }) {
        super.createField(table, field)
        await this.api.db.userDb?.schema.alterTable(table, (builder) => {
            let t = builder.string(field.name)
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
            if(!field.options.enumName) error.set(field.name, 'Enum not found in config')
            else {
                const E = this.api.configService.app.enums[field.options.enumName]
                if(!E.entries.includes(context.body[field.name])) error.set(field.name, `Wrong value given for enum ${field.options.enumName}`)
            }
            if (!maxLength(context.body[field.name], 255)) error.set(field.name, 'should be less than 255 characters')
            mapped[field.name] = context.body[field.name]
        }
    }
}