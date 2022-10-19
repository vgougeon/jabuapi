import fs from 'fs/promises';
import API from '../index';
import { IApp } from '../types/app.interface';

export class JsonService {

    constructor(private api: API) {}
    
    async getOrCreate(fileName: 'app.json'): Promise<IApp> {
        try {
            await fs.stat(this.api.options.root + '/' + fileName)
        }
        catch {
            await this.create(fileName, { collections: {}, relations: {}, enums: {}})
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
                return null
            })
    }

    async create(fileName: string, object: Object) {
        return await fs.writeFile(this.api.options.root + '/' + fileName, JSON.stringify(object, null, '\t'))
    }

    async getOrCreateFile(fileName: string, defaultValue: any): Promise<any> {
        try {
            await fs.stat(this.api.options.root + '/' + fileName)
        }
        catch {
            await this.create(fileName, defaultValue)
        }
        const read = await fs.readFile(this.api.options.root + '/' + fileName)
        const object = JSON.parse(read.toString())
        return object
    }

    async overwriteFile(fileName: string, value: any) {
        return await fs.writeFile(this.api.options.root + '/' + fileName, JSON.stringify(value, null, '\t'))
    }

    

}