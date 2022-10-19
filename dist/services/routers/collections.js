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
const promises_1 = __importDefault(require("fs/promises"));
const utils_1 = require("../../utils/utils");
const lodash_1 = __importDefault(require("lodash"));
//TODO : stop reading app.json, read config variable (3 routes done)
function CollectionRouter(API) {
    const router = (0, express_1.Router)();
    router.get('/', (req, res) => {
        if (!API.configService.app)
            return res.status(200).send("NO DATA");
        else
            return res.send(API.configService.app);
    });
    router.post('/', (req, res) => {
        const app = lodash_1.default.cloneDeep(API.configService.app);
        app.collections[req.body.name] = {
            fields: {
                id: {
                    type: 'ID'
                },
                createdAt: {
                    type: 'CREATED_AT'
                }
            }
        };
        API.configService.setApp(app).then(() => {
            res.send(API.configService.app);
            API.SQL.createCollection({ [req.body.name]: app.collections[req.body.name] });
        });
    });
    // DELETE COLLECTION
    router.delete('/:collection', (req, res) => {
        const app = lodash_1.default.cloneDeep(API.configService.app);
        delete app.collections[req.params.collection];
        API.configService.setApp(app).then(() => {
            res.send(API.configService.app);
            API.SQL.deleteCollection(req.params.collection);
        });
    });
    //RENAME COLLECTION
    router.post('/:collection/rename', (req, res) => {
        const name = req.params.collection;
        const newName = req.body.name;
        if (!(name && newName))
            return res.status(400).send('No name provided');
        const app = lodash_1.default.cloneDeep(API.configService.app);
        app.collections[newName] = app.collections[name];
        delete app.collections[name];
        API.configService.setApp(app).then(() => {
            res.send(API.configService.app);
            API.SQL.renameCollection(name, newName);
        });
    });
    // ADD FIELD
    router.post('/:collection/add_field', (req, res) => {
        const [added] = Object.values(req.body);
        if (added.type === 'MANY TO MANY' || added.type === 'ASYMMETRIC' || added.type === 'ONE TO ONE' || added.type === 'ORDERED LIST') {
            API.jsonService.get('app.json')
                .then(f => {
                f.relations = Object.assign(Object.assign({}, f.relations), req.body);
                return f;
            })
                .then(f => (API.configService.setApp(f), f))
                .then(f => res.send(f))
                .then(() => {
                var _a;
                (_a = API.fields.get(added.type)) === null || _a === void 0 ? void 0 : _a.createRelation((0, utils_1.toNameOptions)(req.body));
            });
        }
        else {
            promises_1.default.stat(API.options.root + '/app.json')
                .then(() => promises_1.default.readFile(API.options.root + '/app.json'))
                .then(f => JSON.parse(f.toString()))
                .then(f => {
                f.collections[req.params.collection].fields = Object.assign(Object.assign({}, f.collections[req.params.collection].fields), req.body);
                return f;
            })
                .then(f => (API.configService.setApp(f), f))
                .then(f => res.send(f))
                // .then(() => API.SQL.addField(req.params.collection, req.body))
                .then(() => { var _a; return (_a = API.fields.get(added.type)) === null || _a === void 0 ? void 0 : _a.createField(req.params.collection, (0, utils_1.toNameOptions)(req.body)); })
                .catch(err => {
                if (err.syscall === 'open')
                    res.status(200).send("NO DATA");
                if (err.syscall === 'stat')
                    res.status(200).send("NO DATA");
                else
                    res.status(400).send('Unknown error');
            });
        }
    });
    //SET METADATA OF COLLECTION
    router.post('/:collection/setMetaData', (req, res) => {
        promises_1.default.stat(API.options.root + '/app.json')
            .then(() => promises_1.default.readFile(API.options.root + '/app.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => {
            f.collections[req.params.collection] = Object.assign(Object.assign({}, f.collections[req.params.collection]), req.body);
            return f;
        })
            .then(f => (API.configService.setApp(f), f))
            .then(f => res.send(f))
            .catch(err => {
            if (err.syscall === 'open')
                res.status(200).send("NO DATA");
            if (err.syscall === 'stat')
                res.status(200).send("NO DATA");
            else
                res.status(400).send('Unknown error');
        });
    });
    //SET CONFIG
    router.post('/:collection/setConfig', (req, res) => {
        promises_1.default.stat(API.options.root + '/app.json')
            .then(() => promises_1.default.readFile(API.options.root + '/app.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => {
            console.log(req.body);
            f.collections[req.params.collection].config = f.collections[req.params.collection].config || {};
            f.collections[req.params.collection].config = Object.assign(Object.assign({}, f.collections[req.params.collection].config), req.body);
            return f;
        })
            .then(f => (API.configService.setApp(f), f))
            .then(f => res.send(f))
            .catch(err => {
            if (err.syscall === 'open')
                res.status(200).send("NO DATA");
            if (err.syscall === 'stat')
                res.status(200).send("NO DATA");
            else
                res.status(400).send('Unknown error');
        });
    });
    // EDIT FIELD
    // TODO: fix SQL output
    router.post('/:collection/:field', (req, res) => {
        promises_1.default.stat(API.options.root + '/app.json')
            .then(() => promises_1.default.readFile(API.options.root + '/app.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => {
            delete f.collections[req.params.collection].fields[req.params.field];
            f.collections[req.params.collection].fields = Object.assign(Object.assign({}, f.collections[req.params.collection].fields), req.body);
            return f;
        })
            .then((f) => __awaiter(this, void 0, void 0, function* () { return (yield API.configService.setApp(f), f); }))
            .then(f => (res.send(f), f))
            .then(f => API.SQL.editField(req.params.collection, req.params.field, req.body))
            .catch(err => {
            if (err.syscall === 'open')
                res.status(200).send("NO DATA");
            if (err.syscall === 'stat')
                res.status(200).send("NO DATA");
            else
                res.status(400).send('Unknown error');
        });
    });
    // DELETE FIELD
    router.delete('/:collection/:field', (req, res) => {
        const type = req.body.options.type;
        if (type === 'MANY TO MANY' || type === 'ASYMMETRIC' || type === 'ONE TO ONE') {
            API.jsonService.get('app.json')
                .then(f => {
                delete f.relations[req.params.field];
                return f;
            })
                .then(f => (API.configService.setApp(f), f))
                .then(f => (res.send(f), f))
                .then(f => {
                var _a;
                (_a = API.fields.get(type)) === null || _a === void 0 ? void 0 : _a.deleteRelation(req.body);
            });
        }
        else {
            promises_1.default.stat(API.options.root + '/app.json')
                .then(() => promises_1.default.readFile(API.options.root + '/app.json'))
                .then(f => JSON.parse(f.toString()))
                .then(f => {
                delete f.collections[req.params.collection].fields[req.params.field];
                return f;
            })
                .then(f => (API.configService.setApp(f), f))
                .then(f => res.send(f))
                // .then(() => API.SQL.removeField(req.params.collection, req.params.field))
                .then(() => {
                var _a;
                (_a = API.fields.get(type)) === null || _a === void 0 ? void 0 : _a.deleteField(req.params.collection, req.body.name);
            })
                .catch(err => {
                if (err.syscall === 'open')
                    res.status(200).send("NO DATA");
                if (err.syscall === 'stat')
                    res.status(200).send("NO DATA");
                else
                    res.status(400).send('Unknown error');
            });
        }
    });
    return router;
}
exports.default = CollectionRouter;
