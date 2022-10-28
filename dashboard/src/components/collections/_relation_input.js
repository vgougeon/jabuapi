import { MultiSelect, Select } from "@mantine/core";
import { useEffect, useState } from "react";
import { useObservable } from "react-use";
import { SELECT } from "../../constants/themes";
import useApiLoader, { ApiLoaderState } from "../../hooks/useApiLoader";
import apiService from "../../services/api.service";
import appService from "../../services/app.service";
import collectionService from "../../services/collection.service";
import { TypeInfo } from "./_field_input";


export default function RelationInput(props) {
    const relation = props.relation
    if (relation.options.type === 'MANY TO MANY') return <ManyToMany {...props} />
    if (relation.options.type === 'ASYMMETRIC') {
        if (relation.options.leftTable === props.collection.name) return <LeftAsymmetric {...props} />
        else return null
    }
    return null
}

export function ManyToMany({ collection, relation, register, control, setValue, watch }) {
    const [data, setData] = useState([])
    const value = watch(relation.name)
    const collectionsConfig = useObservable(appService.collections)
    const collections = collectionService.getCollectionsFromConfig(collectionsConfig)
    const target = collection.name === relation.options.leftTable ? relation.options.rightTable : relation.options.leftTable
    const labelKey = collectionService.getFirstReadableKey(collections.find(c => c.name === target))
    const search = useApiLoader(24, 'black')
    const get = async () => {
        const res = await search.request(apiService.get(target))
        if (Array.isArray(res.data)) setData(res.data)
    }
    useEffect(() => {
        get()
    }, [])
    return (<div className="flex flex-col gap-2 relative">
        <div className="absolute right-0 top-2 opacity-25">
            <ApiLoaderState request={search} />
        </div>
        <TypeInfo field={relation} targetTable={collection.name === relation.options.leftTable ? relation.options.rightTable : relation.options.leftTable} />
        <MultiSelect
            value={value}
            onChange={(v) => { setValue(relation.name, v) }}
            data={data.map(d => ({ value: d.id, label: d[labelKey] || d.id }))}
            placeholder="Select items"
            classNames={SELECT}
            className="custom-input"
            searchable
            creatable
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => {
                const item = { value: query, label: query };
                setData((current) => [...current, item]);
                return item;
            }}
        />
    </div>
    )
}

export function LeftAsymmetric({ collection, relation, register, control, setValue, watch }) {
    const searchField = 'name'
    const value = watch(relation.options.fieldName)
    const collectionsConfig = useObservable(appService.collections)
    const collections = collectionService.getCollectionsFromConfig(collectionsConfig)
    const labelKey = collectionService.getFirstReadableKey(collections.find(c => c.name === relation.options.rightTable))
    const search = useApiLoader(24, 'black')
    const [items, setItems] = useState([])
    const get = async () => {
        let table = relation.options.leftTable
        if (relation.options.leftTable === collection.name) table = relation.options.rightTable
        const res = await search.request(apiService.get(table))
        if (Array.isArray(res.data)) setItems(res.data)
    }
    useEffect(() => {
        get()
    }, [])
    return (
        <div className="flex flex-col gap-2 relative">
            <div className="absolute right-0 top-2 opacity-25">
                <ApiLoaderState request={search} />
            </div>
            <TypeInfo field={relation} />
            <Select
                value={value}
                onChange={(v) => { setValue(relation.options.fieldName, v) }}
                classNames={SELECT}
                className="custom-input"
                placeholder="Pick one"
                clearable
                data={items.map(i => ({ value: i.id, label: i[labelKey] || i.id }))}
            />
        </div>
    )
}