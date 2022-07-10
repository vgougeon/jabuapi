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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Databases = void 0;
const knex_1 = require("knex");
class Databases {
    constructor(api) {
        this.api = api;
        this.userDb = null;
        this.userDbName = '';
        this.coreDb = (0, knex_1.knex)({
            client: 'better-sqlite3',
            connection: {
                filename: 'coredb.sqlite'
            }
        });
    }
    connectToUserDb() {
        return __awaiter(this, void 0, void 0, function* () {
            const appConfig = yield this.api.jsonService.get('settings.json');
            if (appConfig) {
                this.userDbName = appConfig.database.database;
                this.userDb = (0, knex_1.knex)({
                    client: 'mysql2',
                    connection: appConfig.database
                });
                try {
                    yield this.userDb.raw('SELECT 1 as isUp');
                }
                catch (err) {
                    this.userDb = null;
                    return false;
                }
            }
            return true;
        });
    }
    getStatus() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userDb) {
                try {
                    yield ((_a = this.userDb) === null || _a === void 0 ? void 0 : _a.raw('SELECT 1 as isUp'));
                    return true;
                }
                catch (err) {
                    this.userDb = null;
                    return false;
                }
            }
            return false;
        });
    }
}
exports.Databases = Databases;
