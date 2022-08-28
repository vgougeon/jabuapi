import API from "../..";
import { EAction } from "./action.enum";
export declare class Action {
    private api;
    name: EAction;
    args: any[];
    id: string;
    constructor(api: API, name: EAction, args: any[]);
}
