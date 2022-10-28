import { Autocomplete, Button, Input, Menu, Modal, ScrollArea, Title, Tooltip, ActionIcon } from "@mantine/core";
import { Outlet, Route, Routes, useLocation, useParams, useRoutes, } from "react-router";
import { useObservable, useTitle } from "react-use";
import { ArrowDown, ArrowRight, CaretDown, Check, ChevronDown, ChevronUp, CodePlus, Copy, DotsVertical, FoldDown, GitFork, Plus, Search, Trash, UserCheck } from "tabler-icons-react";
import appService from "../services/app.service";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CollectionModelizer } from "../components/collections/_collection-modelizer";
import { pascalCase } from "change-case";
import collectionService from "../services/collection.service";
import CollectionSettings from "../components/collections/_collection_settings";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import pluralize from "pluralize";
import { generateJson } from "../utils/json";
import CodeViewer from "../components/collections/_json";
import routeService from "../services/route.service";

const routes = [
    { type: 'GET', name: 'Fetch all _', url: '/api/{name}/', count: 2 },
    { type: 'GET', name: 'Fetch _', url: '/api/{name}/:id' },
    { type: 'POST', name: 'Create _', url: '/api/{name}/' },
    { type: 'PUT', name: 'Edit _', url: '/api/{name}/:id' },
    { type: 'DEL', name: 'Delete _', url: '/api/{name}/:id' },
]

const authRoutes = [
    { type: 'GET', name: 'Me', url: '/api/me/', category: 'Authentication' },
    { type: 'POST', name: 'Login', url: '/api/login/', category: 'Authentication' },
    { type: 'POST', name: 'Register', url: '/api/register/', category: 'Authentication' },
    { type: 'POST', name: 'Confirm email', url: '/api/confirm/:token', category: 'Authentication' },
]

const globalRoutes = [
    { type: 'GET', name: 'Media', url: '/api/media/:id', category: 'Medias' },
]
const typeTag = {
    GET: { color: 'bg-green-500' },
    POST: { color: 'bg-blue-500' },
    PUT: { color: 'bg-yellow-500' },
    DEL: { color: 'bg-red-500' },
}

export function TypeTag({ type }) {
    return (
        <div className={`rounded text-white font-mono text-[10px] shrink-0 w-7 h-4 flex justify-center items-center ${typeTag[type].color}`}>{type}</div>
    )
}

function ApiDocRoutes({ collection }) {
    const [selected, setSelected] = useState(0)
    const collectionsConfig = useObservable(appService.collections)
    const relations = collectionService.getRelationsFromConfigAndCollection(collectionsConfig, collection.name)
    return (<>
        <AnimateSharedLayout>
            {routes.map((route, i) =>
                <div className="w-full px-5 pl-10 flex items-center gap-2 h-10 hover:bg-blue-50 dark:hover:bg-gray-700 relative" onClick={() => setSelected(i)}>
                    <TypeTag type={route.type} />
                    <span className="text-sm">{route.name.replace('_', pluralize(collection.name, route.count || 1))}</span>
                    <div className="absolute left-6 h-full w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                    {i === selected &&
                        <motion.div layoutId="selected" className="absolute left-6 h-full w-0.5 z-10 bg-blue-400"></motion.div>}
                </div>
            )}
            {relations.map(relation => <>
                {relation.options.type === 'ASYMMETRIC' && relation.options.rightTable === collection.name && //IF MANY SIDE OF ONE TO MANY
                    <div className="w-full px-5 pl-10 flex items-center gap-2 h-10 hover:bg-blue-50 dark:hover:bg-gray-700 relative" onClick={() => setSelected(5)}>
                        <TypeTag type={'GET'} />
                        <span className="text-sm">Fetch {pluralize(relation.options.leftTable)} by {pluralize(collection.name, 1)}</span>
                        <div className="absolute left-6 h-full w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                        {5 === selected &&
                            <motion.div layoutId="selected" className="absolute left-6 h-full w-0.5 z-10 bg-blue-400"></motion.div>}
                    </div>
                }
            </>)}
        </AnimateSharedLayout>
    </>)
}

