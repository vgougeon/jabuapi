"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./databases/db");
const setup_1 = __importDefault(require("./services/routers/setup"));
const status_1 = require("./services/routers/status");
const app_service_1 = require("./services/app.service");
const config_service_1 = require("./services/config.service");
const auth_service_1 = require("./services/crud/auth.service");
const crud_service_1 = require("./services/crud/crud.service");
const json_service_1 = require("./services/json.service");
const router_service_1 = require("./services/router.service");
const sql_1 = require("./services/routers/sql");
const collections_1 = __importDefault(require("./services/routers/collections"));
class API {
    constructor(options) {
        this.options = options;
        this.app = options.app;
        this.parseOptions(options);
        this.appService = new app_service_1.AppService(this);
        this.jsonService = new json_service_1.JsonService(this);
        this.configService = new config_service_1.ConfigService(this);
        this.routerService = new router_service_1.RouterService(this);
        this.crudService = new crud_service_1.CrudService(this);
        this.authService = new auth_service_1.AuthService(this);
        this.db = new db_1.Databases(this);
        this.SQL = new sql_1.SQL(this);
    }
    parseOptions(options) {
        if (options.root.endsWith('/'))
            options.root.slice(0, -1);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const app = this.app;
            app.use(express_1.default.json());
            app.use(express_1.default.urlencoded({ extended: true }));
            app.use((0, express_fileupload_1.default)({
                limits: { fileSize: 50 * 1024 * 1024 },
            }));
            app.use((0, cors_1.default)({
                allowedHeaders: ['authorization'],
                exposedHeaders: ['authorization']
            }));
            app.post('/core-api/login', this.authService.coreLogin());
            app.get('/core-api/me', this.authService.coreMe());
            app.use('/core-api/setup', (0, setup_1.default)(this));
            app.use('/core-api/status', (0, status_1.StatusRoutes)(this));
            app.use('/core-api/collections', (0, collections_1.default)(this));
            yield this.initUserApi();
        });
    }
    initUserApi() {
        return __awaiter(this, void 0, void 0, function* () {
            const app = this.app;
            yield this.db.connectToUserDb()
                .then(() => this.appService.initDb())
                .then(() => this.routerService.generateRoutes(app))
                .then(() => {
                app.use('/', express_1.default.static(path_1.default.join(__dirname, './admin/')));
                app.use('/*', (req, res) => {
                    res.sendFile(path_1.default.join(__dirname, './admin/index.html'));
                });
            });
        });
    }
}
exports.API = API;
console.log("OK!");
