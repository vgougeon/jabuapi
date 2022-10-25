import API from "../../index";
import { Request, Response, Router } from "express";

export default function EnumRouter(API: API) {
    const router = Router()


    // CREATE COLLECTION
    router.post('/', (req: Request, res: Response) => {
        const app = API.configService.app
        app.enums[req.body.name] = {
            entries: req.body.values,
            type: req.body.type || undefined
        }
        API.configService.setApp(app).then(() => {
            res.send(true)
        })
    })

    // DELETE COLLECTION
    router.delete('/:enum', (req: Request, res: Response) => {
    })

    return router
}