import fs from 'fs/promises';
import { API } from '../index';
import { IApp } from '../types/app.interface';

export class JsonService {

    constructor(private api: API) {}
    
    async getOrCreate(fileName: 'app.json'): Promise<IApp> {
        try {
            await fs.stat(this.api.options.root + '/' + fileName)
        }
        catch {
            await this.create(fileName, { collections: {}, relations: {}})
        }
        const read = await fs.readFile(this.api.options.root + '/' + fileName)
        const object = JSON.parse(read.toString())
        return object
    }

    async get(fileName: string) {
        return fs.stat(this.api.options.root + '/' + fileName)
            .then(() => fs.readFile(this.api.options.root + '/' + fileName))
            .then(f => JSON.parse(f.toString()))
            .catch(err => {
                if (err.syscall === 'open') console.log('No config yet. Skipping')
                if (err.syscall === 'stat') console.log('No config yet. Skipping')
                else console.log('Unknown error. Skipping')
            })
    }

    async create(fileName: string, object: Object) {
        return await fs.writeFile(this.api.options.root + '/' + fileName, JSON.stringify(object, null, '\t'))
    }

}