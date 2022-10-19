import fs from 'fs/promises'
import { logger } from '../classes/logger'

export async function checkFolderExists(url: string, autoCreate: boolean = false) {
    try {
        await fs.stat(url)
        return true
    } catch (err) {
        if (!autoCreate) throw new Error()
        else {
            logger.debug(`${url} does not exist, auto creating folder`)
            return fs.mkdir(url)
        }
    }
}