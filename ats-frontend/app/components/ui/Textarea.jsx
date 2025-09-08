import React from "react";

const Textarea = React.forwardRef(function Textarea({ className = "", ...props }, ref) {
    const base = [
        "w-full rounded-xl bg-slate-900/60 text-slate-100 placeholder:text-slate-500",
        "border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
        "px-4 py-2.5 transition",
    ].join(" ");
    return <textarea ref={ref} className={`${base} ${className}`} {...props} />;
});

export default Textarea;
