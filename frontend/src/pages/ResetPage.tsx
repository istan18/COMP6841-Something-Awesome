import axios from "axios";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPasswordColor, getPasswordStrength, handleGeneratePassword } from "../utils";

const ResetPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const params = useParams();
    const token = params.token;

    const handleSendReset = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await axios.post("/users/reset", {
                email,
            });
            console.log("Reset email sent");
        } catch (error) {
            console.error(error);
        }
        alert("If the email is valid, check it for the reset link");
    };

    const handleResetPassword = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (getPasswordStrength(password) !== "good" || getPasswordStrength(password) != "strong") {
            console.error("Password is not secure enough");
            return;
        } else if (password !== confirmPassword) {
            console.error("Passwords do not match");
            return;
        }
        try {
            await axios.post(`/users/reset/${token}`, {
                password,
            });
            alert("Password reset successfully");
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };
    return !token ? (
        <div>
            <label>
                Enter email:
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button onClick={handleSendReset}>Reset</button>
            </label>
        </div>
    ) : (
        <div>
            <label>
                Password:
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ outlineColor: getPasswordColor(password) }}
                />
            </label>
            <button onClick={(e) => handleGeneratePassword(e, setPassword)}>Generate password</button>
            <br />
            <label>
                Confirm Password:
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </label>
            <button onClick={handleResetPassword}>Reset Password</button>
        </div>
    );
};

export default ResetPage;
