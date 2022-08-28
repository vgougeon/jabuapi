import { EAction } from './action.enum';
import API from '../..';
import { Action } from './action';
export default class Actions {
    private api;
    constructor(api: API);
    queue: Action[];
    create(name: EAction, ...args: any): void;
    addToQueue(action: Action): Promise<void>;
    append(action: Action): Promise<void>;
}
