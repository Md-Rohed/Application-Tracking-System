import React from "react";

export default function Button({ className = "", children, ...props }) {
    const base = [
        "rounded-xl px-4 py-2.5 font-semibold",
        "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700",
        "text-white shadow-lg shadow-indigo-900/30",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900",
        "disabled:opacity-60 disabled:cursor-not-allowed transition"
    ].join(" ");
    return (
        <button className={`${base} ${className}`} {...props}>
            {children}
        </button>
    );
}