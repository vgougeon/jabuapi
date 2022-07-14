import { Knex } from 'knex';
import API from '../index';
export declare class Databases {
    private api;
    userDb: Knex<any> | null;
    coreDb: Knex<any>;
    userDbName: string;
    constructor(api: API);
    connectToUserDb(): Promise<boolean>;
    getStatus(): Promise<boolean>;
}
