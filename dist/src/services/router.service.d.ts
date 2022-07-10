import { Application, Request, Response } from 'express';
import { API } from '../index';
export declare class RouterService {
    private api;
    app: Application;
    router: import("express-serve-static-core").Router;
    constructor(api: API);
    resetRoutes(): Promise<void>;
    generateRoutes(app: Application): Promise<boolean>;
    getMedia(): (req: Request, res: Response) => void;
}
