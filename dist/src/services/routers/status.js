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
exports.StatusRoutes = void 0;
const express_1 = require("express");
const promises_1 = __importDefault(require("fs/promises"));
function StatusRoutes(API) {
    const router = (0, express_1.Router)();
    router.get('/', (req, res) => {
        promises_1.default.stat(API.options.root + '/settings.json')
            .then(() => promises_1.default.readFile(API.options.root + '/settings.json'))
            .then(f => JSON.parse(f.toString()))
            .then(f => (delete f.appPassword, delete f.appMail, f))
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
    router.get('/db', (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (yield API.db.getStatus())
            return res.send('UP');
        else
            return res.send('DOWN');
    }));
    return router;
}
exports.StatusRoutes = StatusRoutes;
