import { Field } from "./field.class";
export declare abstract class FieldSingleton {
    static fields: Field[];
    static get(name: string): Field | undefined;
}
