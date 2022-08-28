import { Fields } from './fields/field.singleton';
import { Application } from "express";
import { Databases } from "./databases/db";
import { AppService } from "./services/app.service";
import { ConfigService } from "./services/config.service";
import { AuthService } from "./services/crud/auth.service";
import { CrudService } from "./services/crud/crud.service";
import { JsonService } from "./services/json.service";
import { RouterService } from "./services/router.service";
import { SQL } from "./services/routers/sql";
import Actions from './services/actions/actions';
export interface APIOptions {
    /** Your express application goes here. */
    app: Application;
    /** The path where JabuAPI will create config json, and store medias */
    root: string;
    /** /!\ When true, the database will be recreated during launch time and all data will be lost */
    force?: boolean;
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
    fields: Fields;
    actions: Actions;
    db: Databases;
    SQL: SQL;
    status: string;
    constructor(options: APIOptions);
    parseOptions(options: APIOptions): void;
    init(): Promise<void>;
    initUserApi(): Promise<void>;
}
