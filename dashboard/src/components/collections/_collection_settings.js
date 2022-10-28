import { Button, InputWrapper, Paper, Select, Switch } from "@mantine/core";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CloudUpload } from "tabler-icons-react";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion";
import collectionService from "../../services/collection.service";
import axios from "axios";
import { INPUT_WRAPPER, SELECT, SWITCH } from "../../constants/themes";


export default function CollectionSettings({ selected }) {
    const conf = collectionService.getConfigFromCollection(selected)
    return (<>
        <div className="flex flex-col gap-5">
            <Auth key={selected.name} collection={selected} />
        </div>
    </>
    )
}

function Auth({ collection }) {
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(
            z.object({
                identifier: z.string('Should be a field name').min(1).optional(),
                password: z.string('Should be a password field name').min(1).optional(),
                email: z.string('Should be a field name').optional(),
                resetPasswordToken: z.string('Should be a field name').optional(),
                emailConfirmToken: z.string('Should be a field name').optional(),
                role: z.string('Should be a field name').optional(),
            })
        )
    })
    const [config, setConfig] = useState(collectionService.getConfigFromCollection(collection))
    const [enabled, setEnabled] = useState(config.auth?.enabled || false)

    useEffect(() => {
        const conf = collectionService.getConfigFromCollection(collection)
        setConfig(conf)
        setEnabled(conf.auth || false)
    }, [collection])
    const fields = collectionService.getFieldsFromCollection(collection.options)
    const save = (values) => {
        console.log(values)
        collectionService.setConfigFromCollection(collection, 'auth', values).then(() => {})
    }
    const change = (e) => {
        setEnabled(e.target.checked);
        if(!e.target.checked) collectionService.setConfigFromCollection(collection, 'auth', null).then(() => {})
    }
    return (
        <Paper className="shadow px-5 dark:bg-slate-800 dark:text-white">
            <form onSubmit={handleSubmit(save)}>
                <div className="flex justify-between py-3 gap-10">
                    <div className="flex flex-col">
                        <span className="text-sm">Use Auth</span>
                        <span className="text-xs opacity-85 font-light">Should the collection be used for authentification ?</span>
                    </div>
                    <Switch checked={enabled} classNames={SWITCH} onChange={(e) => change(e)} color={'blue'} size={'lg'}
                        onLabel="ON" offLabel="OFF" />
                </div>
                <AnimatePresence>
                    {enabled && <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                        className=" overflow-hidden">
                        <div className="mb-5 space-y-4">
                            <InputWrapper classNames={INPUT_WRAPPER} label="Identifier field" error={errors.identifier?.message}>
                                <Select
                                    placeholder="Identifier field"
                                    classNames={SELECT}
                                    defaultValue={config.auth?.identifier}
                                    {...register('identifier')}
                                    data={fields.map(f => f.name)}
                                />
                            </InputWrapper>
                            <InputWrapper classNames={INPUT_WRAPPER} label="Password field" error={errors.password?.message}>
                                <Select
                                    placeholder="Password field"
                                    classNames={SELECT}
                                    defaultValue={config.auth?.password}
                                    {...register('password')}
                                    data={fields.map(f => f.name)}
                                />
                            </InputWrapper>
                            <InputWrapper classNames={INPUT_WRAPPER} label="Email field" error={errors.email?.message}>
                                <Select
                                    placeholder="Email field"
                                    classNames={SELECT}
                                    clearable
                                    defaultValue={config.auth?.email}
                                    {...register('email')}
                                    data={fields.map(f => f.name)}
                                />
                            </InputWrapper>
                            <InputWrapper classNames={INPUT_WRAPPER} label="Role field" error={errors.role?.message}>
                                <Select
                                    placeholder="Role field"
                                    classNames={SELECT}
                                    clearable
                                    defaultValue={config.auth?.role}
                                    {...register('role')}
                                    data={fields.map(f => f.name)}
                                />
                            </InputWrapper>
                            <InputWrapper classNames={INPUT_WRAPPER} label="Reset password token field" error={errors.resetPasswordToken?.message}>
                                <Select
                                    placeholder="Reset password token field"
                                    classNames={SELECT}
                                    clearable
                                    defaultValue={config.auth?.resetPasswordToken}
                                    {...register('resetPasswordToken')}
                                    data={fields.map(f => f.name)}
                                />
                            </InputWrapper>
                            <InputWrapper classNames={INPUT_WRAPPER} label="Email confirm token field" error={errors.emailConfirmToken?.message}>
                                <Select
                                    placeholder="Email confirm token field"
                                    classNames={SELECT}
                                    clearable
                                    defaultValue={config.auth?.emailConfirmToken}
                                    {...register('emailConfirmToken')}
                                    data={fields.map(f => f.name)}
                                />
                            </InputWrapper>
                            <Button type="submit" variant="light" leftIcon={<CloudUpload />} className="mb-5 w-full">Save</Button>
                        </div>
                    </motion.div>}
                </AnimatePresence>
            </form>
        </Paper >
    )
}