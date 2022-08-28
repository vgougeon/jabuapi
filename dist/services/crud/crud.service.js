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
exports.CrudService = void 0;
const error_mapper_1 = __importDefault(require("../../utils/error-mapper"));
const nanoid_1 = require("nanoid");
class CrudService {
    constructor(api) {
        this.api = api;
    }
    selectFields(collectionName, name = '') {
        const collection = this.api.configService.getCollectionByName(collectionName);
        console.log(Object.keys(collection.fields).map(key => `${collectionName}.${key}`).join(', '));
        return Object.keys(collection.fields).map(key => `${collectionName}.${key}${name ? ` as ${name}.${key}` : ''}`);
    }
    toJson(result) {
        console.log(result);
        const convertRow = (row) => {
            const result = {};
            for (const objectPath in row) {
                const parts = objectPath.split('.');
                let target = result;
                while (parts.length > 1) {
                    const part = parts.shift();
                    if (part)
                        target = target[part] = target[part] || {};
                }
                target[parts[0]] = row[objectPath];
            }
            return result;
        };
        if (Array.isArray(result)) {
            return result.map(row => convertRow(row));
        }
        else
            return convertRow(result);
    }
    findAll(collectionName) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const relations = this.api.configService.getAllRelations(collectionName);
            let request = (_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, collectionName).select(this.selectFields(collectionName));
            for (let relation of relations) {
                //MANY TO ONE
                if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === collectionName)
                    request = request === null || request === void 0 ? void 0 : request.leftJoin(relation.options.rightTable, `${relation.options.rightTable}.${relation.options.rightReference}`, `${collectionName}.${relation.options.fieldName}`).select(this.selectFields(relation.options.rightTable, relation.options.fieldName));
                //ONE TO MANY
                // if(relation.options.rightTable === collectionName) {
                //     console.log(relation)
                //     request = request?.leftJoin(
                //         relation.options.leftTable,
                //         `${relation.options.rightTable}.${relation.options.rightReference}`,
                //         `${relation.options.leftTable}.${relation.options.fieldName}`
                //     ).select(this.selectFields(relation.options.leftTable, relation.options.fieldName))
                // }
            }
            res.send(this.toJson(yield request));
            // res.send(await request)
        });
    }
    getRelationsAsymmetric(relation) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let request = (_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, relation.options.leftTable).select(this.selectFields(relation.options.leftTable)).where(relation.options.fieldName, req.params.id);
            return res.send(this.toJson(yield request));
        });
    }
    getRelationsManyToMany(relation, side) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            let table = side === 'LEFT' ? relation.options.leftTable : relation.options.rightTable;
            let target = side === 'RIGHT' ? relation.options.leftTable : relation.options.rightTable;
            let reference = side === 'LEFT' ? relation.options.leftReference : relation.options.rightReference;
            let shortSide = side === 'LEFT' ? 'l' : 'r';
            let shortOtherSide = side === 'LEFT' ? 'r' : 'l';
            let request = (_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, relation.name).where(`${shortSide}_${table}_id`, +req.params.id).join(target, `${relation.name}.${shortOtherSide}_${target}_id`, `${target}.${reference}`).select(this.selectFields(target));
            if (relation.options.leftTable === relation.options.rightTable) {
                const sideReference = side === 'LEFT' ? 'leftReference' : 'rightReference';
                const otherSideReference = side === 'RIGHT' ? 'leftReference' : 'rightReference';
                request = (_d = (_c = this.api.db).userDb) === null || _d === void 0 ? void 0 : _d.call(_c, relation.name).where(`${shortSide}_${table}_id`, +req.params.id).orWhere(`${shortOtherSide}_${table}_id`, +req.params.id).join(target, function () {
                    this.on(function () {
                        this.onVal(`${shortSide}_${table}_id`, '!=', `${+req.params.id}`);
                        this.andOn(`${shortSide}_${table}_id`, '=', `${table}.${relation.options[sideReference]}`);
                        this.orOnVal(`${shortOtherSide}_${table}_id`, '!=', `${+req.params.id}`);
                        this.andOn(`${shortOtherSide}_${table}_id`, '=', `${table}.${relation.options[otherSideReference]}`);
                    });
                }).select(this.selectFields(target));
            }
            console.log(request === null || request === void 0 ? void 0 : request.toSQL());
            return res.send(yield request);
        });
    }
    findOne(collectionName) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const relations = this.api.configService.getAllRelations(collectionName);
            let query = (_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, collectionName).where({ [collectionName + '.id']: +req.params.id }).select(this.selectFields(collectionName));
            for (let relation of relations) {
                if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === collectionName)
                    query = query === null || query === void 0 ? void 0 : query.leftJoin(relation.options.rightTable, `${relation.options.rightTable}.${relation.options.rightReference}`, `${collectionName}.${relation.options.fieldName}`).select(this.selectFields(relation.options.rightTable, relation.options.fieldName));
            }
            const item = yield (query === null || query === void 0 ? void 0 : query.first());
            if (!item)
                return res.status(404).send(item);
            return res.send(this.toJson(item));
        });
    }
    insert(collectionName) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const { mapped, error } = yield this.mapBody(Object.assign(Object.assign({}, req.body), req.files || {}), collectionName, 'insert', { req, res });
            if (error.errorsFound())
                return res.status(400).send(error.getMap());
            try {
                const id = yield ((_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, collectionName).insert(Object.assign({}, mapped)));
                yield this.mapRelation(id === null || id === void 0 ? void 0 : id[0], Object.assign(Object.assign({}, req.body), req.files || {}), collectionName, 'insert', { req, res });
                if (id === null || id === void 0 ? void 0 : id[0]) {
                    const item = yield ((_d = (_c = this.api.db).userDb) === null || _d === void 0 ? void 0 : _d.call(_c, collectionName).where({ id: id[0] }).first());
                    return res.send(item);
                }
                else {
                    return res.status(400).send('Unknown error');
                }
            }
            catch (err) {
                console.log("ERROR", err.sqlMessage);
                return res.status(500).send(err.sqlMessage);
            }
        });
    }
    update(collectionName) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const { mapped, error } = yield this.mapBody(Object.assign(Object.assign({}, req.body), req.files || {}), collectionName, 'update', { req, res });
            if (error.errorsFound())
                return res.status(400).send(error.getMap());
            try {
                const id = yield ((_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, collectionName).update(Object.assign({}, mapped)).where({ id: req.params.id }));
                if (id) {
                    const item = yield ((_d = (_c = this.api.db).userDb) === null || _d === void 0 ? void 0 : _d.call(_c, collectionName).where({ id: id }).first());
                    return res.send(item);
                }
                else {
                    return res.status(400).send('Unknown error');
                }
            }
            catch (err) {
                console.log("ERROR", err.sqlMessage);
                return res.status(500).send(err.sqlMessage);
            }
        });
    }
    saveMedia(media) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = `${this.api.options.root}/medias/${media.name}`;
            return new Promise((resolve, reject) => {
                media.mv(path, (err) => {
                    if (err)
                        return reject(err);
                    else
                        resolve(`/api/medias/${media.name}`);
                });
            });
        });
    }
    mapBody(body, name, context, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const mapped = {};
            const error = new error_mapper_1.default();
            // const collection = this.api.configService.app.collections[name];
            const relations = this.api.configService.getAllRelations(name);
            const fields = this.api.configService.getFields(name);
            for (let field of fields) {
                yield ((_a = this.api.fields.get(field.options.type)) === null || _a === void 0 ? void 0 : _a.mapField(field, mapped, error, { body, name, context, options }));
            }
            for (let relation of relations) {
                yield ((_b = this.api.fields.get(relation.options.type)) === null || _b === void 0 ? void 0 : _b.mapRelation(relation, mapped, error, { body, name, context, options }));
                // if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === name) {
                //     mapped[relation.options.fieldName] = body[relation.options.fieldName]
                // }
            }
            return { mapped, error };
        });
    }
    mapRelation(inserted, body, name, context, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const relations = this.api.configService.getAllRelations(name);
            const error = new error_mapper_1.default();
            for (let relation of relations) {
                yield ((_a = this.api.fields.get(relation.options.type)) === null || _a === void 0 ? void 0 : _a.mapRelation(relation, {}, error, { body, name, context, options, inserted }));
            }
            return { error };
        });
    }
    generateDefault(type) {
        switch (type) {
            case 'RANDOM_TOKEN': return (0, nanoid_1.nanoid)(40);
            case 'CURRENT_DATE': return new Date();
            default: return '';
        }
    }
}
exports.CrudService = CrudService;
