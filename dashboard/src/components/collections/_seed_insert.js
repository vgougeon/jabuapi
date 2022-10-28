import { Button, Input, Select } from "@mantine/core"
import axios from "axios"
import { pascalCase } from "change-case"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useObservable } from "react-use"
import { RowInsertTop } from "tabler-icons-react"
import appService from "../../services/app.service"
import collectionService from "../../services/collection.service"
import seederService from "../../services/seeder.service"
import { getRequiredFields } from "../../utils/collection"
import FakerSelector from "./_faker"
import FieldInput from "./_field_input"

export default function NewSeed() {
    const form = useForm()
    const { unregister, register, handleSubmit, watch, setValue, formState: { errors }, getValues } = form
    const selectedCollectionName = watch('collection')
    console.log(selectedCollectionName)
    const config = useObservable(appService.collections)
    const collections = collectionService.getCollectionsFromConfig(config)
    const required = (getRequiredFields(collections.find(c => c.name === selectedCollectionName)) || []).map(field => {
        field.name = 'payload.' + field.name
        return field
    })
    const submit = (values) => {
        axios.post('/core-api/seeding/', values).then(() => {
            seederService.getSeed()
        })
    }
    const selectFaker = (value, field) => {
        const currentvalue = getValues(field.name)
        if (value) setValue(field.name, `${currentvalue}{{ ${value} }}`)
    }
    useEffect(() => {
        unregister('payload')
    }, [selectedCollectionName])
    return (
        <div className="w-screen max-w-5xl">
            <div className="w-full bg-gray-100 p-8">
                <span className="text-2xl font-bold">Create a new seeder</span>
            </div>
            <form className="p-5 flex flex-col gap-6" onSubmit={handleSubmit(submit)}>
                <div className="w-full grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-4 col-span-2">
                        <span className="text-sm">Entity to generate</span>
                        <Select
                            placeholder="Select a collection"
                            nothingFound="No options"
                            className="custom-input"
                            // error={errors.collection}
                            clearable
                            searchable
                            onChange={(e) => setValue('collection', e)}
                            data={collections.map(c => ({ label: pascalCase(c.name), value: c.name }))}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <span className="text-sm">Quantity</span>
                        <Input
                            placeholder="Quantity"
                            type={"number"}
                            className="custom-input"
                            defaultValue={1}
                            icon={<RowInsertTop />}
                            {...register('quantity')}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-sm">Required fields :</span>
                    {required.map(req =>
                        <div className="flex items-end gap-4">
                            <div className="w-2/3">
                                <FieldInput {...form} register={register(req.name)} field={req} />
                            </div>
                            <div className="w-1/3">
                                <FakerSelector select={(value) => selectFaker(value, req)} />
                            </div>
                        </div>
                    )}
                </div>
                <Button size="md" className="w-full" type={"submit"}>Add seeder</Button>
            </form>

        </div>
    )
}