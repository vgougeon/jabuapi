"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIProcess = void 0;
const logger_1 = require("./logger");
class APIProcess {
    constructor() {
    }
    stopProcess(...errors) {
        errors.map(error => logger_1.logger.error(error));
        logger_1.logger.debug(`Stopping process...`);
        process.exit(1);
    }
}
exports.APIProcess = APIProcess;
exports.default = new APIProcess();
