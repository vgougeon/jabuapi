import { Request, Response, Router } from "express";
import _ from "lodash";
import { nanoid } from "nanoid";
import { Seeder } from "../../classes/seeder";
import API from "../../index";

export default function SeedRouter(API: API) {
    const router = Router()

    router.get('/', (req: Request, res: Response) => {
        return res.send(API.configService.seed)
    })

    router.post('/', (req: Request, res: Response) => {
        if(!req.body.collection) return res.status(400).send('Collection field missing.')
        if(!req.body.quantity) return res.status(400).send('Collection quantity missing.')
        const seeding = _.cloneDeep(API.configService.seed)
        seeding.push({
            collection: req.body.collection,
            id: String(new Date().getTime()) + nanoid(),
            payload: req.body.payload,
            quantity: +req.body.quantity
        })
        API.configService.setSeed(seeding).then(() => {
            return res.send('OK')
        })
    })

    router.post('/launch', (req: Request, res: Response) => {
        const seeding = API.configService.seed
        const seeder = new Seeder(seeding, API, res)
        seeder.launchSeed().then(() => {
            setTimeout(() => {
                res.end('DONE')
            }, 10000)
        })
    })
    
    return router
}