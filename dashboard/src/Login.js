import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, PasswordInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { useObservable } from "react-use";
import { ArrowForward, ArrowForwardUp, ArrowRight, Database, Lock, Mail, Shield } from "tabler-icons-react";
import { z } from "zod";
import useApiLoader from "./hooks/useApiLoader";
import appService from "./services/app.service";
import authService from "./services/auth.service";

export default function Login() {
    const app = useObservable(appService.app)
    const form = useForm({
        resolver: zodResolver(z.object({
            identifier: z.string().min(1, 'Identifier field is empty'),
            password: z.string().min(1, 'Password field is empty')
        }))
    })
    const request = useApiLoader()
    const submit = (values) => { request.request(authService.login(values)).then(() => { }) }
    return (
        <div className="w-screen h-screen relative flex">
            <div className="bg-white w-1/3 h-screen flex flex-col justify-between relative overflow-hidden shrink-0 p-12">
                <h1 className="font-bold tracking-tight text-3xl pb-8">{app?.appName}</h1>
                <form className="bg-white dark:bg-slate-800 flex flex-col gap-6" onSubmit={form.handleSubmit(submit)}>
                    <div className="flex flex-col gap-2">
                        <h2 className="font-bold tracking-tight text-2xl">Welcome back</h2>
                        <span className="text-gray-700 max-w-sm block dark:text-gray-300">Please login to your dashboard</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="font-semibold text-sm text-purple-700 dark:text-purple-400 tracking-wider uppercase">EMAIL</span>
                        <span className="text-xs text-red-500">{form.formState.errors?.identifier?.message}</span>
                        <Input icon={<Mail />} {...form.register('identifier')}
                            className="custom-input" placeholder="Account email" autoComplete="first-user-attribute" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="font-semibold text-sm text-purple-700 dark:text-purple-400 tracking-wider uppercase">PASSWORD</span>
                        <span className="text-xs text-red-500">{form.formState.errors?.password?.message}</span>
                        <PasswordInput icon={<Shield />} {...form.register('password')}
                            className="custom-input" placeholder="Password" autoComplete="do-not-complete-please-i-beg-you" />
                    </div>
                    <Button type={'submit'} className="custom-button w-fit" color={"dark"} leftIcon={request.state || <ArrowRight />}>
                        <span>Login</span>
                    </Button>
                </form>
                <span className="mt-auto">JABU API</span>
            </div>
            <div className="w-full h-screen relative bg-gradient-to-tr from-blue-500 to-pink-600">
                <img src={'/circles.svg'} className="w-full h-full object-cover absolute top-0 left-0 pointer-events-none z-0 opacity-5" />
                <div className="absolute bottom-10 left-10 text-white flex flex-col">
                    <h2 className="font-bold text-3xl"><span className="font-light">API</span> JABU</h2>
                    <span className="opacity-50">ALPHA</span>
                </div>
            </div>
        </div>
    )
}