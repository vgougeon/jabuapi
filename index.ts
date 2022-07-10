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

export interface APIOptions {
    app: Application;
    root: string;
}

export class API {
    app: Application;
    appService: AppService;
    configService: ConfigService;
    jsonService: JsonService;
    routerService: RouterService;
    crudService: CrudService;
    authService: AuthService;
    db: Databases;
    SQL: SQL;

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
        this.SQL = new SQL(this)
    }

    parseOptions(options: APIOptions) {
        if (options.root.endsWith('/')) options.root.slice(0, -1)
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
        app.use('/core-api/setup', createSetupRoutes(this))
        app.use('/core-api/status', StatusRoutes(this))
        app.use('/core-api/collections', CollectionRouter(this))

        await this.initUserApi()

    }

    async initUserApi() {
        const app = this.app
        await this.db.connectToUserDb()
            .then(() => this.appService.initDb())
            .then(() => this.routerService.generateRoutes(app))
            .then(() => {
                app.use('/', express.static(path.join(__dirname, './admin/')))
                app.use('/*', (req, res) => {
                    res.sendFile(path.join(__dirname, './admin/index.html'))
                })
            })
    }


}