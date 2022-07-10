import { Request, Response, Router } from "express";
import fs from 'fs/promises'
import { API } from "../../geni";



export function StatusRoutes(API: API) {
    const router = Router()
    router.get('/', (req: Request, res: Response) => {
        fs.stat(API.options.root + '/settings.json')
        .then(() => fs.readFile(API.options.root + '/settings.json'))
        .then(f => JSON.parse(f.toString()))
        .then(f => (delete f.appPassword, delete f.appMail, f))
        .then(f => res.send(f))
        .catch(err => {
            if(err.syscall === 'open') res.status(200).send("NO DATA")
            if(err.syscall === 'stat') res.status(200).send("NO DATA")
            else res.status(400).send('Unknown error')
        })
    })
    
    router.get('/db', async (req: Request, res: Response) => {
        if(await API.db.getStatus()) return res.send('UP')
        else return res.send('DOWN')
    })
    
    return router
}
