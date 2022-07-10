import { Request, Response } from 'express';
import { API } from '../../index';
export declare class AuthService {
    private api;
    constructor(api: API);
    coreLogin(): (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    coreMe(): (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    login(collectionName: string): (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    register(collectionName: string): (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
