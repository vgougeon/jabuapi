import fs from 'fs/promises';
import API from '../index';
import { IApp, ISeed } from '../types/app.interface';
import { IConfig } from '../types/config.interface';

export class JsonService {

    constructor(private api: API) {}
    
    async getOrCreate(fileName: 'app.json' | 'seeding.json'): Promise<IApp> {
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

    getConfig() {
        return fs.stat(this.api.options.root + '/' + 'settings.json')
            .then(() => fs.readFile(this.api.options.root + '/' + 'settings.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => {
                (f as IConfig).database.database = process.env['DB_NAME'] || (f as IConfig).database.database;
                (f as IConfig).database.host = process.env['DB_HOST'] || (f as IConfig).database.host;
                (f as IConfig).database.user = process.env['DB_USER'] || (f as IConfig).database.user;
                (f as IConfig).database.password = process.env['DB_PASSWORD'] || (f as IConfig).database.password;
                return f
            })
            .catch(err => {
                return null
            })
    }

    getSeed(): Promise<ISeed[]> {
        return fs.stat(this.api.options.root + '/' + 'seeding.json')
            .then(() => fs.readFile(this.api.options.root + '/' + 'seeding.json'))
            .then(f => JSON.parse(f.toString()))
    }


}