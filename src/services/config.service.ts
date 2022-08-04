import API from "../index";
import { IApp } from "../types/app.interface";
import { IConfig } from "../types/config.interface";
import fs from 'fs/promises';

export class ConfigService {
    app!: IApp;
    config!: IConfig;
    constructor(private api: API) {
        this.setup()
    }

    async setup() {
        this.app = await this.api.jsonService.getOrCreate('app.json');
        this.config = await this.api.jsonService.get('settings.json');
        return true
    }

    getAllRelations(collectionName: string) {
        return Object.entries(this.app.relations || {})
        .map(([name, options]) => ({ name, options }))
        .filter(relation => relation.options.leftTable === collectionName || relation.options.rightTable === collectionName);
    }

    getFields(collectionName: string) {
        return Object.entries(this.app.collections[collectionName].fields || {})
        .map(([name, options]) => ({ name, options }))
    }

    getRelationByName(relationName: string) {
        return this.app.relations[relationName] || {}
    }

    getCollectionByName(collectionName: string) {
        return this.app.collections[collectionName] || {}
    }

    setApp(app: IApp) {
        return fs.writeFile(this.api.options.root + '/app.json', JSON.stringify(app, null, '\t'))
        .then(() => this.app = app)
        .then(() => this.api.routerService.resetRoutes())
    }

    async refreshConfig() {
        this.config = await this.api.jsonService.get('settings.json');
    }
}