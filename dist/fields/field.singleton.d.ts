import API from "..";
import { Field } from "./field.class";
export declare class Fields {
    private api;
    constructor(api: API);
    fields: Field[];
    get(name: string): Field | undefined;
}
