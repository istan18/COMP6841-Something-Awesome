import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PinPad from "../components/PinPad";
import axios from "axios";
import Home from "../components/Home";
import { resetPasscodeTimeout } from "../utils";

const HomePage = () => {
    const [access, setAccess] = useState<boolean>(false);
    const navigate = useNavigate();
    const [passcode, setPasscode] = useState<string | null>(null);
    const [hasPasscode, setHasPasscode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const token = localStorage.getItem("token");
    const uId = localStorage.getItem("uId");

    useEffect(() => {
        resetPasscodeTimeout(setTimeoutId, timeoutId, setAccess);

        const resetTimeoutOnActivity = () => {
            resetPasscodeTimeout(setTimeoutId, timeoutId, setAccess);
        };

        window.addEventListener("mousemove", resetTimeoutOnActivity);
        window.addEventListener("keydown", resetTimeoutOnActivity);

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            window.removeEventListener("mousemove", resetTimeoutOnActivity);
            window.removeEventListener("keydown", resetTimeoutOnActivity);
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
        } catch (error) {
            console.log(error);
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
                    setTimeoutId={setTimeoutId}
                    timeoutId={timeoutId}
                ></PinPad>
            ))) || <div></div>
    );
};

export default HomePage;
