import { IRelation } from './../../types/app.interface';
import { Request, Response } from 'express';
import collectionMapper from '../collection.mapper';
import bcrypt from 'bcrypt';
import { isEmail, isInt, isNumber, isNumberString, maxLength } from 'class-validator';
import ErrorMapper from '../../utils/error-mapper';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { nanoid } from 'nanoid';
import API from '../../index';
import { sortMapper } from '../../utils/utils';
import { checkFolderExists } from '../../utils/file';
export class CrudService {
    constructor(private api: API) { }

    selectFields(collectionName: string, name = '', type = '') {
        const collection = this.api.configService.getCollectionByName(collectionName)
        console.log(Object.keys(collection.fields).map(key => `${collectionName}.${key}`).join(', '))
        if(type === 'array') return Object.keys(collection.fields).map(key => this.api.db.userDb?.raw(`JSON_ARRAYAGG(${collectionName}.${key})${name ? ` as ${name}.${key}` : ''}`))
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
        console.log(result)
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
                if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === collectionName) {
                    console.log('relation detected, joining', relation.name)
                    request = request?.leftJoin(
                        relation.options.rightTable,
                        `${relation.options.rightTable}.${relation.options.rightReference}`,
                        `${collectionName}.${relation.options.leftFieldName}`
                    ).select(this.selectFields(relation.options.rightTable, relation.options.leftFieldName))
                }


