import { Alert, Button, Input, InputWrapper, Paper, PasswordInput, Stepper } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState } from "react";
import { useTitle } from "react-use";
import { AlertCircle, BluetoothConnected, Check, Circle, Database, HandRock, Lock, MoodHappy, Server, Square } from "tabler-icons-react";
import { z } from 'zod';

import { tap, timer } from 'rxjs'
import axios from "axios";
import appService from "./services/app.service";
import { STEPPER } from "./constants/themes";
import classNames from "classnames";
import authService from "./services/auth.service";

const schemaOne = z.object({
    name: z.string().min(1, 'App name invalid').max(32, 'App name too long'),
    mail: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password too weak'),
});

const stepClass = "max-w-[800px]"
const title = "text-2xl dark:text-white font-semibold"

export const schemaTwo = z.object({
    dbName: z.string().min(1, 'Please fill this field'),
    dbHost: z.string().min(1, 'Please fill this field'),
    dbPass: z.string(),
    dbUser: z.string().min(1, 'Please fill this field'),
    dbPort: z.string(),
});

export default function Setup() {
    useTitle('Setup / GENI API')
    const [active, setActive] = useState(0);
    const formOne = useForm({
        schema: zodResolver(schemaOne),
        initialValues: {
            name: '',
            mail: '',
            password: '',
        },
    });

    const formTwo = useForm({
        schema: zodResolver(schemaTwo),
        initialValues: {
            dbName: '',
            dbHost: '',
            dbPass: '',
            dbUser: '',
            dbPort: '',
        },
    });


    const submitStepOne = (values) => {
        setActive(1)
        console.log(values)
        console.log(formOne.validate())
    }

    const submitStepTwo = (values) => {
        setActive(2)
    }

    return (
        <div className="w-full relative min-h-screen dark:bg-gray-900 flex">
            <div className="w-[400px] h-screen bg-indigo-600 dark:bg-indigo-900 relative flex p-10 shrink-0">
                <div className="pattern h-full w-full absolute top-0 left-0 opacity-80 dark:opacity-30"></div>
                <div className="relative">
                    <Stepper classNames={STEPPER} className="h-[300px]"
                        orientation="vertical" active={active} onStepClick={setActive} breakpoint="sm" color="indigo" radius="sm">
                        <Stepper.Step label="Credentials" description="App credentials" icon={<Lock />} />
                        <Stepper.Step label="Database" description="Connect DB" icon={<Database />} />
                        <Stepper.Step label="Ready !" description="Start hacking" icon={<MoodHappy />} />
                        <Stepper.Completed />
                    </Stepper>
                </div>
            </div>
            <div className="w-full grow overflow-hidden max-h-screen relative p-14">
                <div class="flex gap-2 pb-5">
                    {[0, 1, 2].map(i =>
                        <div className={classNames('h-3 w-16 rounded-lg',
                            { 'bg-gray-100 dark:bg-gray-700': active < i },
                            { 'bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse': active >= i },
                        )}></div>
                    )}
                </div>
                <div class="relative z-10">
                    {active === 0 && <StepOne form={formOne} submit={submitStepOne} />}
                    {active === 1 && <StepTwo form={formTwo} submit={submitStepTwo} />}
                    {active === 2 && <StepThree data={{ formOne, formTwo }} />}
                    {active === 3 && <span>Completed, click back button to get to previous step</span>}
                </div>
                <Circle size="55%" className="absolute bottom-[-20%] right-[-20%] text-gray-100 dark:text-gray-800" />
                <Square size="75%" className="absolute bottom-[-20%] right-[-20%] text-gray-100 dark:text-gray-800" />
            </div>
        </div>
    )
}


