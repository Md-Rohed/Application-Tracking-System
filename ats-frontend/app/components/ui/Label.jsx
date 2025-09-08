import React from "react";


export default function Label({ className = "", children, ...props }) {
    return (
        <label className={`block text-sm font-medium text-slate-200 ${className}`} {...props}>
            {children}
        </label>
    );
}