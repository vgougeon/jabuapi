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
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    constructor(api) {
        this.api = api;
    }
    coreLogin() {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            const settings = this.api.configService.config;
            console.log(req.body);
            if (req.body.identifier && req.body.password) {
                if (req.body.identifier === settings.appMail && (yield bcrypt_1.default.compare(req.body.password, settings.appPassword))) {
                    res.setHeader('authorization', jsonwebtoken_1.default.sign('core-admin', 'SECRET'));
                    return res.status(200).send(true);
                }
            }
            return res.status(401).send(false);
        });
    }
    coreMe() {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.headers['authorization'];
            if (!token)
                return res.status(401).send('no-token');
            console.log(token);
            const decoded = jsonwebtoken_1.default.verify(token, 'SECRET');
            console.log(decoded);
            if (!decoded)
                return res.status(401).send('token-invalid');
            if (decoded === 'core-admin')
                return res.status(200).send('ok');
            else
                return res.status(401).send('not-core-admin');
        });
    }
    login(collectionName) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const collection = this.api.configService.getCollectionByName(collectionName);
            if (((_a = collection.config) === null || _a === void 0 ? void 0 : _a.auth) && req.body[(_c = (_b = collection.config) === null || _b === void 0 ? void 0 : _b.auth) === null || _c === void 0 ? void 0 : _c.password] && req.body[(_e = (_d = collection.config) === null || _d === void 0 ? void 0 : _d.auth) === null || _e === void 0 ? void 0 : _e.identifier]) {
                const identifierField = collection.config.auth.identifier;
                const passwordField = collection.config.auth.password;
                const item = yield ((_g = (_f = this.api.db).userDb) === null || _g === void 0 ? void 0 : _g.call(_f, collectionName).where({ [identifierField]: req.body[identifierField] }).first());
                if (!item)
                    return res.status(401).send('failed');
                else {
                    const isCorrectPassword = yield bcrypt_1.default.compare(req.body[passwordField], item[passwordField]);
                    if (isCorrectPassword) {
                        delete item[passwordField];
                        res.setHeader('authorization', jsonwebtoken_1.default.sign(item['id'], 'SECRET'));
                        return res.status(201).send(item);
                    }
                    else
                        return res.status(401).send('failed');
                }
            }
            return res.status(401).send('failed');
        });
    }
    register(collectionName) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const { mapped, error } = yield this.api.crudService.mapBody(Object.assign(Object.assign({}, req.body), req.files || {}), collectionName, 'insert', { req, res });
            if (error.errorsFound())
                return res.status(400).send(error.getMap());
            try {
                const id = yield ((_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, collectionName).insert(Object.assign({}, mapped)));
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
}
exports.AuthService = AuthService;
