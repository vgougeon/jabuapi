import { Request, Response, Router } from "express";
import fs from 'fs/promises'
import API from "../..";

export default function RelationRouter(API: API) {
    const router = Router()

    router.delete('/:relation', (req: Request, res: Response) => {
        const name = req.params.relation
        console.log(name)
        const relation = API.configService.getRelationByName(name)
        let config = API.configService.app
        API.fields.get(relation.type)?.deleteRelation({
            name: req.params.relation,
            options: relation
        })
        delete config.relations[name]
        API.configService.setApp(config)
        .then(() => res.send(config))
    })

    return router
}