import React from "react";


export default function FormError({ children, style }) {
    return <p className={`text-xs text-rose-400 ${style} `}>{children}</p>;
}