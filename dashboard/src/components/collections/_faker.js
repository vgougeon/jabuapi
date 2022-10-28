import { Select } from "@mantine/core";
import { FakerOptions } from "../../constants/faker-options";

export default function FakerSelector({ select }) {
    return (
        <Select
            placeholder="Select a faker"
            className="custom-input"
            nothingFound="No options"
            clearable
            searchable
            onChange={(e) => select(e)}
            data={FakerOptions.map(f => ({label: f.name, value: f.category + '.' + f.name, group: f.category }))}
            // data={FakerOptions.map(f => ({label: f.name, value: f.category + '.' + f.name, group: f.category }))} 
        />
    )
}