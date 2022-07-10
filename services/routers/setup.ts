import { Request, Response, Router } from "express";
import knex from "knex";
import bcrypt from "bcrypt";
import fs from 'fs/promises';
import { API } from "../../geni";


export default function createSetupRoutes(API: API) {
    const router = Router()

    router.post('/db-test', async (req: Request, res: Response) => {
        const db = knex({
            client: "mysql2",
            connection: {
                host: req.body.dbHost,
                port: 3306,
                user: req.body.dbUser,
                password: req.body.dbPass,
                database: req.body.dbName
            }
        })
    
        try {
            await db.raw('SELECT 1 as isUp')
            return res.status(200).send('UP')
        }
        catch (err) {
            return res.status(404).send('DOWN')
        }
    })
    
    router.post('/done', async (req: Request, res: Response) => {
        const password = bcrypt.hashSync(req.body.password, 10)
    
        const f = await fs.writeFile(API.options.root + '/settings.json', JSON.stringify({
            appName: req.body.name,
            appMail: req.body.mail,
            appPassword: password,
            database: {
                host: req.body.dbHost,
                port: 3306,
                user: req.body.dbUser,
                password: req.body.dbPass,
                database: req.body.dbName
            }
        }, null, '\t'))
        const app = JSON.parse(await fs.readFile(API.options.root + '/settings.json', { encoding: "utf-8" }))
        delete app.appPassword
        return res.send(app)
    })
    
    router.post('/edit-db', async (req: Request, res: Response) => {
        const app = await fs.stat(API.options.root + '/settings.json')
            .then(() => fs.readFile(API.options.root + '/settings.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => (f.database = {
                host: req.body.dbHost,
                port: req.body.dbPort || 3306,
                user: req.body.dbUser,
                password: req.body.dbPass,
                database: req.body.dbName
            }, f))
            .then(f => (console.log(f), f))
            .then(f => (fs.writeFile(API.options.root + '/settings.json', JSON.stringify(f, null, '\t')), f))
            .then(f => (delete f.appPassword, f))
        await API.initUserApi()
        return res.send(app)
    })

    return router
}