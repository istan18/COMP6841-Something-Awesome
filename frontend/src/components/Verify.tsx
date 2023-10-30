import React, { useEffect, useState } from "react";
import { useGlobalState } from "../GlobalStateContext";
import axios from "axios";
interface VerifyProps {
    onVerify: (token: string) => void;
}

const Verify: React.FC<VerifyProps> = ({ onVerify }) => {
    const context = useGlobalState();
    const [verifiedPhone, setVerifiedPhone] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState(false);
    const uId = context.globalState.uId;

    const [verificationCode, setVerificationCode] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!verifiedPhone && !verifiedEmail) {
                    await sendVerification("mobile");
                } else if (!verifiedEmail && verifiedPhone) {
                    setVerificationCode("");
                    await sendVerification("email");
                }
            } catch (error) {
                console.error("Verification failed", error);
            }
        };

        fetchData();
    }, [verifiedPhone, verifiedEmail]);

    const sendVerification = async (type: string) => {
        try {
            const response = await axios.post(`/users/verify/${type}/send`, { uId });
            console.log(response);
        } catch (error: any) {
            console.error("Send verification failed", error.response.data);
        }
    };

    const handleVerify = async (e: React.MouseEvent<HTMLButtonElement>, type: string) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/users/verify/${type}/check`, {
                code: verificationCode,
                uId,
            });
            if (type === "mobile") {
                setVerifiedPhone(true);
            } else {
                setVerifiedEmail(true);
                console.log(response.data.token);
                onVerify(response.data.token);
                localStorage.setItem("token", response.data.token);
            }
        } catch (error: any) {
            console.error("Verify failed", error.response.data);
        }
    };
    return (
        (!verifiedPhone && !verifiedEmail && (
            <div>
                <h2>We sent a 6 digit verification code to your phone number.</h2>
                <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                <button onClick={(e) => handleVerify(e, "mobile")}>Verify Phone</button>
                <button onClick={() => sendVerification("mobile")}>Send code again</button>
            </div>
        )) ||
        (!verifiedEmail && verifiedPhone && (
            <div>
                <h2>We also sent a 6 digit verification code to your email address.</h2>
                <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                <button onClick={(e) => handleVerify(e, "email")}>Verify Email</button>
                <button onClick={() => sendVerification("email")}>Send code again</button>
            </div>
        )) || <div>Account is verified</div>
    );
};

export default Verify;
