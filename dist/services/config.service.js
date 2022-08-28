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
exports.ConfigService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
class ConfigService {
    constructor(api) {
        this.api = api;
        this.setup();
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.app = yield this.api.jsonService.getOrCreate('app.json');
            this.config = yield this.api.jsonService.get('settings.json');
            return true;
        });
    }
    getAllRelations(collectionName) {
        return Object.entries(this.app.relations || {})
            .map(([name, options]) => ({ name, options }))
            .filter(relation => relation.options.leftTable === collectionName || relation.options.rightTable === collectionName);
    }
    getFields(collectionName) {
        return Object.entries(this.app.collections[collectionName].fields || {})
            .map(([name, options]) => ({ name, options }));
    }
    getRelationByName(relationName) {
        return this.app.relations[relationName] || {};
    }
    getCollectionByName(collectionName) {
        return this.app.collections[collectionName] || {};
    }
    setApp(app) {
        return promises_1.default.writeFile(this.api.options.root + '/app.json', JSON.stringify(app, null, '\t'))
            .then(() => this.app = app)
            .then(() => this.api.routerService.resetRoutes());
    }
    refreshConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            this.config = yield this.api.jsonService.get('settings.json');
        });
    }
}
exports.ConfigService = ConfigService;
