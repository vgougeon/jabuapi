import { Button, Checkbox, Divider, Input, LoadingOverlay, Menu, Modal, ScrollArea, Title } from "@mantine/core";
import { useLocation, useParams, useRoutes } from "react-router";
import { useObservable, useTitle } from "react-use";
import { ArrowRight, Check, Checks, CircleCheck, CirclePlus, CodePlus, ShieldLock, Crosshair, Disabled, Dots, DotsVertical, Edit, Filter, GitFork, Plus, Search, Settings, Trash, UserCheck, EditCircle, Pencil } from "tabler-icons-react";
import appService from "../services/app.service";
import cx from 'classnames';
import { Link } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import NewCollection from "./NewCollection";
import axios from "axios";
import { CollectionModelizer } from "../components/collections/_collection-modelizer";
import { getType } from "../constants/types";
import { pascalCase } from "change-case";
import { Merise } from "../components/collections/_merise";
import ModeSwitcher from "../components/collections/_mode_switcher";
import collectionService from "../services/collection.service";
import CollectionSettings from "../components/collections/_collection_settings";
import { AnimatePresence, motion } from 'framer-motion';
import dayjs from "dayjs";
import CollectionRename from "./CollectionRename";

function Field({ field, selected }) {
    const [loading, setLoading] = useState(false)
    const [popupModelizer, setPopupModelizer] = useState(false)
    const deleteField = (collectionName, selectedField) => {
        setLoading(true)
        switch(selectedField.options.type) {
            case 'MANY TO MANY':
            case 'ASYMMETRIC':
            case 'ONE TO ONE':
                axios.delete(`/core-api/relations/${selectedField.name}`).then(() => {
                    appService.silentRetry()
                }).catch(() => setLoading(false))
                break;
            default:
                axios.delete(`/core-api/collections/${collectionName}/${selectedField.name}`, { data: selectedField }).then(() => {
                    appService.silentRetry()
                }).catch(() => setLoading(false))
                break;
        }
        if(selectedField.options.type === '')
        axios.delete(`/core-api/collections/${collectionName}/${selectedField.name}`, { data: selectedField }).then(() => {
            appService.retry()
        }).catch(() => setLoading(false))
    }
    return (
        <div key={field.name}
            className="relative flex text-sm gap-4 hover:bg-blue-50 hover:dark:bg-gray-700 items-center h-14 w-full border-t last:border-b border-gray-200 dark:border-gray-700 px-4">
            <LoadingOverlay loaderProps={{ size: 'xs', variant: 'bars' }} visible={loading} transitionDuration={0} />
            <div className={cx("w-8 h-8 p-1 flex items-center justify-center rounded text-white", getType(field.options.type).class)}>
                {getType(field.options.type).icon}
            </div>
            <div className="flex flex-col w-1/2">
                <span className="w-1/2">{field.name}</span>
                {(field.options.type === 'MANY TO MANY')
                    && <span className="text-xs opacity-80">
                        <span>List of {selected.name === field.options.rightTable ? field.options.leftTable : field.options.rightTable}</span>
                    </span>
                }
                {(field.options.type === 'ORDERED LIST')
                    && <span className="text-xs opacity-80">
                        <span>Ordered list of {selected.name === field.options.rightTable ? field.options.leftTable : field.options.rightTable}</span>
                    </span>
                }
                {(field.options.type === 'ASYMMETRIC')
                    && <span className="text-xs opacity-80">
                        {(selected.name === field.options.leftTable) ? `Can have one ${field.options.rightTable}` : `Can have multiple ${field.options.leftTable}`}
                    </span>
                }
            </div>
            <span className="w-1/2 opacity-50">{field.options.type}</span>
            <Menu className="ml-auto">
                <Menu.Item onClick={() => setPopupModelizer(true)} icon={<Edit size={14} />}>
                    Edit {(field.options.type === 'MANY TO MANY' || field.options.type === 'ASYMMETRIC') ? 'relation' : 'field'}
                </Menu.Item>
                <Divider />
                <Menu.Item onClick={() => deleteField(selected.name, field)} color="red" icon={<Trash size={14} />}>
                    Delete {(field.options.type === 'MANY TO MANY' || field.options.type === 'ASYMMETRIC') ? 'relation' : 'field'}
                </Menu.Item>
            </Menu>
            <Modal
                withCloseButton={false}
                opened={popupModelizer}
                onClose={() => setPopupModelizer(false)}
                padding={0}
                size="1100px"
            >
                <CollectionModelizer
                    field={field}
                    collection={selected}
                    close={() => setPopupModelizer(false)} />
            </Modal>
        </div>
    )
}

