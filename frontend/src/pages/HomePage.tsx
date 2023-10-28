import { useEffect, useState } from "react";
import { useGlobalState } from "../GlobalStateContext";
import { useNavigate } from "react-router-dom";
import PinPad from "../components/PinPad";
import axios from "axios";
import { resetPasscodeTimeout } from "../utils";

const HomePage = () => {
    const context = useGlobalState();
    const navigate = useNavigate();
    const [passcode, setPasscode] = useState<string | null>(null);
    const [hasPasscode, setHasPasscode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        resetPasscodeTimeout(setTimeoutId, timeoutId, context);

        const resetTimeoutOnActivity = () => {
            resetPasscodeTimeout(setTimeoutId, timeoutId, context);
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
        if (!context.globalState.uId && !context.globalState.token) {
            navigate("/register");
        } else if (!context.globalState.token && context.globalState.uId) {
            navigate("/verify");
        } else {
            getPasscode();
        }

        return () => {};
    }, [context.globalState.uId, context.globalState.token]);

    const getPasscode = async () => {
        try {
            const response = await axios.get("/users/passcode", {
                headers: {
                    Authorization: `Bearer ${context.globalState.token}`,
                },
            });
            console.log(response);
            setPasscode(response.data.passcode);
            setHasPasscode(true);
            console.log(hasPasscode);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    return (
        (context.globalState.token && (
            <div>
                <div>
                    {loading ? (
                        <div>Loading...</div>
                    ) : context.globalState.access ? (
                        <h1>Welcome!</h1>
                    ) : (
                        <PinPad
                            setPasscode={setPasscode}
                            passcode={passcode}
                            text={hasPasscode ? "Enter PIN" : passcode ? "Verify PIN code" : "Set PIN code"}
                            setTimeoutId={setTimeoutId}
                            timeoutId={timeoutId}
                        ></PinPad>
                    )}
                </div>
            </div>
        )) || <div></div>
    );
};

export default HomePage;
