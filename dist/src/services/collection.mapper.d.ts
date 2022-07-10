import { IApp } from "../types/app.interface";
declare class CollectionMapper {
    constructor();
    getFieldsFromCollection(collection: IApp['collections']['name']): {
        name: string;
        options: import("../types/app.interface").IField;
    }[];
}
declare const _default: CollectionMapper;
export default _default;
