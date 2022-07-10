import { Request, Response, Router } from "express";
import fs from 'fs/promises'
import { API } from "../../index";

//TODO : stop reading app.json, read config variable
export default function CollectionRouter(API: API) {
    const router = Router()

    router.get('/', (req: Request, res: Response) => {
        API.jsonService.get('app.json')
        .then(f => res.send(f))
        .catch(err => {
            if(err.syscall === 'open') res.status(200).send("NO DATA")
            if(err.syscall === 'stat') res.status(200).send("NO DATA")
            else res.status(400).send('Unknown error')
        })
    })
    
    // CREATE COLLECTION
    router.post('/', (req: Request, res: Response) => {
        fs.stat(API.options.root + '/app.json')
        .then(() => fs.readFile(API.options.root + '/app.json'))
        .then(f => JSON.parse(f.toString()))
        .then(f => {
            f.collections[req.body.name] = {
                fields: {
                    id: {
                        type: 'ID'
                    },
                    createdAt: {
                        type: 'CREATED_AT'
                    }
                }
            }
            return f
        })
        .then(async f => (await fs.writeFile(API.options.root + '/app.json', JSON.stringify(f, null, '\t')), f))
        .then(f => (res.send(f), f))
        .then(f => API.SQL.createCollection({ [req.body.name]: f.collections[req.body.name] }))
        .catch(err => {
            if(err.syscall === 'open') res.status(200).send("NO DATA")
            if(err.syscall === 'stat') res.status(200).send("NO DATA")
            else res.status(400).send('Unknown error')
        })
    })
    
    // DELETE COLLECTION
    router.delete('/:collection', (req: Request, res: Response) => {
        fs.stat(API.options.root + '/app.json')
        .then(() => fs.readFile(API.options.root + '/app.json'))
        .then(f => JSON.parse(f.toString()))
        .then(f => {
            delete f.collections[req.params.collection]
            return f
        })
        .then(f => (fs.writeFile(API.options.root + '/app.json', JSON.stringify(f, null, '\t')), f))
        .then(f => res.send(f))
        .catch(err => {
            if(err.syscall === 'open') res.status(200).send("NO DATA")
            if(err.syscall === 'stat') res.status(200).send("NO DATA")
            else res.status(400).send('Unknown error')
        })
    })
    
    // ADD FIELD
    router.post('/:collection/add_field', (req: Request, res: Response) => {
        const [added] = Object.values(req.body) as [any]
        if(added.type === 'MANY TO MANY' || added.type === 'ASYMMETRIC' || added.type === 'ONE TO ONE') {
            API.jsonService.get('app.json')
            .then(f => {
                f.relations = {...f.relations, ...req.body}
                return f
            })
            .then(f => (fs.writeFile(API.options.root + '/app.json', JSON.stringify(f, null, '\t')), f))
            .then(f => res.send(f))
            .then(() => API.SQL.addRelation(req.params.collection, req.body))
        }
        else {
            fs.stat(API.options.root + '/app.json')
            .then(() => fs.readFile(API.options.root + '/app.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => {
                f.collections[req.params.collection].fields = {...f.collections[req.params.collection].fields, ...req.body}
                return f
            })
            .then(f => (fs.writeFile(API.options.root + '/app.json', JSON.stringify(f, null, '\t')), f))
            .then(f => res.send(f))
            .then(() => API.SQL.addField(req.params.collection, req.body))
            .catch(err => {
                if(err.syscall === 'open') res.status(200).send("NO DATA")
                if(err.syscall === 'stat') res.status(200).send("NO DATA")
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
            f.collections[req.params.collection] = {...f.collections[req.params.collection], ...req.body }
            return f
        })
        .then(f => (fs.writeFile(API.options.root + '/app.json', JSON.stringify(f, null, '\t')), f))
        .then(f => res.send(f))
        .catch(err => {
            if(err.syscall === 'open') res.status(200).send("NO DATA")
            if(err.syscall === 'stat') res.status(200).send("NO DATA")
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
            f.collections[req.params.collection].config = {...f.collections[req.params.collection].config, ...req.body }
            return f
        })
        .then(f => (fs.writeFile(API.options.root + '/app.json', JSON.stringify(f, null, '\t')), f))
        .then(f => res.send(f))
        .catch(err => {
            if(err.syscall === 'open') res.status(200).send("NO DATA")
            if(err.syscall === 'stat') res.status(200).send("NO DATA")
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
            f.collections[req.params.collection].fields = {...f.collections[req.params.collection].fields, ...req.body}
            return f
        })
        .then(async f => (await fs.writeFile(API.options.root + '/app.json', JSON.stringify(f, null, '\t')), f))
        .then(f => (res.send(f), f))
        .then(f => API.SQL.editField(req.params.collection, req.params.field, req.body))
        .catch(err => {
            if(err.syscall === 'open') res.status(200).send("NO DATA")
            if(err.syscall === 'stat') res.status(200).send("NO DATA")
            else res.status(400).send('Unknown error')
        })
    })
    
    // DELETE FIELD
    router.delete('/:collection/:field', (req: Request, res: Response) => {
        const type = req.body.options.type
        if(type === 'MANY TO MANY' || type === 'ASYMMETRIC' || type === 'ONE TO ONE') {
            API.jsonService.get('app.json')
            .then(f => {
                delete f.relations[req.params.field]
                return f
            })
            .then(f => (fs.writeFile(API.options.root + '/app.json', JSON.stringify(f, null, '\t')), f))
            .then(f => (res.send(f), f))
        }
        else {
            fs.stat(API.options.root + '/app.json')
            .then(() => fs.readFile(API.options.root + '/app.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => {
                delete f.collections[req.params.collection].fields[req.params.field]
                return f
            })
            .then(f => (fs.writeFile(API.options.root + '/app.json', JSON.stringify(f, null, '\t')), f))
            .then(f => res.send(f))
            .then(() => API.SQL.removeField(req.params.collection, req.params.field))
            .catch(err => {
                if(err.syscall === 'open') res.status(200).send("NO DATA")
                if(err.syscall === 'stat') res.status(200).send("NO DATA")
                else res.status(400).send('Unknown error')
            })
        }
    })

    return router
}