function getLink(route) {
    let r = route.url.replace(/\//g, '-').substring(1)
    if (r[r.length - 1] === '-') r = r.substring(0, r.length - 1)
    r = route.type + '_' + r
    return r
}

function getRoute(link, routes = []) {
    for (let route of routes) {
        if (link === getLink(route)) return route
    }
    return null
}

function ApiDocSidebar() {
    const params = useParams()
    const collectionsConfig = useObservable(appService.collections)
    const collections = collectionService.getCollectionsFromConfig(collectionsConfig)
    const hasAuth = collections.find(c => c.options.config?.auth?.identifier)
    const docRoutes = [...globalRoutes, ...(hasAuth ? authRoutes : [])]
    const APIRoutes = useObservable(routeService.routes)
    const selectedRoute = getRoute(params.collection, APIRoutes)
    return (
        <div className="w-[300px] overflow-hidden flex flex-col bg-zinc-50 dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 h-full shrink-0">
            <div className="border-b border-gray-200 dark:border-gray-700 h-16 w-full flex items-center px-5 shrink-0">
                <span>API Documentation</span>
            </div>
            <ScrollArea className="h-screen relative shrink-0 scroll-smooth">
                <div className="py-4">
                    <div className="px-5 py-1.5 text-sm underline tracking-wide">Functions</div>
                    <AnimateSharedLayout>
                        {Array.from(new Set((APIRoutes || []).map(route => route.category))).map(category => <>
                            <div className="px-5 overflow-hidden py-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm relative">{pascalCase(category)}</div>
                            {(APIRoutes || []).filter(route => route.category === category).map(route =>
                                <Link to={getLink(route)} className="w-full px-5 pl-10 flex items-center gap-2 h-10 hover:bg-blue-50 dark:hover:bg-gray-700 relative">
                                    <TypeTag type={route.type} />
                                    <span className="text-sm whitespace-nowrap text-ellipsis">{route.name}</span>
                                    <div className="absolute left-6 h-full w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                                    {selectedRoute === route &&
                                        <>
                                            <motion.div layoutId="selector" className="absolute left-6 h-full w-0.5 bg-blue-500 z-10"></motion.div>
                                        </>}
                                </Link>
                            )}
                        </>)}
                    </AnimateSharedLayout>
                </div>
            </ScrollArea>
        </div>
    )
}

export default function ApiDoc() {
    useTitle('Api Doc / GENI API')
    useEffect(() => {
        routeService.refreshRoutes()
    }, [])

    const route = useLocation()
    const bigScreen = route.pathname === '/api-doc/types'
    return (
        <div className="flex h-screen w-full flex-row dark:bg-gray-900">
            <ApiDocSidebar />
            <Outlet />
        </div>
    )
}

