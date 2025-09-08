

"use client";
import { useQuery } from "@tanstack/react-query";
import { getJobs } from "@/lib/api";
import { getRole } from "@/lib/auth";
import ApplyForm from "./ApplyForm";
import BriefcaseIcon from "./icon/BriefcaseIcon";
import LocationIcon from "./icon/LocationIcon";
import Loader from "./icon/Loader";


export default function JobDetails({ jobId }) {
    const role = getRole();

    const { data: job, isLoading, error } = useQuery({
        queryKey: ["job", jobId],
        queryFn: () => getJobs(jobId),
        enabled: !!jobId,
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4 text-slate-200 flex items-center gap-3">
                    <Loader className="h-5 w-5 animate-spin" /> Loading job…
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-xl px-4 py-3 text-rose-200 max-w-lg">
                    Error: {error.message}
                </div>
            </div>
        );
    }

    if (!job) return null;

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
            <div className="mx-auto w-full max-w-4xl space-y-6">
                {/* Job header card */}
                <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    <div className="relative p-6 sm:p-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{job.title}</h1>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-slate-300">
                                    <span className="inline-flex items-center gap-2">
                                        <BriefcaseIcon className="h-5 w-5 text-slate-400" />
                                        <span className="text-slate-200 font-medium">{job.company || "Company"}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <LocationIcon className="h-5 w-5 text-slate-400" />
                                        <span>{job.location}</span>
                                    </span>
                                    {job.type && (
                                        <span className="inline-flex items-center rounded-full bg-indigo-600/20 text-indigo-300 text-xs font-medium px-3 py-1">
                                            {job.type}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {job.salary && (
                                <div className="text-right text-indigo-300 font-semibold">{job.salary}</div>
                            )}
                        </div>

                        {job.skills?.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {job.skills.map((s, i) => (
                                    <span key={`${s}-${i}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-5 text-slate-200 leading-7 whitespace-pre-line">{job.description}</div>
                    </div>
                </div>

                {/* Apply card */}
                {role === "Applicant" ? (
                    <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                        <div className="relative p-6 sm:p-8">
                            <h2 className="text-xl font-semibold text-white">Apply for this job</h2>
                            <p className="mt-1 text-sm text-slate-300">Upload your resume and share your contact details.</p>
                            <div className="mt-4">
                                <ApplyForm jobId={jobId} />
                            </div>
                        </div>
                    </div>
                ) : !role ? (
                    <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
                        <p className="text-slate-200">
                            Please <a href="/login" className="text-indigo-300 underline underline-offset-4 hover:text-indigo-200">log in</a> as an Applicant to apply.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}










