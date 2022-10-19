import { IField } from './../../types/app.interface';
import { Request, Response, Router } from "express";
import fs from 'fs/promises'
import API from "../../index";
import { IRelation } from "../../types/app.interface";
import { toNameOptions } from "../../utils/utils";
import { EAction } from '../actions/action.enum';
import _ from 'lodash';

//TODO : stop reading app.json, read config variable (3 routes done)
export default function CollectionRouter(API: API) {
    const router = Router()

    router.get('/', (req: Request, res: Response) => {
        if (!API.configService.app) return res.status(200).send("NO DATA")
        else return res.send(API.configService.app)
    })

    router.post('/', (req: Request, res: Response) => {
        const app = _.cloneDeep(API.configService.app)
        app.collections[req.body.name] = {
            fields: {
                id: {
                    type: 'ID'
                },
                createdAt: {
                    type: 'CREATED_AT'
                }
            }
        }
        API.configService.setApp(app).then(() => {
            res.send(API.configService.app)
            API.SQL.createCollection({ [req.body.name]: app.collections[req.body.name] })
        })
    })

    // DELETE COLLECTION
    router.delete('/:collection', (req: Request, res: Response) => {
        const app = _.cloneDeep(API.configService.app)
        delete app.collections[req.params.collection]
        API.configService.setApp(app).then(() => {
            res.send(API.configService.app)
            API.SQL.deleteCollection(req.params.collection)
        })
    })

    //RENAME COLLECTION
    router.post('/:collection/rename', (req: Request, res: Response) => {
        const name = req.params.collection
        const newName = req.body.name
        if (!(name && newName)) return res.status(400).send('No name provided')
        const app = _.cloneDeep(API.configService.app)
        app.collections[newName] = app.collections[name]
        delete app.collections[name]
        API.configService.setApp(app).then(() => {
            res.send(API.configService.app)
            API.SQL.renameCollection(name, newName)
        })
    })

    // ADD FIELD
    router.post('/:collection/add_field', (req: Request, res: Response) => {
        const [added] = Object.values(req.body) as [any]
        if (added.type === 'MANY TO MANY' || added.type === 'ASYMMETRIC' || added.type === 'ONE TO ONE' || added.type === 'ORDERED LIST') {
            API.jsonService.get('app.json')
                .then(f => {
                    f.relations = { ...f.relations, ...req.body }
                    return f
                })
                .then(f => (API.configService.setApp(f), f))
                .then(f => res.send(f))
                .then(() => {
                    API.fields.get(added.type)?.createRelation(toNameOptions<IRelation>(req.body))
                })
        }
        else {
            fs.stat(API.options.root + '/app.json')
                .then(() => fs.readFile(API.options.root + '/app.json'))
                .then(f => JSON.parse(f.toString()))
                .then(f => {
                    f.collections[req.params.collection].fields = { ...f.collections[req.params.collection].fields, ...req.body }
                    return f
                })
                .then(f => (API.configService.setApp(f), f))
                .then(f => res.send(f))
                // .then(() => API.SQL.addField(req.params.collection, req.body))
                .then(() => API.fields.get(added.type)?.createField(req.params.collection, toNameOptions<IField>(req.body)))
                .catch(err => {
                    if (err.syscall === 'open') res.status(200).send("NO DATA")
                    if (err.syscall === 'stat') res.status(200).send("NO DATA")
                    else res.status(400).send('Unknown error')
                })
        }
    })

    //SET METADATA OF COLLECTION
    router.post('/:collection/setMetaData', (req: Request, res: Response) => {
        fs.stat(API.options.root + '/app.json')
            .then(() => fs.readFile(API.options.root + '/app.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => {
                f.collections[req.params.collection] = { ...f.collections[req.params.collection], ...req.body }
                return f
            })
            .then(f => (API.configService.setApp(f), f))
            .then(f => res.send(f))
            .catch(err => {
                if (err.syscall === 'open') res.status(200).send("NO DATA")
                if (err.syscall === 'stat') res.status(200).send("NO DATA")
                else res.status(400).send('Unknown error')
            })
    })

    //SET CONFIG
    router.post('/:collection/setConfig', (req: Request, res: Response) => {
        fs.stat(API.options.root + '/app.json')
            .then(() => fs.readFile(API.options.root + '/app.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => {
                console.log(req.body)
                f.collections[req.params.collection].config = f.collections[req.params.collection].config || {}
                f.collections[req.params.collection].config = { ...f.collections[req.params.collection].config, ...req.body }
                return f
            })
            .then(f => (API.configService.setApp(f), f))
            .then(f => res.send(f))
            .catch(err => {
                if (err.syscall === 'open') res.status(200).send("NO DATA")
                if (err.syscall === 'stat') res.status(200).send("NO DATA")
                else res.status(400).send('Unknown error')
            })
    })

    // EDIT FIELD
    // TODO: fix SQL output
    router.post('/:collection/:field', (req: Request, res: Response) => {
        fs.stat(API.options.root + '/app.json')
            .then(() => fs.readFile(API.options.root + '/app.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => {
                delete f.collections[req.params.collection].fields[req.params.field]
                f.collections[req.params.collection].fields = { ...f.collections[req.params.collection].fields, ...req.body }
                return f
            })
            .then(async f => (await API.configService.setApp(f), f))
            .then(f => (res.send(f), f))
            .then(f => API.SQL.editField(req.params.collection, req.params.field, req.body))
            .catch(err => {
                if (err.syscall === 'open') res.status(200).send("NO DATA")
                if (err.syscall === 'stat') res.status(200).send("NO DATA")
                else res.status(400).send('Unknown error')
            })
    })

    // DELETE FIELD
    router.delete('/:collection/:field', (req: Request, res: Response) => {
        const type = req.body.options.type
        if (type === 'MANY TO MANY' || type === 'ASYMMETRIC' || type === 'ONE TO ONE') {
            API.jsonService.get('app.json')
                .then(f => {
                    delete f.relations[req.params.field]
                    return f
                })
                .then(f => (API.configService.setApp(f), f))
                .then(f => (res.send(f), f))
                .then(f => {
                    API.fields.get(type)?.deleteRelation(req.body)
                })
        }
        else {
            fs.stat(API.options.root + '/app.json')
                .then(() => fs.readFile(API.options.root + '/app.json'))
                .then(f => JSON.parse(f.toString()))
                .then(f => {
                    delete f.collections[req.params.collection].fields[req.params.field]
                    return f
                })
                .then(f => (API.configService.setApp(f), f))
                .then(f => res.send(f))
                // .then(() => API.SQL.removeField(req.params.collection, req.params.field))
                .then(() => {
                    API.fields.get(type)?.deleteField(req.params.collection, req.body.name)
                })
                .catch(err => {
                    if (err.syscall === 'open') res.status(200).send("NO DATA")
                    if (err.syscall === 'stat') res.status(200).send("NO DATA")
                    else res.status(400).send('Unknown error')
                })
        }
    })

    return router
}