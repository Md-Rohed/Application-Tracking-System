// ----------------------------------------
// components/icons/UploadIcon.jsx
// ----------------------------------------
export default function UploadIcon({ className = "h-5 w-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 16V4m0 0l4 4m-4-4L8 8" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 14v5a2 2 0 002 2h14a2 2 0 002-2v-5" />
        </svg>
    );
}