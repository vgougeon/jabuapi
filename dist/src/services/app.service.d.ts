import API from "../index";
export declare class AppService {
    private api;
    constructor(api: API);
    initDb(): Promise<boolean>;
}
