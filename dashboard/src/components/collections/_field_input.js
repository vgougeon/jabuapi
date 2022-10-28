import { Checkbox, Input, Select } from "@mantine/core"
import { capitalCase, pascalCase } from "change-case"
import { getType } from "../../constants/types"
import { RichTextEditor } from '@mantine/rte';
import { DatePicker } from '@mantine/dates';
import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { File, FileUpload, Music, Photo } from "tabler-icons-react";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { INPUT } from "../../constants/themes";
import appService from "../../services/app.service";
import { useObservable } from "react-use";


export default function FieldInput({ field, register, control, setValue, watch }) {
    if (field.options.default) return null
    switch (field.options.type) {
        case 'STRING':
        case 'EMAIL':
        case 'TEXT':
            return <StringInput field={field} register={register} />
        case 'ENUM':
            return <EnumInput field={field} register={register} />
        case 'PASSWORD':
            return <PasswordInput field={field} register={register} />
        case 'RICHTEXT':
            return <RichInput field={field} setValue={setValue} watch={watch} />
        case 'DATE':
            return <DateInput field={field} register={register} control={control} setValue={setValue} watch={watch} />
        case 'BOOLEAN':
            return <BooleanInput field={field} register={register} />
        case 'INTEGER':
        case 'FLOAT':
            return <NumberInput field={field} register={register} />
        case 'MEDIA':
            return <MediaInput field={field} register={register} control={control} setValue={setValue} watch={watch} />
        default:
            return null
    }
}

export function MediaInput({ field, register, setValue, watch }) {
    const file = watch(field.name)
    const onDrop = useCallback(acceptedFiles => {
        console.log(getInputProps())
        if (acceptedFiles) setValue(field.name, acceptedFiles[0])
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    return (
        <div className="flex flex-col gap-2">
            <TypeInfo field={field} />
            <div className=""  {...getRootProps()}>
                <input {...register} {...getInputProps()} type={'file'} placeholder={capitalCase(field.name)} />
                <AnimatePresence exitBeforeEnter>
                    {!file &&
                        <motion.div key={'no-file'} initial={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -20 }}
                            className="w-full border-dashed border-gray-300 dark:border-gray-600 border-2 h-28 px-5 bg-neutral-50 dark:bg-gray-800 flex items-center 
            flex-col gap-5 hover:border-blue-400 cursor-pointer rounded-md justify-center">
                            <FileUpload size={32} className={classNames({
                                'text-blue-500': isDragActive,
                                'text-gray-500': !isDragActive
                            })} />
                            <span>{
                                isDragActive ?
                                    <p className="text-sm">Drop the files here ...</p> :
                                    <p className="text-sm">Drag 'n' drop some files here, or click to select files</p>
                            }</span>
                        </motion.div>
                    }
                    {file &&
                        <motion.div key={file.name} initial={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -20 }}
                            className="w-full border-dotted border-gray-300 dark:border-gray-600 border-2 h-28 px-5 bg-neutral-50 dark:bg-gray-800 flex items-center 
                    gap-5 hover:border-blue-400 cursor-pointer rounded-md relative">
                            {(file?.type?.includes('audio') && <Music size={28} />) ||
                                (file?.type?.includes('image') && <>
                                    <Photo size={28} />
                                    <img className="absolute right-0 top-0 h-full w-64 object-cover opacity-50" src={URL.createObjectURL(file)} />
                                    <div className="absolute right-0 top-0 h-full w-64 object-cover bg-gradient-to-l from-transparent to-gray-50"></div>
                                </>) ||
                                <File size={28} />}

                            <div className="flex flex-col justify-center relative">
                                <span className="text-lg">{file.name}</span>
                                <span className="text-sm opacity-75">{file.type}</span>
                            </div>
                        </motion.div>
                    }
                </AnimatePresence>

            </div>

        </div>
    )
}

export function NumberInput({ field, register }) {
    return (
        <div className="flex flex-col gap-2">
            <TypeInfo field={field} />
            <Input {...register}
                className="custom-input" placeholder={capitalCase(field.name)} />
        </div>
    )
}

export function StringInput({ field, register }) {
    return (
        <div className="flex flex-col gap-2">
            <TypeInfo field={field} />
            <Input {...register} classNames={INPUT}
                className="custom-input" placeholder={capitalCase(field.name)} />
        </div>
    )
}

export function EnumInput({ field, register }) {
    const collection = useObservable(appService.collections)
    const e = collection?.enums[field.options.enumName]
    if(collection && e) return (
        <div className="flex flex-col gap-2">
            <TypeInfo field={field} />
            <Select {...register} 
                data={e.entries.map(en => ({ value: en, label: en }))}
                classNames={INPUT}
                className="custom-input font-semibold" 
                placeholder={capitalCase(field.name)} />
        </div>
    )
    else return null
}

export function PasswordInput({ field, register }) {
    return (
        <div className="flex flex-col gap-2">
            <TypeInfo field={field} />
            <Input {...register} type={'password'} classNames={INPUT}
                className="custom-input" placeholder={capitalCase(field.name)} />
        </div>
    )
}

export function DateInput({ field, setValue, watch }) {
    const release = watch(field.name)
    return (
        <div className="flex flex-col gap-2">
            <TypeInfo field={field} />
            <DatePicker value={release ? new Date(release) : undefined} classNames={INPUT}
                onChange={(value) => setValue(field.name, value)} className="custom-input" placeholder={capitalCase(field.name)} />
        </div>
    )
}

export function RichInput({ field, setValue, watch }) {
    const rich = watch(field.name)
    return (
        <div className="flex flex-col gap-2">
            <TypeInfo field={field} />
            <RichTextEditor value={rich} onChange={(value) => setValue(field.name, value)} />
        </div>
    )
}

export function BooleanInput({ field, register }) {
    return (
        <div className="flex flex-col gap-2">
            <TypeInfo field={field} />
            <Checkbox label={field.name} size="md"></Checkbox>
        </div>
    )
}

export function TypeInfo({ field, register, targetTable }) {
    return (
        <div className="w-full flex items-center gap-2">

            <span className="">{pascalCase(field.name)}</span>
            <div className="flex items-center h-8 relative">
                <span className={`text-center block bg-opacity-50
                text-xs mr-2 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 pl-5 font-light`}>{field.options.type}</span>
                <div className={`${getType(field.options.type).class} w-3 h-3 absolute left-1 top-0 bottom-0 my-auto rounded-full`}></div>
            </div>
            {targetTable && <span className="text-sm opacity-75">{pascalCase(targetTable)}</span>}
        </div>

    )
}