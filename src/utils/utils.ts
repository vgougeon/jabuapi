export function toNameOptions<T>(value: { [key: string]: T }) {
    return {
        name: Object.keys(value)[0],
        options: value[Object.keys(value)[0]]
    }
}