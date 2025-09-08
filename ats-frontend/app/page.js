"use client";

import { getJobs } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import JobCard from "./components/JobCard";
import { useState } from "react";

export default function Home() {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
  });

  const [filters, setFilters] = useState({ location: "", jobType: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = jobs
    ? jobs.filter((job) => {
      return (
        (searchTerm === "" ||
          job.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filters.location === "" || job.location === filters.location) &&
        (filters.jobType === "" || job.type === filters.jobType)
      );
    })
    : [];

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-indigo-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6">
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-xl px-4 py-3 text-rose-200 max-w-lg">
          Error: {error.message}
        </div>
      </div>
    );

  const locations = jobs ? [...new Set(jobs.map((job) => job.location))] : [];
  const jobTypes = jobs ? [...new Set(jobs.map((job) => job.type || "Full-time"))] : [];

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <div className="py-16 px-4 text-center border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Find Your Dream Job
          </h1>
          <p className="mt-2 text-slate-300">
            Browse open positions and take the next step in your career journey.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-2 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search job titles..."
              className="flex-grow rounded-lg bg-slate-900/60 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow hover:bg-indigo-500 transition">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>

            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-1">Location</label>
              <select
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="">All Locations</option>
                {locations.map((loc, i) => (
                  <option key={i} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-1">Job Type</label>
              <select
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500"
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              >
                <option value="">All Types</option>
                {jobTypes.map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setFilters({ location: "", jobType: "" });
                setSearchTerm("");
              }}
              className="w-full rounded-lg bg-white/10 px-4 py-2 text-slate-200 hover:bg-white/15 transition"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Listings */}
        <main className="w-full md:w-3/4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              Available Jobs{" "}
              <span className="ml-2 text-slate-400 font-medium text-lg">
                ({filteredJobs.length})
              </span>
            </h2>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center text-slate-300">
              No jobs found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
