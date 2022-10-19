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
const express_1 = require("express");
const knex_1 = __importDefault(require("knex"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const promises_1 = __importDefault(require("fs/promises"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function createSetupRoutes(API) {
    const router = (0, express_1.Router)();
    router.post('/db-test', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const db = (0, knex_1.default)({
            client: "mysql2",
            connection: {
                host: req.body.dbHost,
                port: 3306,
                user: req.body.dbUser,
                password: req.body.dbPass,
                database: req.body.dbName
            }
        });
        try {
            yield db.raw('SELECT 1 as isUp');
            return res.status(200).send('UP');
        }
        catch (err) {
            return res.status(404).send('DOWN');
        }
    }));
    router.post('/done', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const password = bcrypt_1.default.hashSync(req.body.password, 10);
        const f = yield promises_1.default.writeFile(API.options.root + '/settings.json', JSON.stringify({
            appName: req.body.name,
            appMail: req.body.mail,
            appPassword: password,
            database: {
                host: req.body.dbHost,
                port: 3306,
                user: req.body.dbUser,
                password: req.body.dbPass,
                database: req.body.dbName
            }
        }, null, '\t'));
        const app = JSON.parse(yield promises_1.default.readFile(API.options.root + '/settings.json', { encoding: "utf-8" }));
        API.configService.refreshConfig();
        delete app.appPassword;
        res.setHeader('authorization', jsonwebtoken_1.default.sign('core-admin', 'SECRET'));
        return res.send(app);
    }));
    router.post('/edit-db', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const app = yield promises_1.default.stat(API.options.root + '/settings.json')
            .then(() => promises_1.default.readFile(API.options.root + '/settings.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => (f.database = {
            host: req.body.dbHost,
            port: req.body.dbPort || 3306,
            user: req.body.dbUser,
            password: req.body.dbPass,
            database: req.body.dbName
        }, f))
            .then(f => (console.log(f), f))
            .then(f => (promises_1.default.writeFile(API.options.root + '/settings.json', JSON.stringify(f, null, '\t')), f))
            .then(f => (delete f.appPassword, f));
        yield API.initUserApi();
        return res.send(app);
    }));
    return router;
}
exports.default = createSetupRoutes;
