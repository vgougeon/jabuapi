import { Application } from "express";
import { Databases } from "./databases/db";
import { AppService } from "./services/app.service";
import { ConfigService } from "./services/config.service";
import { AuthService } from "./services/crud/auth.service";
import { CrudService } from "./services/crud/crud.service";
import { JsonService } from "./services/json.service";
import { RouterService } from "./services/router.service";
import { SQL } from "./services/routers/sql";
export interface APIOptions {
    app: Application;
    root: string;
}
export default class API {
    options: APIOptions;
    app: Application;
    appService: AppService;
    configService: ConfigService;
    jsonService: JsonService;
    routerService: RouterService;
    crudService: CrudService;
    authService: AuthService;
    db: Databases;
    SQL: SQL;
    constructor(options: APIOptions);
    parseOptions(options: APIOptions): void;
    init(): Promise<void>;
    initUserApi(): Promise<void>;
}
