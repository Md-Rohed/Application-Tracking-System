import React from "react";


export default function Eye({ className = "h-5 w-5" }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.088.27.088.56 0 .644C20.577 16.49 16.64 19 12 19s-8.577-2.51-9.964-6.678z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}