import { Knex, knex } from 'knex';
import { logger } from '../classes/logger';
import API from '../index';
import { IConfig } from '../types/config.interface';
export class Databases {

    userDb: Knex<any> | null = null;

    userDbName: string = '';

    constructor(private api: API) {
    }

    async connectToUserDb() {
        const appConfig = this.api.configService.config
        if(appConfig) {
                this.userDbName = appConfig.database.database;
                this.userDb = knex({
                    client: 'mysql2',
                    connection: appConfig.database
                })
                try {
                    await this.userDb.raw('SELECT 1 as isUp')
                    logger.notify('✔ - Your database is connected')
                }
                catch(err) {
                    this.userDb = null
                    logger.error(`❌ - Couldn't connect to your database`)
                    return false
                }
        }
        return true
    }

    async getStatus() {
        if(this.userDb) {
            try {
                await this.userDb?.raw('SELECT 1 as isUp')
                return true
            }
            catch(err) {
                this.userDb = null
                return false
            }
        }
        return false
        
    }

}