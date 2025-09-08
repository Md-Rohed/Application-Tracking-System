
import React from "react";

export default function Badge({ className = "", children }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${className}`}>
            {children}
        </span>
    );
}