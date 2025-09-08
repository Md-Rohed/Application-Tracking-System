export default function TagIcon({ className = "h-5 w-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M7 7h4l7 7-4 4-7-7V7z" />
            <circle cx="9" cy="9" r="1.25" fill="currentColor" />
        </svg>
    );
}
