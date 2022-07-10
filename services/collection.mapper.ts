import { IApp } from "../types/app.interface"

class CollectionMapper {
    constructor() {}

    getFieldsFromCollection(collection: IApp['collections']['name']) {
        return Object.entries(collection.fields).map(([name, options]) => ({name, options}))
    }

}

export default new CollectionMapper()