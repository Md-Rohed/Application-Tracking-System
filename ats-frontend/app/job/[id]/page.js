"use client";
import React from "react";
import JobDetails from "@/app/components/JobDetails";
import { getJobsById } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function Job({ params }) {
    const { id } = React.use(params);

    const { data: job, isLoading, error } = useQuery({
        queryKey: ["job", id],
        queryFn: () => getJobsById(id),
    });

    return <JobDetails job={job} isLoading={isLoading} error={error} jobId={id} />;
}