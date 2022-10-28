import { zodResolver } from "@hookform/resolvers/zod"
import { ActionIcon, Button, Checkbox, Input, InputWrapper, Modal, Paper, ScrollArea, Select, Text, Title } from "@mantine/core"
import axios from "axios"
import classNames from "classnames"
import { forwardRef, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useObservable } from "react-use"
import { Checks, GitFork, Line, Link, List, MoodConfuzed, Plus } from "tabler-icons-react"
import { z } from "zod"
import { DEFAULTS } from "../../constants/defaults"
import { SELECT } from "../../constants/themes"
import { getType, TYPES } from "../../constants/types"
import appService from "../../services/app.service"
import collectionService from "../../services/collection.service"
import EnumEditor from "./_enum-editor"

export function CollectionModelizer({ collection, field, close }) {
    const [type, setType] = useState(null)
    console.log(field)
    const submit = (options) => {
        const add = {
            [options.name]: {
                type: type.name,
                ...{ ...options, name: undefined }
            }
        }
        if (!field) {
            axios.post('/core-api/collections/' + collection.name + '/add_field', add).then(() => appService.silentRetry())
                .then(() => setType(null))
        }
        else {
            axios.post('/core-api/collections/' + collection.name + '/' + field.name, add).then(() => appService.silentRetry())
                .then(close)
        }
    }
    useEffect(() => {
        if (field) setType(TYPES.find(t => t.name === field.options.type))
    }, [field])
    return (
        <>
            {!type && <SelectType setType={setType} collection={collection} />}
            {type && <FieldOptions field={field} submit={submit} cancel={() => setType(null)} type={type} collection={collection} />}
        </>
    )
}



function SelectType({ setType, collection }) {
    const categories = Array.from(new Set(TYPES.map(t => t.category)))
    return (
        <div className="flex flex-col relative dark:bg-slate-800 dark:text-white">
            <div className="grid grid-cols-3">
                <div className="col-span-2 p-4 max-h-[80vh] overflow-y-auto scroll-style">
                    <div className="flex flex-col gap-8 col-span-2">
                        {categories.map(c => <div className="flex flex-col gap-2">
                            <span className="w-fit py-1.5 px-8 relative font-light text-lg">
                                <div className="bg-gray-300 dark:bg-gray-700 w-6 h-2 rounded-full absolute left-0 top-0 bottom-0 my-auto"></div>
                                {c}
                            </span>
                            <div className="grid grid-cols-4 gap-4 col-span-2">
                                {TYPES.filter(t => t.category === c).map(type =>
                                    <Paper key={type.name} onClick={() => setType(type)}
                                        shadow="md" className="group h-38 p-3 border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white border hover:border-blue-500 cursor-pointer">
                                        <div className={classNames("flex-col w-full h-12 rounded flex items-center justify-center text-white transition-all duration-500 max-h-12 overflow-hidden group-hover:max-h-0", type.class)}>
                                            {type.icon}
                                        </div>
                                        <Title order={6} className="mt-2  font-bold font-mono relative">
                                            <span className="bg-white dark:bg-slate-700 block relative z-10 w-fit pr-2">{type.name}</span>
                                            <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 absolute top-0 bottom-0 left-0 my-auto animate-pulse"></div>
                                        </Title>
                                        <Text size="sm" className="font-mono text-xs max-h-0 overflow-hidden group-hover:max-h-12 transition-all duration-500 ">{type.description}</Text>
                                    </Paper>
                                )}
                            </div>
                        </div>)}
                    </div>
                </div>
                <ScrollArea className="w-full bg-gray-100 dark:bg-gray-900 h-full max-h-[80vh]">
                    {Object.entries(collection?.options.fields || {}).map(([name, options]) => ({ name, options })).map(field =>
                        <div key={field.name}
                            className="flex text-xs gap-4 hover:bg-blue-50 hover:dark:bg-gray-800 items-center h-14 w-full border-t last:border-b border-gray-200 dark:border-gray-700 first:border-t-0 px-4">
                            {/* {field.options.type === 'STRING' && <LetterCase className="bg-green-200 p-1 rounded" />}
                            {field.options.type === 'BOOLEAN' && <ToggleRight className="bg-blue-200 p-1 rounded" />} */}

                            <div className={classNames("w-8 h-8 p-1 flex items-center justify-center rounded text-white", getType(field.options.type).class)}>
                                {getType(field.options.type).icon}
                            </div>
                            <span className="w-full">{field.name}</span>
                        </div>
                    )}
                </ScrollArea>
            </div>

        </div>
    )
}

