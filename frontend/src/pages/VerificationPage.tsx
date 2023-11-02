import Verify from "../components/Verify";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const VerificationPage = () => {
    const navigate = useNavigate();
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
        localStorage.setItem("token", token);
        navigate("/");
    };

    return <Verify onVerify={onVerify} />;
};

export default VerificationPage;
