import { Box, Center, SegmentedControl } from "@mantine/core";
import { useObservable } from "react-use";
import { Code, Database } from "tabler-icons-react";
import appService from "../../services/app.service";

export default function ModeSwitcher() {
    const mode = useObservable(appService.mode)
    return (
        <SegmentedControl className="w-full rounded-none dark:bg-neutral-900"
            onChange={(e) => appService.setMode(e)}
            value={mode}
            color={'dark'}
            defaultValue={mode}
            data={[
                {
                    value: 'MODEL',
                    label: (
                        <Center>
                            <Code size={16} />
                            <Box ml={10} classNames={'dark:text-gray-200'}>Model</Box>
                        </Center>
                    ),
                },
                {
                    value: 'DATA',
                    label: (
                        <Center>
                            <Database size={16} />
                            <Box ml={10} classNames={'dark:text-gray-200'}>Data</Box>
                        </Center>
                    ),
                }
            ]}
        />
    )

}