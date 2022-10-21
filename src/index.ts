import { Fields } from './fields/field.singleton';
import cors from "cors";
import express, { Application } from "express";
import fileUpload from "express-fileupload";
import path from "path";
import { Databases } from "./databases/db";
import createSetupRoutes from "./services/routers/setup";
import { StatusRoutes } from "./services/routers/status";
import { AppService } from "./services/app.service";
import { ConfigService } from "./services/config.service";
import { AuthService } from "./services/crud/auth.service";
import { CrudService } from "./services/crud/crud.service";
import { JsonService } from "./services/json.service";
import { RouterService } from "./services/router.service";
import { SQL } from "./services/routers/sql";
import CollectionRouter from "./services/routers/collections";
import Actions from './services/actions/actions';
import RelationRouter from './services/routers/relations';
import EnumRouter from './services/routers/enums';
import { checkFolderExists } from './utils/file';
import apiProcess from './classes/api-process';
import SeedRouter from './services/routers/seed';
require('dotenv').config()

export interface APIOptions {
    /** Your express application goes here. */
    app: Application;
    /** The path where JabuAPI will create config json, and store medias */
    root: string;
    /** /!\ When true, the database will be recreated during launch time and all data will be lost */
    force?: boolean;
}

export default class API {
    app: Application;
    appService: AppService;
    configService: ConfigService;
    jsonService: JsonService;
    routerService: RouterService;
    crudService: CrudService;
    authService: AuthService;
    fields: Fields;
    actions: Actions;
    db: Databases;
    SQL: SQL;
    status = 'online'

    constructor(public options: APIOptions) {
        this.app = options.app
        this.parseOptions(options)
        this.appService = new AppService(this)
        this.jsonService = new JsonService(this)
        this.configService = new ConfigService(this)
        this.routerService = new RouterService(this)
        this.crudService = new CrudService(this)
        this.authService = new AuthService(this)
        this.db = new Databases(this)
        this.fields = new Fields(this)
        this.actions = new Actions(this)
        this.SQL = new SQL(this)
    }

    parseOptions(options: APIOptions) {
        options.root = options.root.replace(/\\/g, '/')
        if(options.root.endsWith('/')) options.root = options.root.slice(0, -1)
        if(options.force === undefined) options.force = false
    }

    async init() {
        const app = this.app

        app.use(express.json())
        app.use(express.urlencoded({ extended: true }))
        app.use(fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 },
        }));



        app.use(cors({
            allowedHeaders: ['authorization'],
            exposedHeaders: ['authorization']
        }))

        app.post('/core-api/login', this.authService.coreLogin())
        app.get('/core-api/me', this.authService.coreMe())
        app.get('/core-api/routes', this.routerService.getRoutes())
        app.use('/core-api/setup', createSetupRoutes(this))
        app.use('/core-api/status', StatusRoutes(this))
        app.use('/core-api/collections', CollectionRouter(this))
        app.use('/core-api/relations', RelationRouter(this))
        app.use('/core-api/enums', EnumRouter(this))
        app.use('/core-api/seeding', SeedRouter(this))

        await this.initUserApi()

    }

    async initUserApi() {
        const app = this.app
        await this.checkRoot()
            .then(() => this.configService.setup())
            .then(() => this.db.connectToUserDb())
            .then(() => { if(this.options.force) return this.appService.initDb() })
            .then(() => this.routerService.generateRoutes(app))
            .then(() => {
                app.use('/', express.static(path.join(__dirname, '../admin/')))
                app.use('/*', (req, res) => {
                    res.sendFile(path.join(__dirname, '../admin/index.html'))
                })
            })
    }

    async checkRoot() {
        try {
            await checkFolderExists(this.options.root)
            return true
        }
        catch (err) {
            apiProcess.stopProcess(`Root folder provided for JABU API does not exist, please create it before restarting : ${this.options.root}`)
        }
    }
}