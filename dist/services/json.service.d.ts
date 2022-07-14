import API from '../index';
import { IApp } from '../types/app.interface';
export declare class JsonService {
    private api;
    constructor(api: API);
    getOrCreate(fileName: 'app.json'): Promise<IApp>;
    get(fileName: string): Promise<any>;
    create(fileName: string, object: Object): Promise<void>;
}
