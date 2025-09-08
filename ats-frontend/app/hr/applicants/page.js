"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getApplications, updateApplicationStatus, downloadResume } from "@/lib/api";
import { getRole } from "@/lib/auth";

import Badge from "@/app/components/ui/Badge";
import DownloadIcon from "@/app/components/ui/DownloadIcon";
import Select from "@/app/components/ui/Select";
import Loader from "@/app/components/icon/Loader";
import Button from "@/app/components/ui/Button";
import UserIcon from "@/app/components/icon/UserIcon";
import MailIcon from "@/app/components/icon/MailIcon";

const STATUS_OPTIONS = [
    { value: "Applied", label: "Applied" },
    { value: "Shortlisted", label: "Shortlisted" },
    { value: "Interview", label: "Interview" },
    { value: "Hired", label: "Hired" },
    { value: "Rejected", label: "Rejected" },
];

export default function Applicants() {
    const queryClient = useQueryClient();
    const router = useRouter();

    // --- HR gate (client-safe)
    const [roleChecked, setRoleChecked] = useState(false);
    const [isHR, setIsHR] = useState(false);
    useEffect(() => {
        const r = getRole();
        const ok = r === "HR";
        setIsHR(ok);
        setRoleChecked(true);
        if (!ok) router.replace("/login");
    }, [router]);

    // --- Data
    const { data: applications, isLoading, error } = useQuery({
        queryKey: ["applications"],
        queryFn: getApplications,
        enabled: roleChecked && isHR,
    });

    // --- Mutations
    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => updateApplicationStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
    });

    const handleStatusChange = (id, status) => {
        statusMutation.mutate({ id, status });
    };

    const handleDownload = async (id) => {
        try {
            const blob = await downloadResume(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `resume-${id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Error downloading resume: " + (err?.message || ""));
        }
    };

    // --- Job filter state + computed options // NEW
    const [selectedJob, setSelectedJob] = useState(null);

    // Build job options
    const jobOptions = useMemo(() => {
        if (!applications?.length) return [];
        const seen = new Map(); // id -> title
        for (const app of applications) {
            const id = app?.jobId?._id || app?.jobId || ""; // support either object or string
            const title = app?.jobId?.title || app?.jobId?.name || app?.jobTitle || "Untitled job";
            if (id) seen.set(id, title);
        }
        return [
            { value: "__ALL__", label: "All jobs" },
            ...Array.from(seen.entries()).map(([value, label]) => ({ value, label })),
        ];
    }, [applications]);


    // Pick default "All jobs" once options are available // NEW
    useEffect(() => {
        if (jobOptions.length && !selectedJob) {
            setSelectedJob(jobOptions[0]); // "__ALL__"
        }
    }, [jobOptions, selectedJob]);

    // Filtered applications based on selected job // NEW
    const filteredApplications = useMemo(() => {
        if (!applications) return [];
        if (!selectedJob || selectedJob.value === "__ALL__") return applications;
        return applications.filter((app) => {
            const jobId = app?.jobId?._id || app?.jobId || "";
            return jobId === selectedJob.value;
        });
    }, [applications, selectedJob]);

    // --- Render gates
    if (!roleChecked) {
        return (
            <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4 text-slate-200 flex items-center gap-3">
                    <Loader className="h-5 w-5 animate-spin" /> Checking permission…
                </div>
            </div>
        );
    }
    if (!isHR) return null;

    const statusToTone = (s) => {
        switch (s) {
            case "Applied":
                return "bg-white/10 text-slate-200 border-white/10";
            case "Shortlisted":
                return "bg-indigo-600/20 text-indigo-300 border-indigo-400/20";
            case "Interview":
                return "bg-amber-500/20 text-amber-200 border-amber-400/30";
            case "Hired":
                return "bg-emerald-600/20 text-emerald-200 border-emerald-400/30";
            case "Rejected":
                return "bg-rose-600/20 text-rose-200 border-rose-400/30";
            default:
                return "bg-white/10 text-slate-200 border-white/10";
        }
    };

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    <div className="relative p-6 sm:p-8">
                        {/* Header */}
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Applicants</h1>
                                <p className="mt-1 text-sm text-slate-300">Review, change status, and download resumes.</p>
                            </div>

                            {/* Right side: counts + job filter // NEW */}
                            <div className="flex items-center gap-3">
                                {applications && (
                                    <Badge className="bg-white/10 border-white/10 text-slate-200">
                                        {filteredApplications.length} shown / {applications.length} total
                                    </Badge>
                                )}

                                <div className="min-w-[220px]">
                                    <Select
                                        instanceId="job-filter"
                                        inputId="job-filter"
                                        options={jobOptions}
                                        value={selectedJob}
                                        onChange={(opt) => setSelectedJob(opt)}
                                        isClearable={false}
                                        placeholder="Filter by job…"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 px-4 py-3 text-sm">
                                {error.message}
                            </div>
                        )}

                        {/* Loading state */}
                        {isLoading ? (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-slate-300 flex items-center gap-3">
                                <Loader className="h-5 w-5 animate-spin" />
                                Loading applications…
                            </div>
                        ) : (
                            <>
                                {/* Table wrapper */}
                                <div className="overflow-hidden rounded-xl border border-white/10">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-white/10">
                                            <thead className="bg-white/5">
                                                <tr>
                                                    <Th>Name</Th>
                                                    <Th>Email</Th>
                                                    <Th>Job</Th>
                                                    <Th>Match</Th>
                                                    <Th>Status</Th>
                                                    <Th>Resume</Th>
                                                    <Th>Actions</Th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {filteredApplications.map((app) => (
                                                    <tr key={app._id} className="hover:bg-white/5">
                                                        {/* Name */}
                                                        <Td>
                                                            <div className="flex items-center gap-2 text-slate-100">
                                                                <UserIcon className="h-4 w-4 text-slate-400" />
                                                                <span className="font-medium">{app?.formData?.name || "Unknown"}</span>
                                                            </div>
                                                        </Td>

                                                        {/* Email */}
                                                        <Td>
                                                            <div className="flex items-center gap-2 text-slate-300">
                                                                <MailIcon className="h-4 w-4 text-slate-400" />
                                                                <span>{app?.formData?.email || "—"}</span>
                                                            </div>
                                                        </Td>

                                                        {/* Job */}
                                                        <Td>
                                                            <span className="text-slate-200">
                                                                {app?.jobId?.title || app?.jobId?.name || "—"}
                                                            </span>
                                                        </Td>

                                                        {/* Match % */}
                                                        <Td>
                                                            <div className="w-36">
                                                                <div className="flex items-center justify-between text-xs text-slate-400">
                                                                    <span>Fit</span>
                                                                    <span>{(app?.matchPercentage ?? 0).toFixed(0)}%</span>
                                                                </div>
                                                                <div className="mt-1 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full bg-indigo-500"
                                                                        style={{
                                                                            width: `${Math.min(
                                                                                100,
                                                                                Math.max(0, app?.matchPercentage ?? 0)
                                                                            )}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </Td>

                                                        {/* Status (react-select) */}
                                                        <Td>
                                                            <div className="min-w-[170px]">
                                                                <Select
                                                                    instanceId={`status-${app._id}`}
                                                                    inputId={`status-${app._id}`}
                                                                    options={STATUS_OPTIONS}
                                                                    value={
                                                                        STATUS_OPTIONS.find((o) => o.value === app.status) ||
                                                                        STATUS_OPTIONS[0]
                                                                    }
                                                                    onChange={(opt) => handleStatusChange(app._id, opt?.value)}
                                                                />
                                                            </div>
                                                        </Td>

                                                        {/* Resume download */}
                                                        <Td>
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleDownload(app._id)}
                                                                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-slate-100 px-3 py-2 rounded-xl"
                                                            >
                                                                <DownloadIcon className="h-4 w-4" />
                                                                PDF
                                                            </Button>
                                                        </Td>

                                                        {/* Actions / status badge mirror */}
                                                        <Td>
                                                            <span
                                                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${statusToTone(
                                                                    app.status
                                                                )}`}
                                                            >
                                                                {app.status}
                                                            </span>
                                                        </Td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Footer note */}
                                <p className="mt-4 text-xs text-slate-400">
                                    Tip: use the dropdowns to filter and update status. Changes are saved automatically.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Th({ children }) {
    return (
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
            {children}
        </th>
    );
}
function Td({ children }) {
    return <td className="px-4 py-3 align-middle">{children}</td>;
}
