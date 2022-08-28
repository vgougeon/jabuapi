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
exports.RouterService = void 0;
const express_1 = require("express");
const pluralize_1 = __importDefault(require("pluralize"));
class RouterService {
    constructor(api) {
        this.api = api;
        this.router = (0, express_1.Router)();
        this.routes = [];
    }
    resetRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            this.generateRoutes(this.api.app);
        });
    }
    generateRoutes(app) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = this.api.configService.app;
            this.router.stack = [];
            this.routes = [];
            const collections = Object.entries(config.collections).map(([name, options]) => ({ name, options }));
            const relations = Object.entries(config.relations).map(([name, options]) => ({ name, options }));
            const authCollection = collections.find(c => { var _a, _b; return !!((_b = (_a = c.options.config) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.identifier); });
            if (authCollection) {
                this.router.post(`/login`, this.api.authService.login(authCollection.name));
                this.router.post(`/register`, this.api.authService.register(authCollection.name));
                this.routes.push({
                    category: 'Authentication',
                    type: 'POST',
                    name: `Login`,
                    url: `/api/login`
                });
                this.routes.push({
                    category: 'Authentication',
                    type: 'POST',
                    name: `Register`,
                    url: `/api/register`
                });
            }
            for (let collection of collections) {
                this.router.get(`/medias/:name`, this.getMedia());
                this.router.get(`/${collection.name}`, this.api.crudService.findAll(collection.name));
                this.router.get(`/${collection.name}/:id`, this.api.crudService.findOne(collection.name));
                this.router.post(`/${collection.name}`, this.api.crudService.insert(collection.name));
                this.router.put(`/${collection.name}/:id`, this.api.crudService.update(collection.name));
                this.routes = [
                    ...this.routes,
                    { category: collection.name, type: 'GET', name: `Fetch all ${(0, pluralize_1.default)(collection.name)}`, url: `/api/${collection.name}/` },
                    { category: collection.name, type: 'GET', name: `Fetch ${collection.name}`, url: `/api/${collection.name}/:id` },
                    { category: collection.name, type: 'POST', name: `Create ${collection.name}`, url: `/api/${collection.name}/` },
                    { category: collection.name, type: 'PUT', name: `Edit ${collection.name}`, url: `/api/${collection.name}/:id` },
                    { category: collection.name, type: 'DEL', name: `Delete ${collection.name}`, url: `/api/${collection.name}/:id` }
                ];
            }
            for (let relation of relations) {
                if (relation.options.type === 'ASYMMETRIC') {
                    console.log(`/${relation.options.rightTable}/:id/${relation.options.fieldName}`);
                    this.router.get(`/${relation.options.rightTable}/:id/${relation.options.fieldName}`, this.api.crudService.getRelationsAsymmetric(relation));
                    this.routes.push({
                        category: relation.options.rightTable,
                        type: 'GET',
                        name: `Fetch all ${(0, pluralize_1.default)(relation.options.fieldName)} by ${relation.options.rightTable}`,
                        url: `/api/${relation.options.rightTable}/:id/${relation.options.fieldName}`
                    });
                }
                if (relation.options.type === 'MANY TO MANY') {
                    this.router.get(`/${relation.options.rightTable}/:id/${relation.name}`, this.api.crudService.getRelationsManyToMany(relation, 'RIGHT'));
                    this.routes.push({
                        category: relation.options.rightTable,
                        type: 'GET',
                        name: `Fetch all ${(0, pluralize_1.default)(relation.name)} by ${relation.options.rightTable}`,
                        url: `/api/${relation.options.rightTable}/:id/${relation.name}`
                    });
                    if (relation.options.leftTable !== relation.options.rightTable) {
                        this.router.get(`/${relation.options.leftTable}/:id/${relation.name}`, this.api.crudService.getRelationsManyToMany(relation, 'LEFT'));
                        this.routes.push({
                            category: relation.options.leftTable,
                            type: 'GET',
                            name: `Fetch all ${(0, pluralize_1.default)(relation.name)} by ${relation.options.leftTable}`,
                            url: `/api/${relation.options.leftTable}/:id/${relation.name}`
                        });
                    }
                }
            }
            this.router.get('/', (req, res) => res.send('OKK'));
            app.use('/api', this.router);
            return true;
        });
    }
    getMedia() {
        return (req, res) => {
            res.sendFile(req.params.name, { root: `${this.api.options.root}/medias/` });
        };
    }
    getRoutes() {
        return (req, res) => {
            return res.send(this.routes);
        };
    }
}
exports.RouterService = RouterService;
