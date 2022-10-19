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
exports.checkFolderExists = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const logger_1 = require("../classes/logger");
function checkFolderExists(url, autoCreate = false) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield promises_1.default.stat(url);
            return true;
        }
        catch (err) {
            if (!autoCreate)
                throw new Error();
            else {
                logger_1.logger.debug(`${url} does not exist, auto creating folder`);
                return promises_1.default.mkdir(url);
            }
        }
    });
}
exports.checkFolderExists = checkFolderExists;
