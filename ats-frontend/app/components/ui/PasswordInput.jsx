import React, { useState } from "react";
import Input from "./Input";
import EyeOff from "../icon/EyeOff";
import Eye from "../icon/Eye";



const PasswordInput = React.forwardRef(function PasswordInput({ className = "", ...props }, ref) {
    return (
        <div className="relative">
            <Input ref={ref} type="password" className={`pr-12 ${className}`} {...props} />

        </div>
    );
});


export default PasswordInput;