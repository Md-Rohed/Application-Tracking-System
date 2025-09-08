"use client";
import React from "react";
import JobDetails from "@/app/components/JobDetails";

export default function Job({ params }) {
    const { id } = React.use(params);

    return <JobDetails jobId={id} />;
}
