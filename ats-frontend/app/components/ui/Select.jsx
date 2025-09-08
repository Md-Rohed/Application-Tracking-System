import React from "react";
import ReactSelect from "react-select";


const customStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: "rgba(15, 23, 42, 0.6)", // slate-900/60
        borderColor: state.isFocused ? "#6366f1" : "rgba(255,255,255,0.1)", // indigo-500 or white/10
        boxShadow: state.isFocused ? "0 0 0 2px #6366f1" : "none",
        borderRadius: "0.75rem", // rounded-xl
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        minHeight: "2.75rem",
    }),
    singleValue: (base) => ({ ...base, color: "#e5e7eb" }), // text-slate-200
    placeholder: (base) => ({ ...base, color: "#6b7280" }), // text-slate-500
    menu: (base) => ({ ...base, backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }), // slate-900
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? "#4f46e5" : state.isFocused ? "#1f2937" : "transparent", // indigo-600 / gray-800
        color: state.isSelected ? "white" : "#e5e7eb",
        cursor: "pointer",
    }),
    input: (base) => ({ ...base, color: "#e5e7eb" }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? "#c7d2fe" : "#94a3b8",
        ":hover": { color: "#ffffff" },
    }),
    indicatorSeparator: () => ({ display: "none" }),
    valueContainer: (base) => ({ ...base, padding: "0 0.5rem" }),
};


export default function Select({ className = "", ...props }) {
    return (
        <ReactSelect
            styles={customStyles}
            className={className}
            classNamePrefix="rs"
            {...props}
        />
    );
}