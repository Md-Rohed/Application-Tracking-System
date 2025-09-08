export default function MapPinIcon({ className = "h-5 w-5", ...props }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" {...props}>
            <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M12 11a3 3 0 100-6 3 3 0 000 6z" />
            <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M19.5 9.5c0 5.25-7.5 11-7.5 11S4.5 14.75 4.5 9.5a7.5 7.5 0 1115 0z" />
        </svg>
    );
}
