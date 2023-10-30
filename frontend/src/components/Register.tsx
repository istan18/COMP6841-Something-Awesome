import React, { useState } from "react";
import axios from "axios";
import validator from "validator";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import ReCAPTCHA from "react-google-recaptcha";
import { getPasswordColor, getPasswordStrength, handleGeneratePassword } from "../utils";
interface RegisterProps {
    onRegister: (uId: string, key: string) => void;
}

function isValidPhoneNumber(phoneNumber: string) {
    const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, "AU");
    return parsedPhoneNumber && parsedPhoneNumber.isValid();
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [captcha, setCaptcha] = useState("");

    const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (username.length < 5) {
            console.error("Username is too short");
            return;
        } else if (getPasswordStrength(password) !== "good" && getPasswordStrength(password) !== "strong") {
            console.error("Password is not secure enough");
            return;
        } else if (!validator.isEmail(email)) {
            console.error("Invalid email inputted");
            return;
        } else if (!isValidPhoneNumber(phoneNumber)) {
            console.error("Phone number is invalid");
            return;
        } else if (password !== confirmPassword) {
            console.error("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post("/users/register", {
                username,
                password,
                firstName,
                lastName,
                email,
                phoneNumber,
                captcha,
            });
            onRegister(response.data.uId, response.data.key);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <br />
            <label>
                First Name:
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <br />
            <label>
                Last Name:
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
            <label>
                Username:
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <br />
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
            <label>
                Email:
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <br />
            <label>
                Phone Number:
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </label>
            <ReCAPTCHA
                sitekey="6LdporEoAAAAAP336VV1NAYb1tiX90Fl5NZU9oQm"
                onChange={(value) => setCaptcha(value as string)}
            />
            <button onClick={handleRegister}>Register</button>
        </div>
    );
};

export default Register;
