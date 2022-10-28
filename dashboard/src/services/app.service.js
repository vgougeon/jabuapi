import axios from "axios";
import { BehaviorSubject } from "rxjs";

class AppService {
    state = new BehaviorSubject('UNDEFINED');
    error = new BehaviorSubject(null);
    app = new BehaviorSubject(null);
    collections = new BehaviorSubject(null);
    mode = new BehaviorSubject('MODEL');
    dbStatus = new BehaviorSubject(null);
    theme = new BehaviorSubject(document.querySelector('body').classList.contains('dark') ? 'dark' : 'light');

    constructor() {
        this.retry()
    }

    toggleTheme() {
        console.log("hello")
        const to = this.theme.value === 'dark' ? 'light' : 'dark'
        if(to === 'light') document.querySelector('body').classList.remove('dark')
        else document.querySelector('body').classList.add('dark')
        this.theme.next(to)
    }

    setMode(mode) {
        this.mode.next(mode)
    }

    async getDbStatus() {
        await axios.get('/core-api/status/db').then(async state => {
            this.dbStatus.next(state.data)
        })
            .catch(err => {
                this.dbStatus.next('DOWN')
            })
    }

    async getStatus() {
        this.error.next(null)
        await axios.get('/core-api/status')
            .then(async state => {
                console.log(state.data)
                if (state.data === 'NO DATA') this.state.next('SETUP')
                else {
                    this.app.next(state.data)
                    if (!state.data.appName) this.state.next('SETUP')
                    else this.state.next('MANAGE')
                }
            })
            .catch(err => {
                this.error.next('STATUS_REQUEST_FAILED')
            })
    }

    getCollections() {
        axios.get('/core-api/collections').then(async result => this.collections.next(result.data))
    }

    getEnums() {
        if(!this.collections.value.enums) return []
        return Object.entries(this.collections.value.enums).map(([name, options]) => ({name, options}))
    }

    async retry() {
        this.state.next('UNDEFINED')
        this.error.next(null)
        this.app.next(null)
        this.dbStatus.next(null)
        await this.getStatus()
        await this.getDbStatus()
        this.getCollections()
    }

    silentRetry() {
        this.getStatus()
        this.getDbStatus()
        this.getCollections()
    }
}

export default new AppService();