import { Request, Response } from 'express';
import collectionMapper from '../collection.mapper';
import bcrypt from 'bcrypt';
import { isEmail, isInt, isNumber, isNumberString, maxLength } from 'class-validator';
import ErrorMapper from '../../utils/error-mapper';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { nanoid } from 'nanoid';
import API from '../../index';
export class CrudService {
    constructor(private api: API) {}

    selectFields(collectionName: string, name = '') {
        const collection = this.api.configService.getCollectionByName(collectionName)
        console.log(Object.keys(collection.fields).map(key => `${collectionName}.${key}`).join(', '))
        return Object.keys(collection.fields).map(key => `${collectionName}.${key}${name ? ` as ${name}.${key}` : ''}`)
    }

    toJson(result: { [key: string]: any } | { [key: string]: any }[]) {
        const convertRow = (row: { [key: string]: any }) => {
            const result: any = {};
            for (const objectPath in row) {
                const parts = objectPath.split('.');
                let target = result;
                while (parts.length > 1) {
                    const part = parts.shift();
                    if (part) target = target[part] = target[part] || {};
                }
                target[parts[0]] = row[objectPath]
            }

            return result;
        }
        if (Array.isArray(result)) {
            return result.map(row => convertRow(row))
        }
        else return convertRow(result)
    }

    findAll(collectionName: string) {
        return async (req: Request, res: Response) => {
            const relations = this.api.configService.getAllRelations(collectionName)
            let request = this.api.db.userDb?.(collectionName)
                .select(this.selectFields(collectionName))

            for (let relation of relations) {
                //MANY TO ONE
                if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === collectionName)
                    request = request?.leftJoin(
                        relation.options.rightTable,
                        `${relation.options.rightTable}.${relation.options.rightReference}`,
                        `${collectionName}.${relation.options.fieldName}`
                    ).select(this.selectFields(relation.options.rightTable, relation.options.fieldName))

                //ONE TO MANY
                // if(relation.options.rightTable === collectionName) {
                //     console.log(relation)
                //     request = request?.leftJoin(
                //         relation.options.leftTable,
                //         `${relation.options.rightTable}.${relation.options.rightReference}`,
                //         `${relation.options.leftTable}.${relation.options.fieldName}`
                //     ).select(this.selectFields(relation.options.leftTable, relation.options.fieldName))
                // }
            }

            res.send(this.toJson(await request as any))
            // res.send(await request)
        }
    }

    findOne(collectionName: string) {
        return async (req: Request, res: Response) => {
            const relations = this.api.configService.getAllRelations(collectionName)
            let query = this.api.db.userDb?.(collectionName).select(this.selectFields(collectionName))

            for (let relation of relations) {
                if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === collectionName)
                    query = query?.leftJoin(
                        relation.options.rightTable,
                        `${relation.options.rightTable}.${relation.options.rightReference}`,
                        `${collectionName}.${relation.options.fieldName}`
                    ).select(this.selectFields(relation.options.rightTable, relation.options.fieldName))
            }

            const item = await query?.first()
            if (!item) return res.status(404).send(item)
            return res.send(this.toJson(item))
        }
    }

    insert(collectionName: string) {
        return async (req: Request, res: Response) => {
            const { mapped, error } = await this.mapBody({ ...req.body, ...req.files || {} }, collectionName, 'insert', { req, res })
            if (error.errorsFound()) return res.status(400).send(error.getMap())
            try {
                const id = await this.api.db.userDb?.(collectionName).insert({ ...mapped })
                if (id?.[0]) {
                    const item = await this.api.db.userDb?.(collectionName).where({ id: id[0] }).first()
                    return res.send(item)
                }
                else {
                    return res.status(400).send('Unknown error')
                }
            }
            catch (err: any) {
                console.log("ERROR", err.sqlMessage)
                return res.status(500).send(err.sqlMessage)
            }
        }
    }

    async saveMedia(media: UploadedFile) {
        const path = `${this.api.options.root}/medias/${media.name}`
        return new Promise((resolve, reject) => {
            media.mv(path, (err) => {
                if (err) return reject(err)
                else resolve(`/api/medias/${media.name}`)
            })
        })
    }

    async mapBody(body: any, name: string, context?: string, options?: { req: Request, res: Response }) {
        const mapped: any = {}
        const error = new ErrorMapper()
        const collection = this.api.configService.app.collections[name];
        const relations = this.api.configService.getAllRelations(name)
        const fields = this.api.configService.getFields(name)
        console.log(body)
        if (context === 'insert') {
            const fields = Object.entries(collection.fields).map(([name, options]) => ({ name, options }))
            const createdAt = fields.filter(i => i.options.type === 'CREATED_AT' || i.options.type === 'UPDATED_AT')
            const ip = fields.filter(i => i.options.type === 'IP')
            for (let field of createdAt) mapped[field.name] = new Date()
            for (let field of ip) {
                if (options?.req) mapped[field.name] = options.req.ip
            }
        }
        for (let [key, value] of Object.entries(body)) {
            if (collection.fields[key]) {
                const type = collection.fields[key].type
                switch (type) {
                    case 'STRING':
                        if (!maxLength(value, 255)) error.set(key, 'should be less than 255 characters')
                        mapped[key] = value;
                        break;
                    case 'TEXT':
                    case 'JSON':
                    case 'RICHTEXT':
                        mapped[key] = value;
                        break;
                    case 'MEDIA':
                        mapped[key] = await this.saveMedia(value as UploadedFile)
                        break;
                    case 'EMAIL':
                        if (!isEmail(value)) error.set(key, 'should be a valid email address')
                        mapped[key] = value
                        break;
                    case 'PASSWORD':
                        mapped[key] = bcrypt.hashSync(String(value), 10);
                        break;
                    case 'DATE':
                        mapped[key] = new Date(String(value));
                        break;
                    case 'BOOLEAN':
                        mapped[key] = !!value
                        break;
                    case 'INTEGER':
                        if (!isNumber(Number(value))) error.set(key, 'should be a number')
                        if (!isInt(Number(value))) error.set(key, 'should be an integer')
                        mapped[key] = Number(value)
                        break;
                    case 'FLOAT':
                        if (!isNumber(Number(value))) error.set(key, 'should be a number')
                        mapped[key] = Number(value)
                        break;
                }
            }
        }
        for (let relation of relations) {
            if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === name) {
                mapped[relation.options.fieldName] = body[relation.options.fieldName]
            }
        }
        if (context === 'insert') {
            for (let field of fields) {
                if (field.options.default !== undefined && mapped[field.name] === undefined) {
                    mapped[field.name] = this.generateDefault(field.options.default)
                }
            }
        }
        return { mapped, error };
    }

    generateDefault(type: string) {
        switch (type) {
            case 'RANDOM_TOKEN': return nanoid(40);
            case 'CURRENT_DATE': return new Date();
            default: return '';
        }
    }
}