import React, { useEffect, useState } from "react";
import { useGlobalState } from "../GlobalStateContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
interface VerifyProps {
    onVerify: () => void;
}

const Verify: React.FC<VerifyProps> = ({ onVerify }) => {
    const context = useGlobalState();
    const navigate = useNavigate();
    const [verificationCode, setVerificationCode] = useState("");
    const token = context.globalState.token;
    console.log(token);

    useEffect(() => {
        if (context.globalState.isLoggedIn) {
            navigate("/");
        } else {
            axios
                .post("/users/verify/send", null, {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [context.globalState.isLoggedIn]);

    const handleVerify = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await axios.post(
                "/users/verify/check",
                {
                    code: verificationCode,
                },
                {
                    headers: { Authorization: "Bearer " + token },
                },
            );
            onVerify();
        } catch (error: any) {
            console.error("Verify failed", error.response.data);
        }
    };
    return (
        <div>
            <h2>We sent a 6 digit verification code to your phone number.</h2>
            <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
            <button onClick={handleVerify}>Verify</button>
        </div>
    );
};

export default Verify;
