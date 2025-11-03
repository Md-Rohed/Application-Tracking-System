"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { createJob, getJobsById, updateJob } from "@/lib/api";
import { getRole } from "@/lib/auth";
import Label from "@/app/components/ui/Label";
import Input from "@/app/components/ui/Input";
import MapPinIcon from "@/app/components/icon/MapPinIcon";
import FormError from "@/app/components/ui/FormError";
import Textarea from "@/app/components/ui/Textarea";
import Button from "@/app/components/ui/Button";
import Loader from "@/app/components/icon/Loader";
import BriefcaseIcon from "@/app/components/icon/BriefcaseIcon";
import TagIcon from "@/app/components/icon/TagIcon";

export default function HRDashboard() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setError,
        reset,
    } = useForm();
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Extract jobid and mode from URL query parameters
    const jobId = searchParams.get("jobid");

    console.log("job id", jobId)
    const mode = searchParams.get("mode");

    // --- Auth gate: read role on client and redirect if not HR
    const [roleChecked, setRoleChecked] = useState(false);
    const [isHR, setIsHR] = useState(false);

    useEffect(() => {
        const r = getRole();
        const ok = r === "HR";
        setIsHR(ok);
        setRoleChecked(true);
        if (!ok) router.replace("/login");
    }, [router]);

    // --- Fetch job details if in update mode
    const { data: job, isLoading: jobLoading, error: jobError } = useQuery({
        queryKey: ["job", jobId],
        queryFn: () => getJobsById(jobId),
        enabled: !!jobId && mode === "update", // Only fetch if jobId exists and mode is update
    });

    // --- Pre-fill form with job data when in update mode
    useEffect(() => {
        if (mode === "update" && job) {
            reset({
                title: job.title || "",
                location: job.location || "",
                description: job.description || "",
                keywords: job.keywords?.join(", ") || "",
                status: job.status || "Open",
            });
        }
    }, [job, mode, reset]);

    // --- Mutations
    const createMutation = useMutation({
        mutationFn: createJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            setSubmitBanner({ type: "success", msg: "Job posted successfully!" });
            reset();
        },
        onError: (error) => {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to post job";
            setSubmitBanner({ type: "error", msg: message });
            setError("root", { type: "server", message });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data) => updateJob("68bfb52b287bd8d531bd91e5", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs", jobId] });
            setSubmitBanner({ type: "success", msg: "Job updated successfully!" });
            router.push("/hr/dashboard");
        },
        onError: (error) => {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to update job";
            setSubmitBanner({ type: "error", msg: message });
            setError("root", { type: "server", message });
        },
    });

    const [submitBanner, setSubmitBanner] = useState(null);

    const onSubmit = (data) => {
        // Split keywords by comma
        const keywords = (data.keywords || "")
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);

        const payload = { ...data, keywords };

        if (mode === "update" && jobId) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    // Live “chip” preview for keywords
    const chips = useMemo(() => {
        const raw = watch("keywords") || "";
        return raw
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);
    }, [watch("keywords")]);

    // While checking role or loading job data, show themed loader
    if (!roleChecked || (mode === "update" && jobLoading)) {
        return (
            <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4 text-slate-200 flex items-center gap-3">
                    <Loader className="h-5 w-5 animate-spin" />
                    {roleChecked ? "Loading job details…" : "Checking permission…"}
                </div>
            </div>
        );
    }
    if (!isHR) return null; // Router already redirected

    // Handle job fetch error
    if (mode === "update" && jobError) {
        return (
            <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-200 px-6 py-4">
                    Error loading job: {jobError.message}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
            <div className="mx-auto w-full max-w-3xl">
                <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    <div className="relative p-6 sm:p-8">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200">
                                <BriefcaseIcon className="h-5 w-5" />
                                <span className="text-sm">HR Tools</span>
                            </div>
                            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                                {mode === "update" ? "Edit Job" : "Post a Job"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-300">
                                {mode === "update"
                                    ? "Update the job details below."
                                    : "Create a new opening and it will appear in the Jobs list immediately."}
                            </p>
                        </div>

                        {/* Submit banner */}
                        {submitBanner?.msg && (
                            <div
                                className={[
                                    "mb-5 rounded-xl border px-4 py-3 text-sm",
                                    submitBanner.type === "success"
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                        : "border-rose-500/30 bg-rose-500/10 text-rose-200",
                                ].join(" ")}
                            >
                                {submitBanner.msg}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <Label htmlFor="title">Job Title</Label>
                                <div className="relative">
                                    <Input
                                        id="title"
                                        placeholder="Senior Frontend Engineer"
                                        {...register("title", { required: "Title is required" })}
                                    />
                                </div>
                                {errors.title && <FormError>{errors.title.message}</FormError>}
                            </div>

                            {/* Location */}
                            <div className="space-y-1.5">
                                <Label htmlFor="location">Location</Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MapPinIcon className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <Input
                                        id="location"
                                        className="pl-10"
                                        placeholder="Dhaka, Bangladesh (or Remote)"
                                        {...register("location", { required: "Location is required" })}
                                    />
                                </div>
                                {errors.location && <FormError>{errors.location.message}</FormError>}
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    rows={6}
                                    placeholder="Describe responsibilities, requirements, benefits, etc."
                                    {...register("description", { required: "Description is required" })}
                                />
                                {errors.description && <FormError>{errors.description.message}</FormError>}
                            </div>

                            {/* Keywords */}
                            <div className="space-y-1.5">
                                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <TagIcon className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <Input
                                        id="keywords"
                                        className="pl-10"
                                        placeholder="JavaScript, React, Teamwork"
                                        {...register("keywords")}
                                    />
                                </div>
                                {/* Chips preview */}
                                {!!chips.length && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {chips.map((chip, idx) => (
                                            <span
                                                key={`${chip}-${idx}`}
                                                className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200"
                                            >
                                                {chip}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {errors.keywords && <FormError>{errors.keywords.message}</FormError>}
                            </div>

                            {/* Status (only for update mode) */}
                            {mode === "update" && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        {...register("status", { required: "Status is required" })}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                    {errors.status && <FormError>{errors.status.message}</FormError>}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-2 flex items-center gap-3">
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="inline-flex items-center gap-2"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? (
                                        <>
                                            <Loader className="h-4 w-4 animate-spin" />
                                            {mode === "update" ? "Updating…" : "Posting…"}
                                        </>
                                    ) : (
                                        mode === "update" ? "Update Job" : "Post Job"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        reset();
                                        if (mode === "update") {
                                            router.push("/hr/dashboard"); // Clear query params
                                        }
                                    }}
                                    className="bg-white/10 hover:bg-white/15 text-slate-100"
                                >
                                    {mode === "update" ? "Cancel" : "Clear"}
                                </Button>
                            </div>

                            {/* Top-level server error */}
                            {errors.root?.message && (
                                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm px-4 py-3">
                                    {errors.root.message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
