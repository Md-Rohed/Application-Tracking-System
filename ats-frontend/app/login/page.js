"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api";
import { setRole, setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Label from "../components/ui/Label";
import PasswordInput from "../components/ui/PasswordInput";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import FormError from "../components/ui/FormError";



const roleOptions = [
    { value: "Applicant", label: "Applicant" },
    { value: "HR", label: "HR" },
];

export default function Login() {
    const { register, handleSubmit, control, formState: { errors }, setError } = useForm({
        defaultValues: { role: roleOptions[0] }
    });
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const mutation = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            setToken(data.token);
            setRole(data.role);
            router.push(data.role === "HR" ? "/hr/dashboard" : "/");
        },
        onError: (error) => {
            console.log("error", error?.response?.data?.error)
            setError("root", {
                type: "server",
                message: error?.response?.data?.error,
            });
        },
        onSettled: () => setSubmitting(false)
    });

    const onSubmit = (formData) => {
        setSubmitting(true);
        // react-select returns object for role; map to primitive expected by API
        const payload = {
            email: formData.email,
            password: formData.password,
            role: formData.role?.value,
        };
        mutation.mutate(payload);
    };

    console.log("error", errors)

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    <div className="relative p-6 sm:p-8">
                        <div className="mb-6 text-center">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Welcome back</h1>
                            <p className="mt-1 text-sm text-slate-300">Sign in to continue to your account</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email", { required: "Email is required" })}
                                />
                                {errors.email && <FormError>{errors.email.message}</FormError>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    placeholder="••••••••"
                                    {...register("password", { required: "Password is required" })}
                                />
                                {errors.password && <FormError>{errors.password.message}</FormError>}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Role</Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    rules={{ required: "Role is required" }}
                                    render={({ field }) => (
                                        <Select

                                            options={roleOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                        />
                                    )}
                                />
                                {errors.role && <FormError>{errors.role.message}</FormError>}
                            </div>

                            <Button type="submit" disabled={submitting || mutation.isPending} className="w-full">
                                {submitting || mutation.isPending ? (
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                                            <path d="M22 12a10 10 0 0 1-10 10" fill="currentColor" />
                                        </svg>
                                        Logging in…
                                    </span>
                                ) : (
                                    "Login"
                                )}

                                {errors.root && <FormError style="text-[1rem] font-bold" >{errors.root.message}</FormError>}

                            </Button>

                            <div className="text-center">
                                <a href="#" className="text-sm text-slate-300 hover:text-white underline underline-offset-4">Forgot your password?</a>
                            </div>
                        </form>
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-slate-400">By continuing you agree to our Terms & Privacy Policy.</p>
            </div>
        </div>
    );
}
