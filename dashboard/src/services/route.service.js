import axios from 'axios'
import { BehaviorSubject } from 'rxjs'
import authService from './auth.service'

class RouteService {

    routes = new BehaviorSubject([])
    constructor() {
        this.getRoutes()
    }

    fetchRoutes() {
        axios.get(`/core-api/routes`).then(res => {
            this.routes.next(res.data)
        })
    }

    getRoutes() {
        authService.loggedIn.subscribe(u => {
            if (u && this.routes.value.length === 0) {
                this.fetchRoutes()
            }
        })
    }

    refreshRoutes() {
        if (authService.loggedIn.value) {
            this.fetchRoutes()
        }
    }
}

export default new RouteService()