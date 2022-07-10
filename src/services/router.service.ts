import { Application, Request, Response, Router } from 'express';
import API from '../index';

export class RouterService {

    app!: Application;
    router = Router();

    constructor(private api: API) {}

    async resetRoutes() {
        console.log("Regenerating routes")
        this.router.stack = []
        this.generateRoutes(this.api.app)
    }

    async generateRoutes(app: Application) {
        const config = this.api.configService.app
        this.router.stack = []

        const collections = Object.entries(config.collections).map(([name, options]) => ({ name, options }))

        for (let collection of collections) {
            this.router.get(`/medias/:name`, this.getMedia())
            this.router.get(`/${collection.name}`, this.api.crudService.findAll(collection.name))
            this.router.get(`/${collection.name}/:id`, this.api.crudService.findOne(collection.name))
            this.router.post(`/${collection.name}`, this.api.crudService.insert(collection.name))
        }

        const authCollection = collections.find(c => !!c.options.config?.auth?.identifier)
        if (authCollection) {
            this.router.post(`/login`, this.api.authService.login(authCollection.name))
            this.router.post(`/register`, this.api.authService.register(authCollection.name))
        }

        this.router.get('/', (req, res) => res.send('OKK'))

        app.use('/api', this.router)

        return true
    }

    getMedia() {
        return (req: Request, res: Response) => {
            res.sendFile(req.params.name, { root: `${this.api.options.root}/medias/` })
        }
    }

}