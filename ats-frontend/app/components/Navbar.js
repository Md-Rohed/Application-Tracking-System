"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getRole, removeRole, removeToken } from "@/lib/auth";

// Custom hooks for better organization
function useAuth() {
    const [role, setRole] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    const syncRole = useCallback(() => {
        try {
            setRole(getRole() || null);
        } catch {
            setRole(null);
        }
    }, []);

    useEffect(() => {
        syncRole();
        const onStorage = (e) => e.key === "role" && syncRole();
        const onAuth = () => syncRole();

        window.addEventListener("storage", onStorage);
        window.addEventListener("auth:changed", onAuth);

        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("auth:changed", onAuth);
        };
    }, [syncRole]);

    useEffect(() => {
        syncRole();
    }, [pathname, syncRole]);

    const logout = () => {
        removeToken();
        removeRole();
        window.dispatchEvent(new Event("auth:changed"));
        router.push("/login");
    };

    return { role, logout };
}

function useClickOutside(ref, callback) {
    useEffect(() => {
        const handler = (e) => {
            if (!ref.current || ref.current.contains(e.target)) return;
            callback();
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [ref, callback]);
}

// Navigation configuration
const getNavLinks = (role) => {
    const baseLinks = [{ href: "/", label: "Jobs" }];

    if (role === "HR") {
        return [
            ...baseLinks,
            { href: "/hr/dashboard", label: "Dashboard" },
            { href: "/hr/applicants", label: "Applicants" }
        ];
    }

    if (role === "Applicant") {
        return [
            ...baseLinks,
            { href: "/applications", label: "My Applications" }
        ];
    }

    return baseLinks;
};

// Components
function NavLink({ href, children, isActive, onClick }) {
    const activeClass = isActive
        ? "bg-white/10 text-white shadow-inner"
        : "text-slate-200 hover:text-white hover:bg-white/10";

    return (
        <Link
            href={href}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition ${activeClass}`}
            onClick={onClick}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, children, isActive, onClick }) {
    const activeClass = isActive
        ? "bg-white/10 text-white shadow-inner"
        : "text-slate-200 hover:text-white hover:bg-white/10";

    return (
        <Link
            href={href}
            className={`block px-3 py-2 rounded-xl text-base font-medium ${activeClass}`}
            onClick={onClick}
        >
            {children}
        </Link>
    );
}

function AuthButtons() {
    return (
        <div className="flex items-center gap-2 ml-2">
            <Link
                href="/login"
                className="px-3 py-2 rounded-xl text-sm font-medium text-slate-100 hover:text-white hover:bg-white/10 transition"
            >
                Login
            </Link>
            <Link
                href="/signup"
                className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 transition"
            >
                Sign Up
            </Link>
        </div>
    );
}

function ProfileDropdown({ role, onLogout, isOpen, onToggle, dropdownRef }) {
    return (
        <div className="relative ml-2" ref={dropdownRef}>
            <button
                onClick={onToggle}
                onMouseDown={(e) => e.preventDefault()}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-white/95 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <div className="h-8 w-8 rounded-full bg-slate-900/70 border border-white/10 flex items-center justify-center text-white font-semibold">
                    {(role?.[0] || "U").toUpperCase()}
                </div>
                <span className="hidden sm:inline">My Account</span>
                <ChevronDown className={`h-5 w-5 text-white/80 transition ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div
                    role="menu"
                    aria-label="Profile"
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl"
                >
                    <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10"
                        onClick={() => onToggle(false)}
                        role="menuitem"
                    >
                        Your Profile
                    </Link>
                    <Link
                        href="/settings"
                        className="block px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10"
                        onClick={() => onToggle(false)}
                        role="menuitem"
                    >
                        Settings
                    </Link>
                    <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10"
                        role="menuitem"
                    >
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}

function MobileAuthSection({ role, onLogout, onMenuClose }) {
    if (!role) {
        return (
            <div className="pt-2 border-t border-white/10">
                <Link
                    href="/login"
                    className="block px-3 py-2 rounded-xl text-base font-medium text-slate-100 hover:text-white hover:bg-white/10"
                    onClick={onMenuClose}
                >
                    Login
                </Link>
                <Link
                    href="/signup"
                    className="mt-1 block px-3 py-2 rounded-xl text-base font-semibold text-slate-900 bg-white hover:bg-slate-100"
                    onClick={onMenuClose}
                >
                    Sign Up
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-2 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 pb-2">
                <div className="h-9 w-9 rounded-full bg-slate-900/70 border border-white/10 flex items-center justify-center text-white font-semibold">
                    {(role?.[0] || "U").toUpperCase()}
                </div>
                <div>
                    <div className="text-sm font-medium text-white">User</div>
                    <div className="text-xs text-slate-300">{role}</div>
                </div>
            </div>

            <Link
                href="/profile"
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-200 hover:bg-white/10"
                onClick={onMenuClose}
            >
                Your Profile
            </Link>
            <Link
                href="/settings"
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-200 hover:bg-white/10"
                onClick={onMenuClose}
            >
                Settings
            </Link>
            <button
                onClick={() => {
                    onMenuClose();
                    onLogout();
                }}
                className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-rose-300 hover:bg-rose-500/10"
            >
                Sign out
            </button>
        </div>
    );
}

// Main component
export default function Navbar() {
    const { role, logout } = useAuth();
    const pathname = usePathname();

    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useClickOutside(profileRef, () => setProfileOpen(false));

    const isActive = (path) => {
        return pathname === path || (path !== "/" && pathname.startsWith(path));
    };

    const navLinks = getNavLinks(role);

    const handleProfileLogout = () => {
        setProfileOpen(false);
        logout();
    };

    const closeMenu = () => setMenuOpen(false);
    const toggleProfile = () => setProfileOpen(prev => !prev);

    return (
        <header className="sticky top-0 z-50">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <nav className="backdrop-blur-xl bg-white/5 border-b border-white/10">
                    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Brand */}
                            <Link href="/" className="group inline-flex items-center gap-2">
                                <LogoMark className="h-8 w-8 text-white/90 group-hover:text-white transition" />
                                <span className="text-white font-semibold text-lg tracking-tight">ATS</span>
                            </Link>

                            {/* Desktop nav */}
                            <div className="hidden md:flex items-center gap-1">
                                {navLinks.map(({ href, label }) => (
                                    <NavLink key={href} href={href} isActive={isActive(href)}>
                                        {label}
                                    </NavLink>
                                ))}

                                {!role ? (
                                    <AuthButtons />
                                ) : (
                                    <ProfileDropdown
                                        role={role}
                                        onLogout={handleProfileLogout}
                                        isOpen={profileOpen}
                                        onToggle={toggleProfile}
                                        dropdownRef={profileRef}
                                    />
                                )}
                            </div>

                            {/* Mobile toggle */}
                            <button
                                onClick={() => setMenuOpen(prev => !prev)}
                                className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                aria-label="Toggle menu"
                                aria-expanded={menuOpen}
                            >
                                {menuOpen ? <XIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    <div
                        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                            }`}
                    >
                        <div className="px-3 pt-2 pb-4 space-y-1 border-t border-white/10 bg-white/5">
                            {navLinks.map(({ href, label }) => (
                                <MobileNavLink
                                    key={href}
                                    href={href}
                                    isActive={isActive(href)}
                                    onClick={closeMenu}
                                >
                                    {label}
                                </MobileNavLink>
                            ))}

                            <MobileAuthSection
                                role={role}
                                onLogout={logout}
                                onMenuClose={closeMenu}
                            />
                        </div>
                    </div>
                </nav>
            </div>

            {/* Mobile menu overlay */}
            <div
                className={`md:hidden fixed inset-0 bg-black/40 transition-opacity ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={closeMenu}
            />
        </header>
    );
}

// Icon components
function MenuIcon({ className = "h-6 w-6" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function XIcon({ className = "h-6 w-6" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

function ChevronDown({ className = "h-5 w-5" }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    );
}

function LogoMark({ className = "h-8 w-8" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 12h3M12 16h3M9 12h.01M9 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}