import { Button, Input, InputWrapper, Title } from "@mantine/core";
import { useObservable } from "react-use";
import appService from "../services/app.service";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from "zod";
import axios from "axios";
import { ArrowBack, ArrowBarLeft, ArrowLeft, Backspace, Checks } from "tabler-icons-react";
import { useEffect } from "react";

export default function CollectionRename({ close, collection }) {
    const collectionsConfig = useObservable(appService.collections)
    const collections = Object.entries(collectionsConfig?.collections || []).map(([name, options]) => ({ name, options }));
    const { register, handleSubmit, setValue, formState: { errors, isValid, } } = useForm({
        resolver: zodResolver(z.object({
            name: z.string().min(1, 'Too small').max(20, 'Too long').regex(/^[a-z0-9_]+$/g, 'Only minuscule letters, numbers and _')
                .refine(val => !collections.map(c => c.name).includes(val), 'This collection name already exists')
        })),
        reValidateMode: 'onChange',
        mode: "onChange"
    })
    useEffect(() => {
        if(collection.name) setValue('name', collection.name)
    }, [collection])
    const submit = (values) => {
        axios.post(`/core-api/collections/${collection.name}/rename`, { name: values.name }).then(r => appService.silentRetry())
    }
    return (
        <form onSubmit={handleSubmit(submit)} className="h-full w-full space-y-4 dark:bg-gray-800 dark:text-white">
            <div className="p-10 bg-indigo-500 dark:bg-indigo-800 w-full text-white">
                <Title order={4}>Rename collection</Title>
                <span className="font-light">Use snake_case and plural for table name</span>
            </div>
            <div className="px-12 pt-2 pb-8">
                <InputWrapper
                    id="name"
                    required
                    classNames={{ 'label': 'dark:text-white'}}
                    label="Collection name"
                    description={"Use the plural form"}
                    className="w-full"
                    error={errors.name?.message}
                >
                    <Input
                    id="name" classNames={{ 'input': 'dark:bg-gray-700 dark:border-gray-500 dark:text-white'}}
                    placeholder="Collection name" {...register('name')} />
                </InputWrapper>
                <div className="flex mt-5 justify-between">
                    <Button leftIcon={<ArrowLeft />} variant="outline" onClick={close}>Cancel</Button>
                    <Button type="submit" disabled={!isValid} leftIcon={<Checks />}>Rename</Button>
                </div>

            </div>
        </form>
    )
}