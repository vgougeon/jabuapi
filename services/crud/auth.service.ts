import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { API } from '../../geni';

export class AuthService {
    constructor(private api: API) {}

    coreLogin() {
        return async (req: Request, res: Response) => {
            const settings = this.api.configService.config
            console.log(req.body)
            if(req.body.identifier && req.body.password) {
                if(req.body.identifier === settings.appMail && await bcrypt.compare(req.body.password, settings.appPassword)) {
                    res.setHeader('authorization', jwt.sign('core-admin', 'SECRET'))
                    return res.status(200).send(true)
                }
            }
            return res.status(401).send(false)
        }
    }

    coreMe() {
        return async (req: Request, res: Response) => {
            const token = req.headers['authorization']
            if(!token) return res.status(401).send('no-token')
            console.log(token)
            const decoded = jwt.verify(token, 'SECRET')
            console.log(decoded)
            if(!decoded) return res.status(401).send('token-invalid')
            if(decoded === 'core-admin') return res.status(200).send('ok')
            else return res.status(401).send('not-core-admin')
        }
    }

    login(collectionName: string) {
        return async (req: Request, res: Response) => {
            const collection = this.api.configService.getCollectionByName(collectionName)
            if(collection.config?.auth && req.body[collection.config?.auth?.password] && req.body[collection.config?.auth?.identifier]) {
                const identifierField = collection.config.auth.identifier
                const passwordField = collection.config.auth.password
                const item = await this.api.db.userDb?.(collectionName).where({ [identifierField]: req.body[identifierField] }).first()
                if (!item) return res.status(401).send('failed')
                else {
                    const isCorrectPassword = await bcrypt.compare(req.body[passwordField], item[passwordField])
                    if(isCorrectPassword) {
                        delete item[passwordField]
                        res.setHeader('authorization', jwt.sign(item['id'], 'SECRET'))
                        return res.status(201).send(item)
                    }
                    else return res.status(401).send('failed')
                }
            }
            
            return res.status(401).send('failed')
        }
    }

    register(collectionName: string) {
        return async (req: Request, res: Response) => {
            const { mapped, error } = await this.api.crudService.mapBody({ ...req.body, ...req.files || {}}, collectionName, 'insert', { req, res })
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
            catch(err: any) {
                console.log("ERROR", err.sqlMessage)
                return res.status(500).send(err.sqlMessage)
            }
        }
    }
}