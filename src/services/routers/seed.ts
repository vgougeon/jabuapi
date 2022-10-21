import { Request, Response, Router } from "express";
import API from "../../index";

export default function SeedRouter(API: API) {
    const router = Router()

    router.get('/', (req: Request, res: Response) => {
        return res.send(API.configService.seed)
    })
    
    return router
}