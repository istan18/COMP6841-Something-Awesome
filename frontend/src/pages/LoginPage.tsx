import Login from "../components/Login";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const uId = localStorage.getItem("uId");

    useEffect(() => {
        if (token && uId) {
            navigate("/");
        }
    }, []);

    const handleLogin = (uId: string, key: string) => {
        localStorage.setItem("uId", uId);
        localStorage.setItem("key", key);
        navigate("/verify");
    };

    return <Login onLogin={handleLogin} />;
};

export default LoginPage;
