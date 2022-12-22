import { UploadedFile } from "express-fileupload";
import { IField } from "../../types/app.interface";
import { checkFolderExists } from "../../utils/file";
import { Field } from "../field.class";

export class FieldMedia extends Field {
    name = 'MEDIA'

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
            console.log(context.body[field.name])
            mapped[field.name] = await this.saveMedia(context.body[field.name])
        }
    }

    async saveMedia(media: UploadedFile) {
        const path = `${this.api.options.root}/medias/${media.name}`
        await checkFolderExists(`${this.api.options.root}/medias/`, true)
        return new Promise((resolve, reject) => {
            media.mv(path, (err) => {
                if (err) return reject(err)
                else resolve(`/api/medias/${media.name}`)
            })
        })
    }
}