const StepOne = ({ form, submit }) => {
    return (
        <div className={stepClass}>
            <form className="space-y-8 flex flex-col" onSubmit={form.onSubmit((values) => submit(values))}>
                <h1 className={title}>Application</h1>
                <InputWrapper
                    id="name"
                    required
                    label="Your application name"
                    error={form.getInputProps('name').error}
                >
                    <Input size="lg" id="name" placeholder="Application name" {...form.getInputProps('name')} />
                </InputWrapper>

                <InputWrapper
                    id="email"
                    required
                    label="Admin email address"
                    description="Will be used as credentials"
                    error={form.getInputProps('mail').error}
                >
                    <Input size="lg" id="email" placeholder="Admin email" {...form.getInputProps('mail')} />
                </InputWrapper>

                <InputWrapper
                    id="password"
                    required
                    label="Password"
                    description="Password must include at least one letter, number and special character"
                    error={form.getInputProps('password').error}
                >
                    <PasswordInput
                        size="lg"
                        id="password"
                        placeholder="Password"
                        required
                        {...form.getInputProps('password')}
                    />
                </InputWrapper>

                <Button size="md" type="submit" leftIcon={<Check size={14} />}>
                    Next step
                </Button>
            </form>
        </div>
    )
}

export const StepTwo = ({ form, submit }) => {
    const [loading, setLoading] = useState(false)
    const [failed, setFailed] = useState(false)


    const testDb = (values) => {
        setLoading(true)
        setFailed(false)
        axios.post('/core-api/setup/db-test', values).then(() => {
            console.log("DB WORKING")
            submit(values)
            setLoading(false)
        }).catch(err => {
            console.log(err)
            setLoading(false)
            setFailed(true)
        })
    }

    return (
        <div className={stepClass}>
            <form className="space-y-8 flex flex-col" onSubmit={form.onSubmit((values) => testDb(values))}>
                <h1 className={title}>Database</h1>
                {failed && <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
                    Can't connect to the database with those credentials. Make sure you typed everything correctly
                </Alert>}
                <InputWrapper
                    id="dbname"
                    required
                    label="Database name"
                    error={form.getInputProps('dbName').error}
                >
                    <Input size="lg" id="dbname" placeholder="amazing-database" {...form.getInputProps('dbName')} />
                </InputWrapper>

                <InputWrapper
                    id="dbhost"
                    required
                    label="Database host"
                    description="Database host URL"
                    error={form.getInputProps('dbHost').error}
                >
                    <Input size="lg" id="dbhost" placeholder="localhost" {...form.getInputProps('dbHost')} />
                </InputWrapper>

                <InputWrapper
                    id="dbuser"
                    required
                    label="Database username"
                    description="Database username"
                    error={form.getInputProps('dbUser').error}
                >
                    <Input size="lg" id="dbuser" placeholder="root" {...form.getInputProps('dbUser')} />
                </InputWrapper>

                <InputWrapper
                    id="dbPass"
                    required
                    label="Password"
                    description="Password must include at least one letter, number and special character"
                    error={form.getInputProps('dbPass').error}
                >
                    <PasswordInput
                        size="lg"
                        id="password"
                        placeholder="Leave blank if you're not using a password"
                        required
                        {...form.getInputProps('dbPass')}
                    />
                </InputWrapper>

                <Button size="md" loading={loading} type="submit" color="green" leftIcon={<Database size={14} />}>
                    Try to connect
                </Button>
            </form>
        </div>
    )
}

const StepThree = ({ data }) => {
    const [error, setError] = useState(false)
    const send = () => {
        setError(false)
        if (data.formOne.validate() && data.formTwo.validate()) {
            axios.post('/core-api/setup/done', {
                ...data.formOne.values,
                ...data.formTwo.values
            }).then(res => {
                if(res.headers['authorization']) {
                    authService.setToken(res.headers['authorization'])
                    authService.me()
                } 
                appService.retry()
            })
        }
        else setError(true)
    }
    return (
        <div className={stepClass}>
            <div className="space-y-8 flex flex-col">
                <h1 className={title}>Ready !</h1>
                {error && <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
                    Some fields are not valid
                </Alert>}
                <Button size="md" onClick={send} type="submit" color="green" leftIcon={<Check size={14} />}>
                    Create application
                </Button>
            </div>
        </div>
    )
}