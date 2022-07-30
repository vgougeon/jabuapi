import { EAction } from './action.enum';
import API from '../..';
import { Action } from './action';
export default class Actions {
    constructor(private api: API) {}
    queue: Action[] = []

    create(name: EAction, ...args: any) {
        if(this.api.status === 'online') {
            this.addToQueue(new Action(this.api, name, args))
        }
    }

    async addToQueue(action: Action) {
        if(this.queue.length === 0) {
            this.queue.push(action)
            while(this.queue.length > 0) {
                await this.append(this.queue[0])
                this.queue.shift()
            }
        }
        else {
            this.queue.push(action)
        } 
    }

    async append(action: Action) {
        const array = await this.api.jsonService.getOrCreateFile('actions.json', [])
        array.push({
            id: action.id,
            name: action.name,
            args: action.args
        })
        await this.api.jsonService.overwriteFile('actions.json', array)
    }
}