export function ApiDocDefault() {
    const params = useParams()
    const collectionsConfig = useObservable(appService.collections)
    const collections = collectionService.getCollectionsFromConfig(collectionsConfig)
    const selected = collections.find(c => c.name === params.collection)
    const APIRoutes = useObservable(routeService.routes)
    const selectedRoute = getRoute(params.collection, APIRoutes)
    const ref = useRef()
    useEffect(() => {
        if (ref.current) {
            setTimeout(() => {
                ref.current.scrollIntoView({ block: "start", behavior: 'smooth' })
            }, 200)
        }
    }, [ref.current])
    const searchArray = [
        { value: 'Export types', group: 'Actions' },
        ...Array.from(new Set((APIRoutes || []).map(route => ({ value: route.name, group: 'Endpoints' }))))
    ]
    return (
        <>
            <div className="h-screen w-full">
                <div className="w-full h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-5">
                    <Autocomplete
                        data={searchArray}
                        transition="pop-top-left"
                        transitionDuration={80}
                        variant="filled"
                        className="w-96"
                        icon={<Search size={16} />}
                        transitionTimingFunction="ease"
                        placeholder="Search something..."
                    />
                </div>
                <ScrollArea className="h-[calc(100vh-4rem)] w-full">
                    <div className="px-16 pt-8">
                        <h2 className="text-3xl font-bold">API Documentation</h2>
                        <p className="bg-slate-100 dark:bg-slate-800 rounded-sm mt-3 max-w-lg p-5">Welcome to the auto-generated <b className="text-orange-600">API</b> documentation page.
                            Here you can find a detailed list of all the endpoints generated by your app, and other helper features.</p>
                        <div className="flex gap-3 items-center py-3">
                            <Link to={'/api-doc/typescript'}>
                                <Button
                                    variant="light" leftIcon={<img src={'/typescript.svg'} className="w-6 rounded-full overflow-hidden" />}>
                                    Export types
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {Array.from(new Set((APIRoutes || []).map(route => route.category))).map(category =>
                        <div className="px-16 py-8 flex flex-col gap-5">
                            <h2 className="text-xl font-semibold">{pascalCase(category)}</h2>
                            {(APIRoutes || []).filter(route => route.category === category).map(route =>
                                <div className="flex flex-col">
                                    {/* <h3 className="text-lg">{route.name}</h3> */}

                                    <div className="bg-white dark:bg-gray-800 dark:border-gray-600 font-mono gap-2 h-12 border border-gray-200 shadow shadow-[#00000010] rounded w-full flex items-center px-4 relative">
                                        <TypeTag type={route.type} />
                                        <span className="text-slate-700 dark:text-gray-200">{route.url}</span>
                                        {selectedRoute === route && <div ref={ref} className="absolute top-[-100px]"></div>}
                                        <Link className="ml-auto" to={selectedRoute === route ? `/api-doc` : `/api-doc/${getLink(route)}`}>
                                            <ActionIcon>
                                                {selectedRoute === route ? <ChevronUp /> : <ChevronDown />}
                                            </ActionIcon>
                                        </Link>
                                    </div>
                                    <AnimatePresence>
                                        {selectedRoute === route &&
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                                className="w-full bg-gray-50 dark:bg-gray-800 overflow-hidden">
                                                <div className="p-5">
                                                    <h3 className="text-lg font-semibold">{selectedRoute.name}</h3>
                                                    <div className="w-full flex gap-3 mt-1">
                                                        <div className="h-8 rounded bg-pink-500 text-xs text-white px-3 flex items-center">
                                                            Requires authentification
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        }
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>
            <ScrollArea className="h-screen max-w-2xl w-full bg-[#121923] dark:bg-gray-800 text-white">
                <div className="p-12 flex flex-col gap-6">
                    <h2 className="text-2xl font-semibold">Request guide</h2>
                    <CodeViewer>{generateJson()}</CodeViewer>
                </div>
            </ScrollArea>
        </>
    )
}

export function ModelCollection({ selected }) {
    const fields = collectionService.getFieldsFromCollection(selected.options)
    const collectionsConfig = useObservable(appService.collections)
    const relations = collectionService.getRelationsFromConfig(collectionsConfig)
    const [popupModelizer, setPopupModelizer] = useState(false)
    const removeCollection = (name) => {
        axios.delete('/core-api/collections/' + name).then(() => appService.silentRetry())
    }
    return (
        <ScrollArea className="h-full w-full flex flex-col bg-gray-100">
            <div className="h-16 w-full border-b border-gray-200 px-5 flex items-center bg-white">
                <div className="flex flex-col justify-center">
                    <span>{pascalCase(selected.name)}</span>
                    <Link to={`/api/${selected.name}`} order={1} className="text-sm font-light underline text-blue-600 font-mono">API /{selected.name}</Link>
                </div>
                <Menu className="ml-auto" control={<Button variant="subtle" className="px-2"><DotsVertical /></Button>}>
                    <Menu.Item onClick={() => removeCollection(selected.name)}
                        color="red" icon={<Trash size={14} />}>Remove collection</Menu.Item>
                </Menu>
            </div>
            <div className="p-3">
                <div className="w-full flex gap-5">
                    <div className="w-2/3 shadow flex-shrink-0 h-fit bg-white">
                        <div className="flex items-center gap-4 p-5">
                            <Title order={4}>Model</Title>
                            <span className="px-2 py-1 bg-green-100 rounded text-xs">{fields.length} fields</span>
                            <Button size="xs" onClick={() => setPopupModelizer(true)} variant="subtle" className="ml-auto" leftIcon={<CodePlus />}>New field</Button>
                        </div>
                        <Modal
                            withCloseButton={false}
                            opened={popupModelizer}
                            onClose={() => setPopupModelizer(false)}
                            padding={0}
                            size="1100px"
                        >
                            <CollectionModelizer collection={selected} close={() => setPopupModelizer(false)} />
                        </Modal>
                        <div className="h-6 bg-gray-50 w-full text-xs text-opacity-70 items-center flex px-4 border-t border-gray-200">
                            RELATIONS
                        </div>
                    </div>
                    <div className="w-1/3 h-fit">
                        <CollectionSettings selected={selected} />
                    </div>
                </div>
            </div>
        </ScrollArea>)
}