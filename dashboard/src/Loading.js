import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Timeline, Text, Button, InputWrapper, Input, Alert, PasswordInput } from '@mantine/core'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useForm as usf } from '@mantine/form';
import { useObservable, useTitle } from 'react-use'
import { AlertCircle, AlertOctagon, Check, Database, Dots, GitCommit, GitPullRequest, Link, Server } from 'tabler-icons-react'
import appService from './services/app.service'
import Setup, { schemaTwo, StepTwo } from './Setup'
import { useForm } from 'react-hook-form';
import authService from './services/auth.service';

function getActive(state) {
    if (state === 'UNDEFINED') return 0
    if (state !== 'UNDEFINED') return 1
    return 0
}

export function getCurrentStep({ state, error, dbStatus, app, loggedIn }) {
    if (state === 'UNDEFINED' && error) return { step: 0, error }
    if (state === 'UNDEFINED') return { step: 0 }
    else if (loggedIn === null) return { step : 1 }
    else if (loggedIn === false) return { step : 1, error: `Authentication failed` }
    else if (dbStatus === null) return { step: 2 }
    else if (dbStatus === 'DOWN') return { step: 2, error: `Database "${app?.database?.database}" can't be reached` }
    else return { step: 3 }
}

export default function Loading() {
    useTitle('Loading... / GENI API')
    const state = useObservable(appService.state)
    const app = useObservable(appService.app)
    const error = useObservable(appService.error)
    const dbStatus = useObservable(appService.dbStatus)
    const loggedIn = useObservable(authService.loggedIn)
    const step = getCurrentStep({ state, error, dbStatus, app, loggedIn })
    const getBullet = (n) => {
        if (step.step === n && step.error) return <AlertCircle color={"red"} size={18} />
        else if (step.step === n) return <Loader color="white" size={14} />
        else if (step.step <= n) return <Dots color="white" size={14} />
        else if (step.step > n) return <Check color="white" size={14} />
    }
    return (
        <div className="w-screen min-h-screen flex items-center justify-center dark:bg-slate-800">
            <div className="max-w-[400px] w-full flex flex-col justify-center items-center py-10">
                {!step.error ? <Loader color={'dark'} size="xl" /> : <AlertCircle color={'red'} size={48} />}
                <Text size='xs'>{step.error}</Text>
                {step.error && <Button variant={'filled'} color={"dark"} className='mt-10' onClick={() => appService.retry()}>Refresh status</Button>}
                <Timeline active={step.step} bulletSize={24} lineWidth={2} color={'dark'} className="mt-12">
                    <Timeline.Item bullet={getBullet(0)} title="Connect to API">
                        <Text color="dimmed" size="sm">Get <Text variant="link" component="span" inherit>API State</Text> from API</Text>
                    </Timeline.Item>
                    <Timeline.Item bullet={getBullet(1)} title="Authentification">
                        <Text color="dimmed" size="sm">Get access to the <Text variant="link" component="span" inherit>API administration</Text></Text>
                    </Timeline.Item>
                    <Timeline.Item bullet={getBullet(2)} title="Database health check">
                        <Text color="dimmed" size="sm">Check if your <Text variant="link" component="span" inherit>database</Text> is online</Text>
                        {step.step === 2 && step.error && <SetupDB />}
                    </Timeline.Item>
                    <Timeline.Item bullet={getBullet(3)} title="All good">
                        <Text color="dimmed" size="sm">Redirect to your dashboard, or <Text variant="link" component="span" inherit>setup page</Text></Text>
                    </Timeline.Item>
                </Timeline>


            </div>
        </div>
    )
}

function SetupDB() {
    const [loading, setLoading] = useState(false)
    const [failed, setFailed] = useState(false)

    const app = useObservable(appService.app)

    const editDb = (values) => {
        axios.post('/core-api/setup/edit-db', values).then(res => {
            appService.retry()
        })
    }

    const testDb = (values) => {
        setLoading(true)
        setFailed(false)
        axios.post('/core-api/setup/db-test', values).then((res) => {
            setLoading(false)
            if(res.data === 'UP') {
                editDb(values)
            }
            else {
                setFailed(true)
            }
            
        }).catch(err => {
            console.log(err)
            setLoading(false)
            setFailed(true)
        })
    }

    const form = useForm({
        schema: zodResolver(schemaTwo),
        initialValues: {
            dbName: '',
            dbHost: '',
            dbPass: '',
            dbUser: '',
            dbPort: '',
        },
    });


    useEffect(() => {
        if (app) {
            form.setValue('dbUser', app.database.user)
            form.setValue('dbName', app.database.database)
            form.setValue('dbPass', app.database.password)
            form.setValue('dbPort', app.database.port)
            form.setValue('dbHost', app.database.host)
        }
    }, [app])

    const submit = async (values) => {
        await testDb(values)
    }
    return (
        <div className="max-w-full w-[300px] p-1.5">
            <form className="space-y-8 flex flex-col" onSubmit={form.handleSubmit(submit)}>
                {failed && <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
                    Can't connect to the database with those credentials. Make sure you typed everything correctly
                </Alert>}
                <InputWrapper
                    id="dbname"
                    required
                    label="Database name"
                    error={form.register('dbName').error}
                >
                    <Input id="dbname" placeholder="amazing-database" {...form.register('dbName')} />
                </InputWrapper>

                <InputWrapper
                    id="dbhost"
                    required
                    label="Database host"
                    description="Database host URL"
                    error={form.register('dbHost').error}
                >
                    <Input id="dbhost" placeholder="localhost" {...form.register('dbHost')} />
                </InputWrapper>

                <InputWrapper
                    id="dbuser"
                    required
                    label="Database username"
                    description="Database username"
                    error={form.register('dbUser').error}
                >
                    <Input id="dbuser" placeholder="root" {...form.register('dbUser')} />
                </InputWrapper>

                <PasswordInput
                    id="dbPass"
                    placeholder="db password"
                    label="Password"
                    description="Leave blank if you're not using a password"
                    {...form.register('dbPass')}
                />

                <Button loading={loading}
                    className="mx-auto" type="submit" color="green" leftIcon={<Database size={14} />}>
                    Try to connect
                </Button>
            </form>
        </div>
    )
}