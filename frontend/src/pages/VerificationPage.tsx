import Verify from "../components/Verify";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../GlobalStateContext";
import { useEffect } from "react";

const VerificationPage = () => {
    const context = useGlobalState();
    const navigate = useNavigate();
    const setGlobalState = context.setGlobalState;
    const token = localStorage.getItem("token");
    const uId = localStorage.getItem("uId");

    useEffect(() => {
        if (token && uId) {
            navigate("/");
        } else if (!uId) {
            navigate("/login");
        }
    }, [uId, token]);

    const onVerify = (token: string) => {
        setGlobalState((state) => ({
            ...state,
            token,
        }));
        navigate("/");
    };

    return <Verify onVerify={onVerify} />;
};

export default VerificationPage;
