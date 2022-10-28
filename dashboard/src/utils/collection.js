import { getType } from "../constants/types"
import collectionService from "../services/collection.service"

export function getRequiredFields(collection) {
    if(!collection) return []
    const fields = collectionService.getFieldsFromCollection(collection.options)
    return fields.filter(f => {
        const type = getType(f.options.type)
        if(f.options.nullable === false && !type.canOmit) return true
        else return false
    })
}