                // ONE TO MANY
                // if (relation.options.rightTable === collectionName) {
                //     console.log('MANY relation detected, joining', relation.name)
                //     request = request?.leftJoin(
                //         relation.options.leftTable,
                //         `${relation.options.rightTable}.${relation.options.rightReference}`,
                //         `${relation.options.leftTable}.${relation.options.leftFieldName}`
                //     ).select(this.selectFields(relation.options.leftTable, relation.options.rightFieldName, 'array'))
                // }
            }

            let sort = sortMapper(req)
            for (let s of sort) {
                s = s.split('.')
                request = request?.orderBy([{ column: s[0], order: s[1] || 'asc' }])
            }
            let pageSize = 10
            if (req.query.limit) {
                if (isNaN(+req.query.limit)) {
                    return res.status(400).send({ 'error': 'Limit should be a number' })
                }
                if (+req.query.limit < 1) {
                    return res.status(400).send({ 'error': 'Limit should be a number >= 1' })
                }
                request = request?.limit(+req.query.limit)
            }

            if (req.query.page) {
                if (isNaN(+req.query.page)) {
                    return res.status(400).send({ 'error': 'Page should be a number' })
                }
                if (+req.query.page < 1) {
                    return res.status(400).send({ 'error': 'Page should be a number >= 1' })
                }
                request = request?.limit(+req.query.page * pageSize).offset((+req.query.page - 1) * pageSize)
            }

            request = request?.groupBy(`${collectionName}.id`)
            res.send(this.toJson(await request as any))
            // res.send(await request)
        }
    }

    getRelationsAsymmetric(relation: { name: string; options: IRelation }) {
        return async (req: Request, res: Response) => {
            let request = this.api.db.userDb?.(relation.options.leftTable)
                .select(this.selectFields(relation.options.leftTable))
                .where(relation.options.fieldName, req.params.id)
            return res.send(this.toJson(await request as any))
        }
    }

    getRelationsManyToMany(relation: { name: string; options: IRelation }, side: 'LEFT' | 'RIGHT') {
        return async (req: Request, res: Response) => {
            let table = side === 'LEFT' ? relation.options.leftTable : relation.options.rightTable
            let target = side === 'RIGHT' ? relation.options.leftTable : relation.options.rightTable
            let reference = side === 'LEFT' ? relation.options.leftReference : relation.options.rightReference
            let shortSide = side === 'LEFT' ? 'l' : 'r'
            let shortOtherSide = side === 'LEFT' ? 'r' : 'l'
            let request = this.api.db.userDb?.(relation.name)
                .where(`${shortSide}_${table}_id`, +req.params.id)
                .join(target, `${relation.name}.${shortOtherSide}_${target}_id`, `${target}.${reference}`)
                .select(this.selectFields(target))
            if (relation.options.leftTable === relation.options.rightTable) {
                const sideReference = side === 'LEFT' ? 'leftReference' : 'rightReference'
                const otherSideReference = side === 'RIGHT' ? 'leftReference' : 'rightReference'
                request = this.api.db.userDb?.(relation.name)
                    .where(`${shortSide}_${table}_id`, +req.params.id)
                    .orWhere(`${shortOtherSide}_${table}_id`, +req.params.id)
                    .join(target, function () {
                        this.on(function () {
                            this.onVal(`${shortSide}_${table}_id`, '!=', `${+req.params.id}`)
                            this.andOn(`${shortSide}_${table}_id`, '=', `${table}.${relation.options[sideReference]}`)
                            this.orOnVal(`${shortOtherSide}_${table}_id`, '!=', `${+req.params.id}`)
                            this.andOn(`${shortOtherSide}_${table}_id`, '=', `${table}.${relation.options[otherSideReference]}`)
                        })
                    })
                    .select(this.selectFields(target))
            }
            console.log(request?.toSQL())
            return res.send(await request)
        }
    }

    findOne(collectionName: string) {
        return async (req: Request, res: Response) => {
            const relations = this.api.configService.getAllRelations(collectionName)
            let query = this.api.db.userDb?.(collectionName).where({ [collectionName + '.id']: +req.params.id })
                .select(this.selectFields(collectionName))

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
                await this.mapRelation(id?.[0], { ...req.body, ...req.files || {} }, collectionName, 'insert', { req, res })
                if (id?.[0]) {
                    const item = await this.api.db.userDb?.(collectionName).where({ id: id[0] }).first()
                    return res.send(item)
                }
                else {
                    return res.status(400).send('Unknown error')
                }
            }
            catch (err: any) {
                console.log("SQL ERROR", err.sqlMessage)
                return res.status(500).send(err.sqlMessage)
            }
        }
    }

    update(collectionName: string) {
        return async (req: Request, res: Response) => {
            const { mapped, error } = await this.mapBody({ ...req.body, ...req.files || {} }, collectionName, 'update', { req, res })
            if (error.errorsFound()) return res.status(400).send(error.getMap())
            try {
                const id = await this.api.db.userDb?.(collectionName).update({ ...mapped }).where({ id: req.params.id })
                if (id) {
                    const item = await this.api.db.userDb?.(collectionName).where({ id: id }).first()
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
        await checkFolderExists(`${this.api.options.root}/medias/`, true)
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
        // const collection = this.api.configService.app.collections[name];
        const relations = this.api.configService.getAllRelations(name);
        const fields = this.api.configService.getFields(name);
        for (let field of fields) {
            await this.api.fields.get(field.options.type)?.mapField(field, mapped, error, { body, name, context, options })
        }
        for (let relation of relations) {
            await this.api.fields.get(relation.options.type)?.mapRelation(relation, mapped, error, { body, name, context, options })
            // if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === name) {
            //     mapped[relation.options.fieldName] = body[relation.options.fieldName]
            // }
        }
        return { mapped, error }


        // if (context === 'insert') {
        //     for (let field of fields) {
        //         if (field.options.default !== undefined && mapped[field.name] === undefined) {
        //             mapped[field.name] = this.generateDefault(field.options.default)
        //         }
        //     }
        // }
        // return { mapped, error };
    }

    async mapRelation(inserted: any, body: any, name: string, context?: string, options?: { req: Request, res: Response }) {
        const relations = this.api.configService.getAllRelations(name);
        const error = new ErrorMapper()
        for (let relation of relations) {
            await this.api.fields.get(relation.options.type)?.mapRelation(relation, {}, error, { body, name, context, options, inserted })
        }
        return { error }
    }

    generateDefault(type: string) {
        switch (type) {
            case 'RANDOM_TOKEN': return nanoid(40);
            case 'CURRENT_DATE': return new Date();
            default: return '';
        }
    }
}