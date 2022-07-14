export interface IField {
    type: 'ID' | 'STRING' | 'INTEGER' | 'FLOAT' | 'CREATED_AT' | 'IP' | 'UPDATED_AT' | 'DATE' | 'BOOLEAN' | 'TEXT' | 'EMAIL' | 'PASSWORD' | 'RICHTEXT' | 'JSON' | 'MEDIA' | 'RELATION' | 'MANY TO ONE';
    nullable: boolean;
    unique: boolean;
    default?: string;
    relation: string;
    reference: string;
}
export interface ICollection {
    fields: {
        [name: string]: IField;
    };
    config?: {
        auth?: {
            identifier: string;
            password: string;
        };
    };
}
export interface IRelation {
    type: 'ASYMMETRIC' | 'MANY TO MANY';
    nullable: boolean;
    unique: boolean;
    leftTable: string;
    leftReference: string;
    fieldName: string;
    rightTable: string;
    rightReference: string;
}
export interface IApp {
    collections: {
        [name: string]: ICollection;
    };
    relations: {
        [name: string]: IRelation;
    };
}
