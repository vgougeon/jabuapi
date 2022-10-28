import { Response } from "express";
import _ from "lodash";
import API from "..";
import { ISeed } from "../types/app.interface";
import { faker } from '@faker-js/faker'
export class Seeder {
    constructor(private seeding: ISeed[], private API: API, private response?: Response) {

    }

    async launchSeed() {
        for(let item of this.seeding) {
            for(let i = 0; i < item.quantity; i++) {
                const req: any = {}
                req.body = _.cloneDeep(item.payload)
                for(let key of Object.keys(req.body)) {
                    const matches: any[] = Array.from(req.body[key].matchAll(/{{\s*(.*?)\s*}}/g))
                    for(let match of matches) {
                        const fn = _.get(faker, match[1])
                        if(typeof(fn) === 'function') req.body[key] = req.body[key].replace(match[0], fn())
                    }
                }
                await this.API.crudService.insert(item.collection)(req, { send: () => {}, status: () => ({ send: () => {}})} as any)
            }
        }
        return true
    }
}