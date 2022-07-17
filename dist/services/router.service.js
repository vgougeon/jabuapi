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
exports.RouterService = void 0;
const express_1 = require("express");
class RouterService {
    constructor(api) {
        this.api = api;
        this.router = (0, express_1.Router)();
    }
    resetRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Regenerating routes");
            this.router.stack = [];
            this.generateRoutes(this.api.app);
        });
    }
    generateRoutes(app) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = this.api.configService.app;
            this.router.stack = [];
            const collections = Object.entries(config.collections).map(([name, options]) => ({ name, options }));
            for (let collection of collections) {
                this.router.get(`/medias/:name`, this.getMedia());
                this.router.get(`/${collection.name}`, this.api.crudService.findAll(collection.name));
                this.router.get(`/${collection.name}/:id`, this.api.crudService.findOne(collection.name));
                this.router.post(`/${collection.name}`, this.api.crudService.insert(collection.name));
                this.router.put(`/${collection.name}/:id`, this.api.crudService.update(collection.name));
            }
            const authCollection = collections.find(c => { var _a, _b; return !!((_b = (_a = c.options.config) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.identifier); });
            if (authCollection) {
                this.router.post(`/login`, this.api.authService.login(authCollection.name));
                this.router.post(`/register`, this.api.authService.register(authCollection.name));
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
}
exports.RouterService = RouterService;
