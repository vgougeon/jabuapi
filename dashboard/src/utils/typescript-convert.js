import { pascalCase } from "change-case"
import collectionService from "../services/collection.service"

function getType(field) {
    switch (field.options.type) {
        case 'ID':
        case 'INTEGER':
        case 'FLOAT':
            return 'number'
        case 'STRING':
        case 'TEXT':
        case 'EMAIL':
        case 'RICHTEXT':
        case 'MEDIA':
        case 'IP':
            return 'string'
        case 'PASSWORD':
            return null
        case 'DATE':
        case 'CREATED_AT':
        case 'UPDATED_AT':
            return 'Date'
        case 'BOOLEAN':
            return 'boolean'
        case 'JSON':
            return '{}'
        case 'ENUM':
            return field.options.enumName
    }
}

function getLineRelation(collection, relation) {
    if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === collection.name)
        return `\n\t${relation.options.fieldName}?: ${pascalCase(relation.options.rightTable)};`
    else if (relation.options.type === 'ASYMMETRIC' && relation.options.rightTable === collection.name)
        return `\n\t${relation.name}?: ${pascalCase(relation.options.leftTable)}[];`
    else if (relation.options.type === 'MANY TO MANY' && relation.options.leftTable === collection.name)
        return `\n\t${relation.name}?: ${pascalCase(relation.options.rightTable)}[];`
    else if (relation.options.type === 'MANY TO MANY' && relation.options.rightTable === collection.name)
        return `\n\t${relation.name}?: ${pascalCase(relation.options.leftTable)}[];`
    else return false
}

export function ConvertToTypescript(collections, relations, enums) {

    let code = `// Jabu API\n\n`
    for(let e of enums) {
        code += `export enum ${pascalCase(e.name)} {`
        for(let value of e.options.entries) {
            code += `\n\t${value} = "${value}",`
        }
        code += `\n}\n\n`
    }
    for (let collection of collections) {
        const fields = collectionService.getFieldsFromCollection(collection.options)
        code += `export interface ${pascalCase(collection.name)} {`
        for (let field of fields) {
            const type = getType(field)
            if (type) {
                code += `\n\t${field.name}: `
                code += `${type}`
                if(field.options.nullable) code += ' | null'
                code += `;`
            }
        }
        for (let relation of relations) {
            const line = getLineRelation(collection, relation)
            if (line) code += line
        }
        code += `\n}\n\n`
    }
    return code
}