import React from "react";


export default function EyeOff({ className = "h-5 w-5" }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M3 3l18 18M9.88 5.1A9.53 9.53 0 0112 5c5 0 9.27 3.11 10.5 7.5a10.67 10.67 0 01-3.12 4.8M6.1 6.1C3.86 7.52 2.2 9.64 1.5 12.5 2.73 16.89 7 20 12 20c1.1 0 2.17-.16 3.16-.46" />
        </svg>
    );
}