export function CollectionsSidebar() {
    const params = useParams()
    const collectionsConfig = useObservable(appService.collections)
    const collections = collectionService.getCollectionsFromConfig(collectionsConfig)
    const [newPopup, setNewPopup] = useState(false)
    const mode = useObservable(appService.mode)
    return (
        <div className="w-[300px] flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 h-full shrink-0">
            <div className="border-b border-gray-200 dark:border-gray-700 h-16 w-full flex items-center px-5">
                <span>Collection Manager</span>
            </div>
            <div className="px-5 pt-4">
                {collections.map(collection =>
                    <Link to={`/collections/${collection.name}`} key={collection.name}
                        className={cx("relative px-2 border transition-all py-3 my-1 bg-white dark:bg-slate-800  rounded-sm text-sm flex items-center cursor-pointer", {
                            'border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 dark:bg-gray-900': collection.name === params.collection,
                            'border-transparent hover:border-gray-100 hover:dark:border-gray-700': collection.name !== params.collection
                        })}>
                        {collection.options.config?.auth && <UserCheck size={18} color="green" className="mr-2" />}
                        {!collection.options.config?.auth && <GitFork size={18} className="mr-2" />}

                        <span>{pascalCase(collection.name)}</span>
                        <div className="-top-2 flex items-center gap-2 absolute left-8">
                            {collection.options.config?.auth?.identifier && <span className="px-1.5 leading-none py-1 font-semibold text-[8px] bg-slate-200 rounded text-black">
                                AUTH
                            </span>}
                        </div>

                        <ArrowRight size={16} className="ml-auto" />
                    </Link>
                )}
                {mode === 'MODEL' && (
                    <Button onClick={() => setNewPopup(true)} leftIcon={<Plus />} className="w-full my-3" color={'indigo'}>New collection</Button>
                )}
                <Modal
                    withCloseButton={false}
                    opened={newPopup}
                    onClose={() => setNewPopup(false)}
                    padding={0}
                    size={'lg'}
                >
                    <NewCollection close={() => setNewPopup(false)} />
                </Modal>
            </div>
            <div className="mt-auto">
                <ModeSwitcher />
            </div>
        </div>
    )
}

export default function Collection() {
    useTitle('Collections / GENI API')
    const params = useParams()
    const collectionsConfig = useObservable(appService.collections)
    const collections = collectionService.getCollectionsFromConfig(collectionsConfig)
    const selected = collections.find(c => c.name === params.collection)
    const [newPopup, setNewPopup] = useState(false)
    const mode = useObservable(appService.mode)

    return (
        <div className="flex h-screen w-full flex-row">
            <CollectionsSidebar />
            {mode === 'MODEL' && selected && <ModelCollection selected={selected} />}
            {mode === 'DATA' && selected && <DataCollection selected={selected} />}
            {!selected && <Merise />}
        </div>
    )
}

export function ModelCollection({ selected }) {
    const fields = collectionService.getFieldsFromCollection(selected.options)
    const collectionsConfig = useObservable(appService.collections)
    const relations = collectionService.getRelationsFromConfig(collectionsConfig)
    const [popupModelizer, setPopupModelizer] = useState(false)
    const [popupRename, setPopupRename] = useState(false)
    const removeCollection = (name) => {
        axios.delete('/core-api/collections/' + name).then(() => appService.silentRetry())
    }
    return (
        <ScrollArea className="h-full w-full flex flex-col bg-gray-100 dark:bg-slate-700">
            <div className="h-16 w-full border-b border-gray-200 dark:border-gray-700 dark:bg-slate-800 px-5 flex items-center bg-white">
                <div className="flex flex-col justify-center">
                    <span>{pascalCase(selected.name)}</span>
                    <Link to={`/api/${selected.name}`} order={1} className="text-sm font-light underline text-blue-600 dark:text-blue-400 font-mono">API /{selected.name}</Link>
                </div>
                <Menu className="ml-auto" control={<Button variant="subtle" className="px-2"><DotsVertical /></Button>}>
                    <Menu.Item onClick={() => setPopupRename(true)}
                        color="blue" icon={<Pencil size={14} />}>Rename collection</Menu.Item>
                    <Menu.Item onClick={() => removeCollection(selected.name)}
                        color="red" icon={<Trash size={14} />}>Remove collection</Menu.Item>
                </Menu>
            </div>
            <div className="p-3">
                <div className="w-full flex gap-5">
                    <div className="w-2/3 shadow flex-shrink-0 h-fit bg-white dark:bg-slate-800">
                        <div className="flex items-center gap-4 p-5">
                            <Title order={4}>Model</Title>
                            <span className="px-2 py-1 bg-green-100 dark:bg-gray-900 rounded text-xs">{fields.length} fields</span>
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
                        <Modal
                            withCloseButton={false}
                            opened={popupRename}
                            padding={0}
                            size={'lg'}
                        >
                            <CollectionRename collection={selected} close={() => setPopupRename(false)} />
                        </Modal>
                        {fields.map(field => <Field field={field} selected={selected} key={field.name} />)}
                        <div className="h-6 bg-gray-50 dark:bg-slate-800 w-full text-xs text-opacity-70 items-center flex px-4 border-t border-gray-200 dark:border-gray-700">
                            RELATIONS
                        </div>
                        {collectionService.getRelations(relations, selected.name).map(field => <Field field={field} selected={selected} key={field.name} />)}
                    </div>
                    <div className="w-1/3 h-fit">
                        <CollectionSettings selected={selected} />
                    </div>
                </div>
            </div>
        </ScrollArea>)
}

