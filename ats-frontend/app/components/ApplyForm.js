
// ----------------------------------------
// app/components/ApplyForm.jsx
// ----------------------------------------
"use client";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { applyForJob } from "@/lib/api";
import Label from "./ui/Label";
import Input from "./ui/Input";
import MailIcon from "./icon/MailIcon";
import FormError from "./ui/FormError";
import PhoneIcon from "./icon/PhoneIcon";
import UploadIcon from "./icon/UploadIcon";
import Button from "./ui/Button";
import { useState } from "react";
import Loader from "./icon/Loader";


export default function ApplyForm({ jobId }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
        reset,
    } = useForm();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (data) => {
            const formData = new FormData();
            formData.append("jobId", jobId);
            formData.append("resume", data.resume[0]);
            formData.append(
                "formData",
                JSON.stringify({ name: data.name, email: data.email, phone: data.phone })
            );
            return applyForJob(formData, { headers: { "Content-Type": "multipart/form-data" } });
        },
        onSuccess: () => {
            setBanner({ type: "success", msg: "Application submitted!" });
            reset();
            setTimeout(() => router.push("/"), 800);
        },
        onError: (error) => {
            const message =
                error?.response?.data?.message || error?.message || "Error submitting application";
            setBanner({ type: "error", msg: message });
            setError("root", { type: "server", message });
        },
    });

    const [banner, setBanner] = useState(null);

    const onSubmit = (data) => {
        clearErrors();
        if (!data.resume?.[0]) {
            setError("resume", { type: "required", message: "Resume is required" });
            return;
        }
        const file = data.resume[0];
        if (file.type !== "application/pdf") {
            setError("resume", { type: "validate", message: "Only PDF files are allowed" });
            return;
        }
        mutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Banner */}
            {banner?.msg && (
                <div
                    className={`rounded-xl border px-4 py-3 text-sm ${banner.type === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                        }`}
                >
                    {banner.msg}
                </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...register("name", { required: "Name is required" })} />
                {errors.name && <FormError>{errors.name.message}</FormError>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MailIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        placeholder="you@example.com"
                        {...register("email", { required: "Email is required" })}
                    />
                </div>
                {errors.email && <FormError>{errors.email.message}</FormError>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <PhoneIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                        id="phone"
                        className="pl-10"
                        placeholder="+880 1XXX-XXXXXX"
                        {...register("phone", { required: "Phone is required" })}
                    />
                </div>
                {errors.phone && <FormError>{errors.phone.message}</FormError>}
            </div>

            {/* Resume */}
            <div className="space-y-1.5">
                <Label htmlFor="resume">Resume (PDF only)</Label>
                <label
                    htmlFor="resume"
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-slate-200 hover:bg-slate-900/50 focus-within:ring-2 focus-within:ring-indigo-500"
                >
                    <span className="inline-flex items-center gap-2 text-sm">
                        <UploadIcon className="h-4 w-4 text-slate-400" />
                        Choose file
                    </span>
                    <span className="text-xs text-slate-400">PDF, max 5MB</span>
                    <input
                        id="resume"
                        type="file"
                        accept="application/pdf"
                        className="sr-only"
                        {...register("resume", { required: "Resume is required" })}
                    />
                </label>
                {errors.resume && <FormError>{errors.resume.message}</FormError>}
            </div>

            {/* Submit */}
            <div className="pt-2">
                <Button type="submit" disabled={mutation.isPending} className="inline-flex items-center gap-2">
                    {mutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}
                    {mutation.isPending ? "Submitting…" : "Apply"}
                </Button>
            </div>

            {/* Root server error */}
            {errors.root?.message && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm px-4 py-3">
                    {errors.root.message}
                </div>
            )}
        </form>
    );
}
