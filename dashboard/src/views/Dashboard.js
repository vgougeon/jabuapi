import { Text } from "@mantine/core";
import { useTitle } from "react-use";

export default function Dashboard() {
    useTitle('Dashboard / GENI API')

    return (
        <>
            <header className="w-full relative bg-gradient-to-br from-green-800 to-blue-500 h-screen flex flex-col shadow-i">
                <img className="w-full h-full object-cover absolute top-0 left-0 opacity-20"
                    src={'/bg.jpg'} />
                <div className="h-16 w-full flex justify-around items-center text-white backdrop-blur relative shrink-0">
                    <h2 className="text-2xl font-semibold">GENI
                        <span className="font-light">API</span>
                    </h2>
                    <div className="w-1/3"></div>
                </div>
                <div className="h-[1px] w-full bg-white opacity-10 relative shrink-0"></div>
                <div className="h-full w-full flex justify-around items-center relative">
                    <div className="flex flex-col text-white">
                        <h2 className="text-4xl font-semibold ">Welcome, {' '}
                            <span className="font-normal">Vincent</span>
                        </h2>
                        <span className="font-light">Here is your API Workspace</span>
                    </div>
                    <div></div>
                </div>

                <div className="h-[1px] w-3/4 opacity-20 mx-auto flex">
                    <div className="h-full w-1/2 bg-gradient-to-r from-transparent to-white"></div>
                    <div className="h-full w-1/2 bg-gradient-to-l from-transparent to-white"></div>
                </div>

                <div className="h-16 shrink-0 relative">
                </div>
            </header>
        </>
    )
}