import axios from "axios";

export class CollectionService {
    constructor() {}

    getCollectionsFromConfig(config) {
        return Object.entries(config?.collections || []).map(([name, options]) => ({ name, options }));
    }

    getFieldsFromCollection(collection) {
        return Object.entries(collection?.fields || []).map(([name, options]) => ({ name, options }));
    }

    getConfigFromCollection(collection) {
        return collection.options.config || {}
    }

    setConfigFromCollection(collection, field, value) {
        return axios.post('/core-api/collections/' + collection.name + '/setConfig', { [field]: value })
    }

    getRelationsFromConfig(config) {
        return Object.entries(config?.relations || []).map(([name, options]) => ({ name, options }));
    }

    getEnumsFromConfig(config) {
        return Object.entries(config?.enums || []).map(([name, options]) => ({ name, options }));
    }

    getRelationsFromConfigAndCollection(config, collection) {
        return Object.entries(config?.relations || [])
        .map(([name, options]) => ({ name, options }))
        .filter(relation => relation.options.leftTable === collection || relation.options.rightTable === collection);
    }

    getRelations(relations, collectionName) {
        return relations.filter(r => {
            if(r.options.leftTable === collectionName) return true;
            if(r.options.rightTable === collectionName) return true;
            else return false;
        })
    }

    getFirstReadableKey(collection) {
        if(!collection) return 'id'
        const key = this.getFieldsFromCollection(collection.options).find(c => c.options.type === 'STRING')
        if(key) return key.name
        else return 'id'
    }
}

export default new CollectionService()