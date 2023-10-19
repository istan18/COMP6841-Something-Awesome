import Verify from "../components/Verify";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../GlobalStateContext";
import { useEffect } from "react";

const VerificationPage = () => {
    const context = useGlobalState();
    const navigate = useNavigate();
    const setGlobalState = context.setGlobalState;

    useEffect(() => {
        if (context.globalState.isLoggedIn) {
            navigate("/");
        }
    }, [context.globalState.isLoggedIn]);

    const onVerify = () => {
        setGlobalState((state) => ({
            ...state,
            isLoggedIn: true,
        }));
    };

    return (
        <div>
            <Verify onVerify={onVerify} />
        </div>
    );
};

export default VerificationPage;
