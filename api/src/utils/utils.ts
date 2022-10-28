import { Request } from "express";

export function toNameOptions<T>(value: { [key: string]: T }) {
    return {
        name: Object.keys(value)[0],
        options: value[Object.keys(value)[0]]
    }
}

export function sortMapper(req: Request): any[] {
    if (req.query.sort) {
        if (Array.isArray(req.query.sort)) {
            return req.query.sort
        }
        else return [req.query.sort]
    }
    return []
}