import React from "react";

export default function Loader({ className = "h-4 w-4" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path d="M22 12a10 10 0 0 1-10 10" fill="currentColor" />
        </svg>
    );
}
