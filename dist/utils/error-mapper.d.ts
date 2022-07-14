export default class ErrorMapper {
    errors: {
        [key: string]: string[];
    };
    constructor();
    set(key: string, message: string): void;
    errorsFound(): boolean;
    getMap(): {
        [key: string]: string[];
    };
}
