import Verify from "../components/Verify";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../GlobalStateContext";
import { useEffect } from "react";

const VerificationPage = () => {
    const context = useGlobalState();
    const navigate = useNavigate();
    const setGlobalState = context.setGlobalState;

    useEffect(() => {
        if (context.globalState.uId && context.globalState.token) {
            navigate("/");
        } else if (!context.globalState.uId) {
            navigate("/login");
        }
    }, [context.globalState.uId, context.globalState.token]);

    const onVerify = (token: string) => {
        setGlobalState((state) => ({
            ...state,
            token,
        }));
        navigate("/");
    };

    return (
        <div>
            <Verify onVerify={onVerify} />
        </div>
    );
};

export default VerificationPage;
