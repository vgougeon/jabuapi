export interface IField {
    type: 'ID' | 'STRING' | 'INTEGER' | 'FLOAT' | 'CREATED_AT' | 
    'IP' | 'UPDATED_AT' | 'DATE' | 'BOOLEAN' | 'TEXT' | 'EMAIL' |
     'PASSWORD' | 'RICHTEXT' | 'JSON' | 'MEDIA' | 'ENUM'
    nullable?: boolean;
    unique?: boolean;
    default?: string;
    relation?: string;
    reference?: string;
    enumName?: string;
}

export interface ICollection {
    fields: {
        [name: string]: IField
    }
    config?: {
        auth?: {
            identifier: string;
            password: string;
        }
    }
}

export interface IRelation {
    type: 'ASYMMETRIC' | 'MANY TO MANY' | 'ORDERED LIST' | 'ONE TO ONE';
    nullable: boolean;
    unique: boolean;
    leftTable: string;
    leftReference: string;
    leftFieldName: string;
    fieldName: string;
    rightTable: string;
    rightReference: string;
    rightFieldName: string;
}

export interface IEnum {
    entries: string[],
    type?: 'ROLE'
}

export interface IApp {
    collections: {
        [name: string]: ICollection
    }
    relations: {
        [name: string]: IRelation
    },
    enums: {
        [name: string]: IEnum
    }
}