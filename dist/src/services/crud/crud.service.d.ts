import { Request, Response } from 'express';
import ErrorMapper from '../../utils/error-mapper';
import { UploadedFile } from 'express-fileupload';
import API from '../../index';
export declare class CrudService {
    private api;
    constructor(api: API);
    selectFields(collectionName: string, name?: string): string[];
    toJson(result: {
        [key: string]: any;
    } | {
        [key: string]: any;
    }[]): any;
    findAll(collectionName: string): (req: Request, res: Response) => Promise<void>;
    findOne(collectionName: string): (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    insert(collectionName: string): (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    saveMedia(media: UploadedFile): Promise<unknown>;
    mapBody(body: any, name: string, context?: string, options?: {
        req: Request;
        res: Response;
    }): Promise<{
        mapped: any;
        error: ErrorMapper;
    }>;
    generateDefault(type: string): string | Date;
}