export function DataCollection({ selected }) {
    const fields = collectionService.getFieldsFromCollection(selected.options)
    const [data, setData] = useState([])
    const getData = () => {
        axios.get('/api/' + selected.name).then(res => setData(res.data || []))
    }
    useEffect(() => {
        getData()
    }, [selected])
    return (
        <ScrollArea className="h-full w-full flex flex-col bg-gray-100 dark:bg-slate-900">
            <div className="h-16 w-full border-b border-gray-200 dark:border-gray-700 dark:bg-slate-800 px-5 flex items-center bg-white">
                <div className="flex flex-col justify-center">
                    <span>{pascalCase(selected.name)}</span>
                    <Link to={`/api/${selected.name}`} order={1} className="text-sm font-light underline text-blue-600 dark:text-blue-400 font-mono">API /{selected.name}</Link>
                </div>
                <Menu className="ml-auto" control={<Button variant="subtle" className="px-2"><DotsVertical /></Button>}>
                </Menu>
            </div>
            <div className="flex flex-col">
                <div className="bg-white dark:bg-gray-900 w-full">
                    <div className="w-full h-12 border-b border-gray-200 dark:border-gray-700 space-x-1 px-2 flex items-center">
                        <Input className=""
                            placeholder="Search by name" icon={<Search />} rightSection={<Settings className="text-gray-300 hover:text-blue-600 rounded-full cursor-pointer" />}></Input>
                        <Link to={`/collections/${selected.name}/insert`}>
                            <Button variant="subtle" leftIcon={<CirclePlus />}>Insert {selected.name}</Button>
                        </Link>
                        <Button variant="subtle" leftIcon={<Filter />}>Filters</Button>
                        <Button variant="subtle" leftIcon={<Dots />}>More</Button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th className="type-ID">
                                    <Checkbox />
                                </th>
                                {fields.map((field, i) =>
                                    <Fragment key={field.name}>{i < 5 && <th className={`type-${field.options.type}`}>{field.name}</th>}</Fragment>
                                )}
                                <th className="type-ID">

                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {data.map(item =>
                                    <motion.tr className="relative" key={item?.id} initial={{ opacity: 0, translateX: -30 }} animate={{ opacity: 1, translateX: 0 }}>
                                        <td className="type-ID">
                                            <Checkbox />
                                        </td>
                                        {fields.map((field, i) =>
                                            <Fragment key={field.name}>{i < 5 && <FieldTableDisplay field={field} item={item} />}</Fragment>
                                        )}
                                        <td className="type-ID w-16">
                                            <Link to={`/collections/${selected.name}/edit/${item.id}`}>
                                                <Pencil className="bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 p-2 rounded-full cursor-pointer" size={34} />
                                            </Link>
                                        </td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </ScrollArea>
    )
}

function FieldTableDisplay({ field, item }) {
    switch (field.options.type) {
        case 'MEDIA': return (<td className={`type-${field.options.type} text-center`}><img className="w-10 h-10 rounded object-cover" src={item[field.name]} /></td>);
        case 'BOOLEAN': return (<td className={`type-${field.options.type}`}><span>{item[field.name] ? 'TRUE' : 'FALSE'}</span></td>);
        case 'PASSWORD': return (<td className={`type-${field.options.type}`}>
            <span className="px-1.5 py-1 border border-dashed border-gray-300 text-gray-300 rounded text-xs flex items-center justify-center">{item[field.name] ? <ShieldLock size={22} /> : 'NULL'}</span>
        </td>);
        case 'DATE':
        case 'UPDATED_AT':
        case 'CREATED_AT': return (<td className={`type-${field.options.type}`}><span className="text-xs bg-black dark:bg-white bg-opacity-5 dark:bg-opacity-5 p-1 rounded opacity-75">{item[field.name] ? dayjs(item[field.name]).format('DD/MM/YYYY') : 'NULL'}</span></td>);
        default: return (<td className={`type-${field.options.type}`}><span>{item[field.name]}</span></td>);
    }
}