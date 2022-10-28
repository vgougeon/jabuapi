import { useObservable } from "react-use"
import appService from "./services/app.service"
import App from "./App"
import Setup from "./Setup"
import Loading from "./Loading"
import authService from "./services/auth.service"
import Login from "./Login"
import { MantineProvider } from "@mantine/core"
export default function Router() {
    const state = useObservable(appService.state)
    const loggedIn = useObservable(authService.loggedIn)
    const dbStatus = useObservable(appService.dbStatus)
    const theme = useObservable(appService.theme)
    console.log({ state, loggedIn, dbStatus })
    return (
        <MantineProvider theme={{ colorScheme: theme, fontFamily: 'Inter', headings: { fontFamily: 'Inter' } }}>
            {state === "UNDEFINED" ? <Loading />
            :state === "SETUP" ? <Setup />
            :loggedIn === false ? <Login />
            :state === "MANAGE" && (dbStatus === 'DOWN' || dbStatus === null || loggedIn === null ) ? <Loading />
            :state === "MANAGE" && dbStatus === 'UP' ? <App />
            :<p>Error</p>}
        </MantineProvider>
    )
}