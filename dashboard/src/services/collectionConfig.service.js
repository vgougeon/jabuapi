import { BehaviorSubject } from "rxjs";

export default class CollectionConfig {

    constructor(config = {}) {
        this.config = {
            auth: {
                enabled: false,
                identifier: 'name',
                password: 'password'
            }
        }
    }

    
}