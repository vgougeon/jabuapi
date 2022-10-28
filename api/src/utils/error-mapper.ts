export default class ErrorMapper {
    errors: { [key: string] : string[] } = {}

    constructor() {}

    set(key: string, message: string) {
        this.errors[key] = [...this.errors[key] || [], message]
    }

    errorsFound() {
        if(Object.values(this.errors).length > 0) return true;
        return false;
    }

    getMap() { return this.errors }
}