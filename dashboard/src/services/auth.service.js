import axios from "axios";
import { BehaviorSubject } from "rxjs";

export class AuthService {
    loggedIn = new BehaviorSubject(null)
    user = new BehaviorSubject(null)
    token = new BehaviorSubject(null)
    constructor() {
        if(localStorage.getItem('authorization')) {
            this.setToken(localStorage.getItem('authorization'))
        }
        this.me()
    }
    
    setToken(token) {
        this.token.next(token)
        localStorage.setItem('authorization', token)
        console.log("token set !")
    }

    me() {
        if(this.token.value) {
            axios.get('/core-api/me', { headers: { 'authorization': this.token.value }}).then(res => {
                axios.defaults.headers.authorization = this.token.value
                this.loggedIn.next(true)
            })
            .catch(() => {
                this.loggedIn.next(false)
            })
        } else this.loggedIn.next(false)
    }

    login(values) {
        return axios.post('/core-api/login', values).then(res => {
            console.log(res)
            this.user.next(res.data);
            this.loggedIn.next(true)
            if(res.headers['authorization']) this.setToken(res.headers['authorization'])
        })
    }
}

export default new AuthService()