import { logger } from "./logger"

export class APIProcess {

    constructor() {

    }

    stopProcess(...errors: string[]) {
        errors.map(error => logger.error(error))
        logger.debug(`Stopping process...`)
        process.exit(1)
    }
}

export default new APIProcess()