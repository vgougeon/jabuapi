import API from "../index";
import { IApp } from "../types/app.interface";
import { IConfig } from "../types/config.interface";
import fs from 'fs/promises';
import { Colors, logger } from "../classes/logger";

export class ConfigService {
    app!: IApp;
    config!: IConfig;
    constructor(private api: API) {}

    async setup() {
        this.app = await this.api.jsonService.getOrCreate('app.json');
        this.config = await this.api.jsonService.get('settings.json');
        if(this.api.options.force) logger.debug(`JABU API is running in ${Colors.BgRed}${Colors.FgBlack} FORCE ${Colors.Reset} mode, which means your database will be erased and recreated on restart.`)
        if(!this.config) logger.debug(`Welcome to JABU API ! Initialize your app by connecting to your express server on the browser`)
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