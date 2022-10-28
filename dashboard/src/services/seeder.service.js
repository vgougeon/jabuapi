import { nanoid } from 'nanoid';
import authService from './auth.service';
import axios from 'axios'
import { BehaviorSubject } from 'rxjs';

class SeederService {
    seeding = new BehaviorSubject(null)
    createModal = new BehaviorSubject(false)
    parentId = new BehaviorSubject(null)
    constructor() {
        authService.loggedIn.subscribe(isLoggedIn => {
            if(isLoggedIn) this.getSeed()
        })
    }

    getSeed() {
        axios.get('/core-api/seeding/').then(res => {
            this.seeding.next(res.data)
        })
    }

    addSeed(id) {
        const seeding = [...this.seeding.value]
        const item = {
            id: new Date().getTime() + nanoid(),
            collection: 'test',
            payload: {}
        }
        if(!id) seeding.push(item)
        else {
            let seed = this.findSeedById(seeding, id)
            seed.children = [...(seed.children || []), item]
        }
        this.seeding.next(seeding)
    }

    findSeedById(seeding, id) {
        const recursive = (item) => {
            if(item.id === id) return item
            else if(item.children && Array.isArray(item.children)) {
                for(let child of item.children) {
                    const result = recursive(child)
                    if(result) return result
                }
            }
            return null
        }
        for(let seed of seeding) {
            const item = recursive(seed)
            if(item) return item
        }
    }

    toggleCreate(id) {
        this.parentId.next(id)
        if(id) this.createModal.next(true)
        else this.createModal.next(!this.createModal.value)
    }
}

export default new SeederService()