function FieldOptions({ type, cancel, submit, collection, field }) {
    return (
        <div className="flex flex-col dark:bg-slate-800 dark:text-white text-white">
            <div className={classNames("w-full h-24 p-1 rounded ml-auto dark:bg-opacity-50", type.class)}>
                <div className="absolute top-5 left-5">{type.icon}</div>
                <div className="absolute top-5 left-12"></div>
                <Title color="white" order={4} className="pt-10 pl-4 text-white">{type.name} - <span className="font-light">Field options</span></Title>
            </div>
            <DefaultOptions field={field} cancel={cancel} submit={submit} collection={collection} type={type} />
        </div>
    )
}

function DefaultOptions({ cancel, submit, collection, type, field }) {
    const collectionsConfig = useObservable(appService.collections)
    const collections = collectionService.getCollectionsFromConfig(collectionsConfig)
    const [references, setReferences] = useState([])
    const [leftReferences, setLeftReferences] = useState(collectionService.getFieldsFromCollection(collection.options))

    const setReferencesFields = (collectionName) => {
        const fields = collectionService.getFieldsFromCollection(collectionsConfig?.collections[collectionName])
        setReferences(fields)
    }
    const is = (...values) => {
        return values.includes(type.name)
    }
    const zObject = {
        name: z.string().regex(/^[a-zA-Z0-9]+$/g, 'Only letters and numbers'),
        nullable: z.boolean('Nullable should be a boolean'),
        unique: z.boolean('Unique should be a boolean'),
        default: z.string('Default should be string').optional(),
    }
    if (is('ENUM')) zObject.enumName = z.string().min(1, 'Enum name empty')
    if (is('RELATION', 'MANY TO MANY', 'ORDERED LIST')) zObject.leftReference = z.string().min(1, 'Select a reference field !')
    if (is('ASYMMETRIC')) zObject.fieldName = z.string().min(1, 'Select a field name')
    if (is('RELATION', 'ASYMMETRIC', 'MANY TO MANY', 'ORDERED LIST')) zObject.leftTable = z.string().min(1, 'Select a table !')
    if (is('RELATION', 'ASYMMETRIC', 'MANY TO MANY', 'ORDERED LIST')) zObject.rightTable = z.string().min(1, 'Select a table !')
    if (is('RELATION', 'ASYMMETRIC', 'MANY TO MANY', 'ORDERED LIST')) zObject.rightReference = z.string().min(1, 'Select a reference field !')
    if(is('ONE TO ONE')) {
        zObject.leftTable = z.string().min(1, 'Select a table !')
        zObject.rightTable = z.string().min(1, 'Select a table !')
        zObject.rightReference = z.string().min(1, 'Select a reference field !')
        zObject.leftReference = z.string().min(1, 'Select a reference field !')
        zObject.leftFieldName = z.string().min(1, 'Set a field name')
        zObject.rightFieldName = z.string().min(1, 'Set a field name')
    }
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        resolver: zodResolver(z.object(zObject))
    })
    const defaultValue = watch('default');
    const enums = appService.getEnums()
    const [enumEditor, setEnumEditor] = useState(false)
    return (
        <>
            <Modal
                opened={enumEditor}
                onClose={() => setEnumEditor(false)}
                title={"Enum Editor"}
            >
                <EnumEditor close={() => setEnumEditor(false)} />
            </Modal>
            <form className="flex gap-5 dark:bg-slate-800" onSubmit={handleSubmit(submit)}>
                <div className="w-3/5 p-5 pb-16 space-y-4">
                    <InputWrapper id="options-name" required label="Field name" error={errors.name?.message} classNames={{ label: 'dark:text-white' }}>
                        <Input {...register('name')} classNames={{ input: 'dark:bg-gray-700 dark:text-white dark:border-gray-600' }} id="options-name" placeholder="Field name" defaultValue={field?.name} />
                    </InputWrapper>
                    {is('ENUM') && <>
                        <div className="flex items-end w-full gap-2">
                            <Select
                                className="grow w-full"
                                icon={<List />}
                                defaultValue={field?.options.enumName}
                                label="Enumeration"
                                placeholder="Select or create Enum"
                                {...register('enumName')}
                                nothingFound={<div className="w-full h-8 flex items-center px-4 gap-2">
                                    <MoodConfuzed />
                                    <span>No enums yet. <span onClick={() => setEnumEditor(true)}
                                        className="underline text-blue-500 cursor-pointer">Create one</span></span>
                                </div>}
                                data={enums.map(e => ({ value: e.name, label: e.name }))}
                            />
                            <ActionIcon className="mb-[1px]" size={"lg"} onClick={() => setEnumEditor(true)}>
                                <Plus />
                            </ActionIcon>
                        </div>
                    </>}

                    {(is('MANY TO MANY') || is('ORDERED LIST')) && <>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <Select
                                label="Current table"
                                placeholder={collection.name}
                                classNames={SELECT}
                                data={[collection.name]}
                                icon={<Link size={16} />}
                                {...register('leftTable')}
                                error={errors.leftTable?.message}
                                required={true}
                                value={collection.name}
                                defaultValue={collection.name}
                            >
                            </Select>
                            <Select
                                disabled={leftReferences.length === 0}
                                label="Reference field from this table"
                                placeholder="Select reference field from this table (example: id)"
                                classNames={SELECT}
                                data={leftReferences.map(c => c.name)}
                                icon={<Link size={16} />}
                                {...register('leftReference')}
                                required={true}
                                error={errors.leftReference?.message}
                                defaultValue={field?.options.leftReference}
                            >
                            </Select>
                            <Select
                                label="Target table"
                                placeholder="Select target table"
                                classNames={SELECT}
                                data={collections.map(c => c.name)}
                                icon={<Line size={16} />}
                                {...register('rightTable')}
                                required={true}
                                onChange={(name) => setReferencesFields(name)}
                                error={errors.rightTable?.message}
                                defaultValue={field?.options.rightTable}
                            >
                            </Select>
                            <Select
                                disabled={references.length === 0}
                                label="Reference field from target table"
                                placeholder="Select reference field from the other table (example: id)"
                                classNames={SELECT}
                                data={references.map(c => c.name)}
                                icon={<Link size={16} />}
                                {...register('rightReference')}
                                required={true}
                                error={errors.rightReference?.message}
                                defaultValue={field?.options.rightReference}
                            >
                            </Select>
                        </div>
                    </>}
                    { //TODO: Implement same system for MANY TO MANY 
                    }
                    {(is('ONE TO ONE')) && <>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <Select
                                label="Current table"
                                placeholder={collection.name}
                                classNames={SELECT}
                                data={[collection.name]}
                                icon={<Link size={16} />}
                                {...register('leftTable')}
                                error={errors.leftTable?.message}
                                required={true}
                                value={collection.name}
                                defaultValue={collection.name}
                            >
                            </Select>
                            <Select
                                disabled={leftReferences.length === 0}
                                label="Current table reference"
                                placeholder="Select reference field from this table (example: id)"
                                classNames={SELECT}
                                data={leftReferences.map(c => c.name)}
                                icon={<Link size={16} />}
                                {...register('leftReference')}
                                required={true}
                                error={errors.leftReference?.message}
                                defaultValue={field?.options.leftReference}
                            >
                            </Select>
                            <InputWrapper label="Current table field" required={true}>
                                <Input {...register('leftFieldName')}
                                    defaultValue={field?.options.leftFieldName}
                                    placeholder="Current table field" />
                            </InputWrapper>
                            <Select
                                label="Target table"
                                placeholder="Select target table"
                                classNames={SELECT}
                                data={collections.map(c => c.name)}
                                icon={<Line size={16} />}
                                {...register('rightTable')}
                                required={true}
                                onChange={(name) => setReferencesFields(name)}
                                error={errors.rightTable?.message}
                                defaultValue={field?.options.rightTable}
                            >
                            </Select>
                            <Select
                                disabled={references.length === 0}
                                label="Target table reference"
                                placeholder="Select reference field from the other table (example: id)"
                                classNames={SELECT}
                                data={references.map(c => c.name)}
                                icon={<Link size={16} />}
                                {...register('rightReference')}
                                required={true}
                                error={errors.rightReference?.message}
                                defaultValue={field?.options.rightReference}
                            >
                            </Select>
                            <InputWrapper label="Target table field" required={true}>
                                <Input {...register('rightFieldName')}
                                    defaultValue={field?.options.rightFieldName}
                                    placeholder="Target table field" />
                            </InputWrapper>
                        </div>
                    </>}

                    {is('ASYMMETRIC') && <>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <Select
                                label="The table..."
                                placeholder={collection.name}
                                data={[collection.name]}
                                icon={<Link size={16} />}
                                classNames={SELECT}
                                {...register('leftTable')}
                                error={errors.leftTable?.message}
                                required={true}
                                value={collection.name}
                                defaultValue={collection.name}
                            >
                            </Select>
                            <Select
                                label="can have one"
                                placeholder="Select target table"
                                data={collections.map(c => c.name)}
                                icon={<Line size={16} />}
                                classNames={SELECT}
                                {...register('rightTable')}
                                required={true}
                                onChange={(name) => setReferencesFields(name)}
                                error={errors.rightTable?.message}
                                defaultValue={field?.options.rightTable}
                            >
                            </Select>
                            <InputWrapper id="fieldName" required label="using the field" classNames={{ label: 'dark:text-white' }} error={errors.fieldName?.message}>
                                <Input {...register('fieldName')} classNames={{ input: 'dark:bg-gray-700 dark:text-white dark:border-gray-600' }} id="fieldName" placeholder="Field name" defaultValue={field?.options.fieldName} />
                            </InputWrapper>
                            <Select
                                disabled={references.length === 0}
                                label="to reference the field"
                                placeholder="Select reference field from the other table (example: id)"
                                data={references.map(c => c.name)}
                                icon={<Link size={16} />}
                                classNames={SELECT}
                                {...register('rightReference')}
                                required={true}
                                error={errors.rightReference?.message}
                                defaultValue={field?.options.rightReference}
                            >
                            </Select>
                        </div>
                    </>}
                </div>
                <div className="w-2/5 bg-gray-100 p-5 pb-16 dark:bg-slate-700 dark:text-white">
                    <InputWrapper label="Basic options" classNames={{ label: 'dark:text-white' }}>
                        <Checkbox defaultChecked={field?.options.nullable} classNames={{ label: 'dark:text-white' }} id="options-nullable" label="Nullable" {...register('nullable')} className="p-2" />
                        <Checkbox defaultChecked={field?.options.unique} classNames={{ label: 'dark:text-white' }} id="options-unique" label="Unique" {...register('unique')} className="p-2" />
                    </InputWrapper>
                    <InputWrapper label="Default" classNames={{ label: 'dark:text-white' }}>
                        <Select
                            value={defaultValue}
                            defaultValue={field?.options.default}
                            placeholder="Default to..."
                            classNames={SELECT}
                            clearable
                            onChange={(value) => setValue('default', value)}
                            data={DEFAULTS}
                        />
                    </InputWrapper>
                </div>



                <Button type="submit" leftIcon={<Checks />} variant="white" className="shadow-lg absolute bottom-3 right-3">Valider</Button>
                <Button variant="light" onClick={cancel} className="absolute bottom-3 left-3">Annuler</Button>
            </form >
        </>
    )
}