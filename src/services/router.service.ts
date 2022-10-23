import { Application, Request, Response, Router } from 'express';
import API from '../index';
import pluralize from 'pluralize';

export class RouterService {

    app!: Application;
    router = Router();
    routes: any = []

    constructor(private api: API) { }

    async resetRoutes() {
        this.generateRoutes(this.api.app)
    }

    async generateRoutes(app: Application) {
        const config = this.api.configService.app
        this.router.stack = []
        this.routes = []

        const collections = Object.entries(config.collections).map(([name, options]) => ({ name, options }))
        const relations = Object.entries(config.relations).map(([name, options]) => ({ name, options }))

        const authCollection = collections.find(c => !!c.options.config?.auth?.identifier)
        if (authCollection) {
            this.router.get(`/me`, this.api.authService.me(authCollection.name))
            this.router.post(`/login`, this.api.authService.login(authCollection.name))
            this.router.post(`/register`, this.api.authService.register(authCollection.name))

            this.routes.push({
                category: 'Authentication',
                type: 'GET',
                name: `Me`,
                url: `/api/me`
            })

            this.routes.push({
                category: 'Authentication',
                type: 'POST',
                name: `Login`,
                url: `/api/login`
            })

            this.routes.push({
                category: 'Authentication',
                type: 'POST',
                name: `Register`,
                url: `/api/register`
            })
        }

        for (let collection of collections) {
            this.router.get(`/medias/:name`, this.getMedia())
            this.router.get(`/${collection.name}`, this.api.crudService.findAll(collection.name))
            this.router.get(`/${collection.name}/:id`, this.api.crudService.findOne(collection.name))
            this.router.post(`/${collection.name}`, this.api.crudService.insert(collection.name))
            this.router.put(`/${collection.name}/:id`, this.api.crudService.update(collection.name))

            this.routes = [
                ...this.routes,
                { category: collection.name, type: 'GET', name: `Fetch all ${pluralize(collection.name)}`, url: `/api/${collection.name}/` },
                { category: collection.name, type: 'GET', name: `Fetch ${collection.name}`, url: `/api/${collection.name}/:id` },
                { category: collection.name, type: 'POST', name: `Create ${collection.name}`, url: `/api/${collection.name}/` },
                { category: collection.name, type: 'PUT', name: `Edit ${collection.name}`, url: `/api/${collection.name}/:id` },
                { category: collection.name, type: 'DEL', name: `Delete ${collection.name}`, url: `/api/${collection.name}/:id` }
            ]
        }

        for (let relation of relations) {
            if (relation.options.type === 'ASYMMETRIC') {
                console.log(`/${relation.options.rightTable}/:id/${relation.options.fieldName}`)
                this.router.get(`/${relation.options.rightTable}/:id/${relation.options.fieldName}`,
                    this.api.crudService.getRelationsAsymmetric(relation))
                this.routes.push({
                    category: relation.options.rightTable,
                    type: 'GET',
                    name: `Fetch all ${pluralize(relation.options.fieldName)} by ${relation.options.rightTable}`,
                    url: `/api/${relation.options.rightTable}/:id/${relation.options.fieldName}`
                })
            }

            if (relation.options.type === 'MANY TO MANY') {
                this.router.get(`/${relation.options.rightTable}/:id/${relation.name}`,
                    this.api.crudService.getRelationsManyToMany(relation, 'RIGHT'))
                this.routes.push({
                    category: relation.options.rightTable,
                    type: 'GET',
                    name: `Fetch all ${pluralize(relation.name)} by ${relation.options.rightTable}`,
                    url: `/api/${relation.options.rightTable}/:id/${relation.name}`
                })

                if (relation.options.leftTable !== relation.options.rightTable) {
                    this.router.get(`/${relation.options.leftTable}/:id/${relation.name}`,
                        this.api.crudService.getRelationsManyToMany(relation, 'LEFT'))
                    this.routes.push({
                        category: relation.options.leftTable,
                        type: 'GET',
                        name: `Fetch all ${pluralize(relation.name)} by ${relation.options.leftTable}`,
                        url: `/api/${relation.options.leftTable}/:id/${relation.name}`
                    })
                }
            }
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

    getRoutes() {
        return (req: Request, res: Response) => {
            return res.send(this.routes)
        }
    }

}