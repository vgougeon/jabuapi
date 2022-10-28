import { ActionIcon, Button, Input, InputWrapper } from "@mantine/core"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Minus, Plus, Send } from "tabler-icons-react";
import { z } from "zod";
import axios from "axios";
import appService from "../../services/app.service";

export default function EnumEditor({ close }) {
    const { control, register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { values: [] },
        resolver: zodResolver(z.object({
            name: z.string().regex(/^[a-zA-Z]+$/g, 'Only letters').min(1, 'Name is empty'),
            values: z.object({ value: z.string().min(1, 'Enum values should not be empty') }).array().nonempty('Enum should have at least one value')
        }))
    })
    const { fields, append, remove } = useFieldArray({
        control,
        name: "values",
        rules: { minLength: 1 }
    });
    const submit = (values) => {
        axios.post('/core-api/enums/', { name: values.name, values: values.values.map(v => v.value)}).then(v => {
            appService.silentRetry()
            if(close) close()
        })
    }
    return (
        <form onSubmit={handleSubmit(submit)}>
            <InputWrapper required label="Enumeration name" classNames={{ label: 'dark:text-white' }} error={errors.name?.message}>
                <Input {...register('name')} classNames={{ input: 'dark:bg-gray-700 dark:text-white dark:border-gray-600' }} placeholder="Enumeration name" />
            </InputWrapper>

            <InputWrapper className="mt-2" required label="Values" classNames={{ label: 'dark:text-white' }} error={errors.values?.message}>
                <div className="grid grid-cols-1 mt-1 gap-2">
                    {fields.map((item, i) =>
                        <div className="flex items-center gap-2">
                            <Input key={item.id} {...register(`values.${i}.value`)} className="grow" invalid={errors.values?.[i]?.value?.message}
                                classNames={{ input: 'dark:bg-gray-700 dark:text-white dark:border-gray-600' }} placeholder={`Value #${i + 1}`} />
                            <ActionIcon className="shrink-0" onClick={() => remove(i)}><Minus /></ActionIcon>
                        </div>
                    )}
                    <Button variant="light" className="flex items-center justify-center" onClick={() => append({ value: '' })}><Plus /></Button>
                </div>
            </InputWrapper>
            <Button color={'dark'} leftIcon={<Send />} type="submit" className="w-full mt-2">Create</Button>
        </form>
    )
}