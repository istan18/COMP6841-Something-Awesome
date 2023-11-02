import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PinPad from "../components/PinPad";
import axios from "axios";
import Home from "../components/Home";
import { resetPasscodeTimeout } from "../utils";
import React from "react";

const HomePage = () => {
    const [access, setAccess] = useState<boolean>(false);
    const navigate = useNavigate();
    const [passcode, setPasscode] = useState<string | null>(null);
    const [hasPasscode, setHasPasscode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem("token");
    const uId = localStorage.getItem("uId");
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // resetPasscodeTimeout(setTimeoutId, timeoutId, setAccess);

        const resetTimeoutOnActivity = () => {
            resetPasscodeTimeout(timeoutIdRef, setAccess);
        };

        window.addEventListener("mousemove", resetTimeoutOnActivity);
        window.addEventListener("keydown", resetTimeoutOnActivity);
        window.addEventListener("click", resetTimeoutOnActivity);
        window.addEventListener("scroll", resetTimeoutOnActivity);
        window.addEventListener("resize", resetTimeoutOnActivity);

        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
            window.removeEventListener("mousemove", resetTimeoutOnActivity);
            window.removeEventListener("keydown", resetTimeoutOnActivity);
            window.removeEventListener("click", resetTimeoutOnActivity);
            window.removeEventListener("scroll", resetTimeoutOnActivity);
            window.removeEventListener("resize", resetTimeoutOnActivity);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (!uId && !token) {
            navigate("/register");
        } else if (!token && uId) {
            navigate("/verify");
        } else {
            if (isMounted) getPasscode();
        }

        return () => {
            isMounted = false;
        };
    }, []);

    const getPasscode = async () => {
        try {
            const response = await axios.get("/users/passcode", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPasscode(response.data.passcode);
            setHasPasscode(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.response.status === 498) {
                localStorage.removeItem("token");
                localStorage.removeItem("key");
                localStorage.removeItem("uId");
                navigate("/login");
            }
        }
        setLoading(false);
    };

    return (
        (token &&
            (loading ? (
                <div>Loading...</div>
            ) : access ? (
                <Home />
            ) : (
                <PinPad
                    setPasscode={setPasscode}
                    setHasPasscode={setHasPasscode}
                    setAccess={setAccess}
                    passcode={passcode}
                    text={hasPasscode ? "Enter PIN" : passcode ? "Verify PIN code" : "Set PIN code"}
                    timeoutIdRef={timeoutIdRef}
                ></PinPad>
            ))) || <div></div>
    );
};

export default HomePage;
