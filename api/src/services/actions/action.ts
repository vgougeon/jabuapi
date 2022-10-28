import { nanoid } from "nanoid";
import API from "../..";
import { EAction } from "./action.enum";

export class Action {
    id = new Date().getTime().toString() + nanoid()
    constructor(private api: API, public name: EAction, public args: any[]) {

    }
}