import React, { useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

interface LoginProps {
    onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [captcha, setCaptcha] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post("/users/login", {
                username,
                password,
                captcha,
            });
            onLogin(response.data.token);
        } catch (error: any) {
            console.error("Login failed", error.response.data);
            if (error.response.data.locked) {
                alert("Your account has been locked, please try again later");
            }
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <label>
                Username:
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <br />
            <label>
                Password:
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <br />
            <ReCAPTCHA
                sitekey="6LdporEoAAAAAP336VV1NAYb1tiX90Fl5NZU9oQm"
                onChange={(value) => setCaptcha(value as string)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;
