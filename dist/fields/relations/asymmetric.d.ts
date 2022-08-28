import { IRelation } from './../../types/app.interface';
import { Field } from "../field.class";
export declare class RelationAsymmetric extends Field {
    name: string;
    createRelation(relation: {
        name: string;
        options: IRelation;
    }): Promise<void | undefined>;
    deleteRelation(relation: {
        name: string;
        options: IRelation;
    }): Promise<void | undefined>;
    mapRelation(relation: {
        name: string;
        options: IRelation;
    }, mapped: any, error: any, context: any): Promise<void>;
}
