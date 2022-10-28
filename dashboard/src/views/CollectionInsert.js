import { Button, Loader, ScrollArea } from "@mantine/core";
import { useParams } from "react-router";
import { useObservable } from "react-use";
import FieldInput from "../components/collections/_field_input";
import appService from "../services/app.service";
import collectionService from "../services/collection.service";
import { CollectionsSidebar } from "./Collections";
import { useForm } from 'react-hook-form';
import axios from "axios";
import useApiLoader, { ApiLoaderState } from "../hooks/useApiLoader";
import RelationInput from "../components/collections/_relation_input";
import { useEffect } from "react";

export default function CollectionInsert() {
    const params = useParams()
    const collectionsConfig = useObservable(appService.collections)
    const collections = collectionService.getCollectionsFromConfig(collectionsConfig)
    const relations = collectionService.getRelationsFromConfigAndCollection(collectionsConfig, params.collection)
    const selected = collections.find(c => c.name === params.collection)
    const fields = collectionService.getFieldsFromCollection(selected?.options)
    const submitRequest = useApiLoader()
    const { register, handleSubmit, setValue, control, watch } = useForm()

    useEffect(() => {
        if(params.id) {
            axios.get(`/api/${params.collection}/${params.id}`).then(res => {
                console.log(res.data)
                for(let key in res.data) {
                    setValue(key, res.data[key])
                }
            })
        }
    }, [params])

    const submit = async (values) => {
        console.log("BUILDING FORM FROM : ", values)
        const formData = new FormData();
        for (let key in values) {
            if (values[key] !== undefined) {
                if(Array.isArray(values[key])) {
                    for(let item of values[key]) {
                        formData.append(`${key}[]`, item)
                    }
                }
                else formData.append(key, values[key])
            } 
        }
        if(params.id) {
            const request = axios.put(`/api/${selected.name}/${params.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            await submitRequest.request(request)
        }
        else {
            const request = axios.post('/api/' + selected.name, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            await submitRequest.request(request)
        }
        
        
    }

    if (selected) return (
        <div className="flex h-screen w-full flex-row dark:bg-gray-900">
            <CollectionsSidebar />
            <div className="w-full h-screen flex flex-col">
                <div className="w-full h-16 border-b border-gray-200 dark:border-gray-700 dark:bg-slate-800 px-5 items-center flex shrink-0">
                    Inserting {selected.name}
                </div>
                <ScrollArea className="w-2/3 flex-grow border-gray-200 dark:border-gray-700 border-double border-4">
                    <div className="p-20">
                        <h2 className="text-xl">Create new {selected.name}</h2>
                        <form onSubmit={handleSubmit(submit)} className="flex flex-col space-y-4 pl-3 my-5 py-2">
                            {fields?.map(field =>
                                <FieldInput key={field.name} field={field} register={register(field.name)} control={control} setValue={setValue} watch={watch} />
                            )}
                            {relations?.map(relation =>
                                <RelationInput key={relation.name} collection={selected} relation={relation} register={register} control={control} setValue={setValue} watch={watch} />
                            )}
                            <Button type="submit" className="w-fit flex">
                                <ApiLoaderState request={submitRequest} className={'mr-3'}></ApiLoaderState>
                                Submit
                            </Button>
                        </form>
                    </div>
                </ScrollArea>
            </div>

        </div>
    )
    else return null
}