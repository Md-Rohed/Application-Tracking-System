"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

export default function ShareButtons({ jobId, title = "Job" }) {
    const [open, setOpen] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState("");

    // Build canonical URL to this job
    const url = useMemo(() => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/job/${jobId}`;
    }, [jobId]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            // swap alert with your toast if you have one
            alert("Link copied to clipboard.");
        } catch {
            alert("Failed to copy. Please copy manually:\n" + url);
        }
    };

    const webShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch {
                /* user cancelled or share failed; ignore */
            }
        } else {
            // Fallback: just copy
            copyLink();
        }
    };

    // Generate QR when modal opens
    useEffect(() => {
        let active = true;
        const gen = async () => {
            if (!open || !url) return;
            try {
                const dataUrl = await QRCode.toDataURL(url, {
                    margin: 1,
                    width: 256,
                    errorCorrectionLevel: "M",
                });
                if (active) setQrDataUrl(dataUrl);
            } catch (e) {
                console.error(e);
            }
        };
        gen();
        return () => {
            active = false;
        };
    }, [open, url]);

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={copyLink}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/15 transition"
                    title="Copy link"
                >
                    Copy Link
                </button>
                <button
                    type="button"
                    onClick={webShare}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/15 transition"
                    title="Share"
                >
                    Share…
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs text-indigo-200 hover:bg-indigo-600/30 transition"
                    title="Show QR"
                >
                    QR Code
                </button>
            </div>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setOpen(false)}
                    />
                    <div className="relative z-[101] w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6">
                        <h3 className="text-white font-semibold text-lg">
                            Scan to open job
                        </h3>
                        <p className="text-slate-300 text-sm mt-1 break-all">{url}</p>

                        <div className="mt-4 flex items-center justify-center">
                            {qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt="QR code"
                                    className="rounded-lg border border-white/10 bg-white"
                                />
                            ) : (
                                <div className="h-48 w-48 rounded-lg border border-white/10 bg-white/5 animate-pulse" />
                            )}
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                            <a
                                href={qrDataUrl || "#"}
                                download={`job-${jobId}-qr.png`}
                                className="rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/15 transition disabled:opacity-50"
                                onClick={(e) => {
                                    if (!qrDataUrl) e.preventDefault();
                                }}
                            >
                                Download PNG
                            </a>
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
