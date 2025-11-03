import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { getRole } from "@/lib/auth";
import LocationIcon from "./icon/LocationIcon";
import SalaryIcon from "./icon/SalaryIcon";
import BookmarkIcon from "./icon/BookmarkIcon";
import ArrowRightIcon from "./icon/ArrowRightIcon";
import ShareButtons from "./ui/ShareButton";



export default function JobCard({ job }) {
    const {
        _id,
        title = "Untitled Position",
        location = "Location not specified",
        type,
        salary,
        company,
        description = "",
        createdAt,
        skills = [],
    } = job;

    const postedDate = createdAt
        ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
        : "Recently";

    const router = useRouter();
    const role = getRole();

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow hover:shadow-lg hover:bg-white/10 transition">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-white hover:text-indigo-400 transition">
                        <Link href={`/job/${_id}`}>{title}</Link>
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                        {company && (
                            <span className="inline-flex items-center gap-1">
                                <CompanyIcon className="h-4 w-4 text-slate-400" />
                                {company}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                            <LocationIcon className="h-4 w-4 text-slate-400" />
                            {location}
                        </span>
                        {salary && (
                            <span className="inline-flex items-center gap-1">
                                <SalaryIcon className="h-4 w-4 text-slate-400" />
                                {salary}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-row md:flex-col items-start md:items-end gap-2">
                    {type && (
                        <span className="rounded-full bg-indigo-600/20 text-indigo-300 text-xs font-medium px-3 py-1">
                            {type}
                        </span>
                    )}
                    <span className="text-xs text-slate-400">Posted {postedDate}</span>
                </div>
            </div>

            <p className="mt-3 text-slate-300 text-sm line-clamp-3">
                {description.substring(0, 180)}
                {description.length > 180 && "..."}
            </p>

            {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                        <span
                            key={idx}
                            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-5 flex justify-between items-center">
                <button className="inline-flex items-center text-sm text-slate-300 hover:text-white transition">
                    <BookmarkIcon className="h-4 w-4 mr-1" />
                    Save
                </button>

                {role === "HR" ? (
                    <div className="flex items-center gap-3">
                        {/* Share actions for HR */}
                        <ShareButtons jobId={_id} title={title} /> {/* NEW */}

                        <button
                            onClick={() => router.push(`/hr/dashboard?jobid=${_id}&mode=update`)}
                            className="text-sm text-indigo-300 hover:text-indigo-400 transition"
                        >
                            Edit
                        </button>
                    </div>
                ) : (
                    <Link
                        href={`/job/${_id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition"
                    >
                        View & Apply
                        <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                )}
            </div>
        </div>
    );
}
