import { Button } from "@mantine/core";
import axios from "axios";
import ReactFlow from "react-flow-renderer";
import { PlayCard, PlayerPlay } from "tabler-icons-react";
import { SeederGraph } from "../components/collections/_seeder";

export default function Seeder() {
    const start = () => {
        axios.post('/core-api/seeding/launch', {}, {
            onDownloadProgress: (e)=>{
                console.log(e.currentTarget.response)
            },
            
        }).then((event) => {
            console.log(event)
        })
    }
    return (
        <div className="h-screen w-full flex flex-col">
            <div className="border-b border-gray-200 dark:border-gray-700 h-16 w-full flex items-center px-5 shrink-0">
                <span>Seeding graph</span>
            </div>
            <div className="w-full top-[4.75rem] absolute flex gap-2 h-12 left-3 z-20">
                <Button variant="white" color={"green"} className="h-12 shadow focus:!shadow" onClick={start}
                leftIcon={<PlayerPlay fill="currentColor" />}>Start seeding</Button>
            </div>
            <div className="grow">
                <SeederGraph  />
            </div>
        </div>
    )
}